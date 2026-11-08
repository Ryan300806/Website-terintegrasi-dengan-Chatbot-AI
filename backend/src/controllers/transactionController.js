const pool = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");

const {
    httpError,
    requireText,
    positiveInt,
    positiveMoney,
    pagination
} = require("../utils/validators");

// GENERATE INVOICE NUMBER
function generateInvoiceNumber() {
    const now = new Date();

    const date =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0");

    const unique = Date.now().toString().slice(-8);

    return `INV-${date}-${unique}`;
}

// CREATE TRANSACTION
exports.createTransaction = asyncHandler(async (req, res) => {
    const items = req.body.items;

    if (!Array.isArray(items) || items.length === 0) {
        throw httpError(400, "Item transaksi tidak boleh kosong");
    }

    if (items.length > 100) {
        throw httpError(400, "Maksimal 100 item dalam satu transaksi");
    }

    const paymentMethod = requireText(
        req.body.payment_method,
        "Metode pembayaran",
        30
    );

    const amountPaid = positiveMoney(
        req.body.amount_paid,
        "Jumlah pembayaran",
        true
    );

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        let totalAmount = 0;
        const transactionItems = [];

        // Validasi produk dan ambil harga terkini
        for (const item of items) {
            const productId = positiveInt(
                item.product_id,
                "ID produk"
            );

            const quantity = positiveInt(
                item.quantity,
                "Kuantitas"
            );

            const rows = await connection.query(
                `SELECT product_id, product_name, price, status
                 FROM products
                 WHERE product_id = ?
                 FOR UPDATE`,
                [productId]
            );

            const product = rows[0];

            if (!product || product.status !== "active") {
                throw httpError(
                    400,
                    `Produk ${productId} tidak ditemukan atau tidak aktif`
                );
            }

            const unitPrice = Number(product.price);

            const subtotal = Math.round(
                unitPrice * quantity * 100
            ) / 100;

            totalAmount = Math.round(
                (totalAmount + subtotal) * 100
            ) / 100;

            transactionItems.push({
                productId,
                quantity,
                unitPrice,
                subtotal
            });
        }

        if (amountPaid < totalAmount) {
            throw httpError(
                400,
                "Jumlah pembayaran kurang dari total transaksi"
            );
        }

        const changeAmount = Math.round(
            (amountPaid - totalAmount) * 100
        ) / 100;

        const invoiceNumber = generateInvoiceNumber();

        // Simpan transaksi utama
        const transactionResult = await connection.query(
            `INSERT INTO transactions
             (
                invoice_number,
                cashier_id,
                transaction_date,
                total_amount,
                payment_method,
                amount_paid,
                change_amount,
                status
             )
             VALUES (?, ?, NOW(), ?, ?, ?, ?, 'completed')`,
            [
                invoiceNumber,
                req.user.user_id,
                totalAmount,
                paymentMethod,
                amountPaid,
                changeAmount
            ]
        );

        const transactionId = Number(
            transactionResult.insertId
        );

        // Simpan detail transaksi
        for (const item of transactionItems) {
            await connection.query(
                `INSERT INTO transaction_details
                 (
                    transaction_id,
                    product_id,
                    quantity,
                    unit_price,
                    subtotal
                 )
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    transactionId,
                    item.productId,
                    item.quantity,
                    item.unitPrice,
                    item.subtotal
                ]
            );
        }

        await connection.commit();

        res.status(201).json({
            status: "success",
            message: "Transaksi berhasil disimpan",
            data: {
                transaction_id: transactionId,
                invoice_number: invoiceNumber,
                total_amount: totalAmount,
                amount_paid: amountPaid,
                change_amount: changeAmount
            }
        });

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
});

// GET TRANSACTIONS
// Admin: seluruh transaksi
// Kasir: hanya transaksi miliknya
exports.getTransactions = asyncHandler(async (req, res) => {
    const { page, limit, offset } = pagination(req.query);

    const conditions = [];
    const params = [];

    if (req.user.role === "kasir") {
        conditions.push("t.cashier_id = ?");
        params.push(req.user.user_id);
    }

    if (req.query.status) {
        if (!["completed", "canceled"].includes(req.query.status)) {
            throw httpError(400, "Status transaksi tidak valid");
        }

        conditions.push("t.status = ?");
        params.push(req.query.status);
    }

    if (req.query.date_from) {
        conditions.push("DATE(t.transaction_date) >= ?");
        params.push(req.query.date_from);
    }

    if (req.query.date_to) {
        conditions.push("DATE(t.transaction_date) <= ?");
        params.push(req.query.date_to);
    }

    const where = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const count = await pool.query(
        `SELECT COUNT(*) AS total
         FROM transactions t
         ${where}`,
        params
    );

    const transactions = await pool.query(
        `SELECT
            t.transaction_id,
            t.invoice_number,
            t.cashier_id,
            u.name AS cashier_name,
            t.transaction_date,
            t.total_amount,
            t.payment_method,
            t.amount_paid,
            t.change_amount,
            t.status,
            t.canceled_by,
            t.canceled_at,
            t.cancellation_reason
         FROM transactions t
         JOIN users u ON u.user_id = t.cashier_id
         ${where}
         ORDER BY t.transaction_date DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
    );

    res.json({
        status: "success",
        data: transactions,
        pagination: {
            page,
            limit,
            total: Number(count[0].total)
        }
    });
});

// GET TRANSACTION DETAIL
exports.getTransactionById = asyncHandler(async (req, res) => {
    const id = positiveInt(
        req.params.id,
        "ID transaksi"
    );

    const rows = await pool.query(
        `SELECT
            t.*,
            u.name AS cashier_name
         FROM transactions t
         JOIN users u ON u.user_id = t.cashier_id
         WHERE t.transaction_id = ?`,
        [id]
    );

    const transaction = rows[0];

    if (!transaction) {
        throw httpError(404, "Transaksi tidak ditemukan");
    }

    // Kasir hanya boleh melihat transaksinya sendiri
    if (
        req.user.role === "kasir" &&
        Number(transaction.cashier_id) !== Number(req.user.user_id)
    ) {
        throw httpError(
            403,
            "Kamu hanya dapat melihat transaksi milik sendiri"
        );
    }

    const details = await pool.query(
        `SELECT
            td.detail_id,
            td.product_id,
            p.product_name,
            td.quantity,
            td.unit_price,
            td.subtotal
         FROM transaction_details td
         LEFT JOIN products p
            ON p.product_id = td.product_id
         WHERE td.transaction_id = ?`,
        [id]
    );

    res.json({
        status: "success",
        data: {
            ...transaction,
            details
        }
    });
});

// CANCEL TRANSACTION
exports.cancelTransaction = asyncHandler(async (req, res) => {
    const id = positiveInt(
        req.params.id,
        "ID transaksi"
    );

    const reason = requireText(
        req.body.reason,
        "Alasan pembatalan",
        2000
    );

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const rows = await connection.query(
            `SELECT transaction_id, status
             FROM transactions
             WHERE transaction_id = ?
             FOR UPDATE`,
            [id]
        );

        const transaction = rows[0];

        if (!transaction) {
            throw httpError(404, "Transaksi tidak ditemukan");
        }

        if (transaction.status !== "completed") {
            throw httpError(
                409,
                "Transaksi hanya dapat dibatalkan jika berstatus completed"
            );
        }

        await connection.query(
            `UPDATE transactions
             SET status = 'canceled',
                 canceled_by = ?,
                 canceled_at = NOW(),
                 cancellation_reason = ?
             WHERE transaction_id = ?`,
            [
                req.user.user_id,
                reason,
                id
            ]
        );

        await connection.commit();

        res.json({
            status: "success",
            message: "Transaksi berhasil dibatalkan"
        });

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
});