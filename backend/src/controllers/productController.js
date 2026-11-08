const pool = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");

const {
    httpError,
    requireText,
    positiveInt,
    positiveMoney,
    pagination
} = require("../utils/validators");

// GET ALL PRODUCTS
exports.getAllProducts = asyncHandler(async (req, res) => {
    const { page, limit, offset } = pagination(req.query);

    const conditions = [];
    const params = [];

    // Kasir hanya melihat produk aktif
    if (req.user.role === "kasir") {
        conditions.push("p.status = 'active'");
    }

    if (req.user.role === "admin" && req.query.status) {
        conditions.push("p.status = ?");
        params.push(req.query.status);
    }

    if (req.query.category_id) {
        conditions.push("p.category_id = ?");
        params.push(
            positiveInt(req.query.category_id, "ID kategori")
        );
    }

    if (req.query.search) {
        conditions.push("p.product_name LIKE ?");
        params.push(`%${String(req.query.search).trim()}%`);
    }

    const where = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const count = await pool.query(
        `SELECT COUNT(*) AS total
         FROM products p
         ${where}`,
        params
    );

    const products = await pool.query(
        `SELECT
            p.product_id,
            p.category_id,
            c.category_name,
            p.product_name,
            p.description,
            p.price,
            p.status,
            p.created_at,
            p.updated_at
         FROM products p
         LEFT JOIN categories c
            ON c.category_id = p.category_id
         ${where}
         ORDER BY p.product_name
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
    );

    res.json({
        status: "success",
        data: products,
        pagination: {
            page,
            limit,
            total: Number(count[0].total)
        }
    });
});

// GET PRODUCT BY ID
exports.getProductById = asyncHandler(async (req, res) => {
    const id = positiveInt(req.params.id, "ID produk");

    const rows = await pool.query(
        `SELECT
            p.*,
            c.category_name
         FROM products p
         LEFT JOIN categories c
            ON c.category_id = p.category_id
         WHERE p.product_id = ?`,
        [id]
    );

    const product = rows[0];

    if (
        !product ||
        (req.user.role === "kasir" && product.status !== "active")
    ) {
        throw httpError(404, "Produk tidak ditemukan");
    }

    res.json({
        status: "success",
        data: product
    });
});

// CREATE PRODUCT
exports.createProduct = asyncHandler(async (req, res) => {
    const categoryId = positiveInt(
        req.body.category_id,
        "ID kategori"
    );

    const category = await pool.query(
        "SELECT category_id FROM categories WHERE category_id = ?",
        [categoryId]
    );

    if (!category[0]) {
        throw httpError(400, "Kategori tidak ditemukan");
    }

    const productName = requireText(
        req.body.product_name,
        "Nama produk",
        150
    );

    const description = req.body.description || null;

    const price = positiveMoney(
        req.body.price,
        "Harga produk"
    );

    const result = await pool.query(
        `INSERT INTO products
         (category_id, product_name, description,
          price, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'active', NOW(), NOW())`,
        [
            categoryId,
            productName,
            description,
            price
        ]
    );

    res.status(201).json({
        status: "success",
        message: "Produk berhasil dibuat",
        data: {
            product_id: Number(result.insertId)
        }
    });
});

// UPDATE PRODUCT
exports.updateProduct = asyncHandler(async (req, res) => {
    const id = positiveInt(req.params.id, "ID produk");

    const categoryId = positiveInt(
        req.body.category_id,
        "ID kategori"
    );

    const category = await pool.query(
        "SELECT category_id FROM categories WHERE category_id = ?",
        [categoryId]
    );

    if (!category[0]) {
        throw httpError(400, "Kategori tidak ditemukan");
    }

    const productName = requireText(
        req.body.product_name,
        "Nama produk",
        150
    );

    const description = req.body.description || null;

    const price = positiveMoney(
        req.body.price,
        "Harga produk"
    );

    const result = await pool.query(
        `UPDATE products
         SET category_id = ?,
             product_name = ?,
             description = ?,
             price = ?,
             updated_at = NOW()
         WHERE product_id = ?`,
        [
            categoryId,
            productName,
            description,
            price,
            id
        ]
    );

    if (!result.affectedRows) {
        throw httpError(404, "Produk tidak ditemukan");
    }

    res.json({
        status: "success",
        message: "Produk berhasil diperbarui. Harga transaksi lama tetap tersimpan."
    });
});

// UPDATE PRODUCT STATUS
exports.updateProductStatus = asyncHandler(async (req, res) => {
    const id = positiveInt(req.params.id, "ID produk");
    const status = req.body.status;

    if (!["active", "inactive"].includes(status)) {
        throw httpError(400, "Status harus active atau inactive");
    }

    const result = await pool.query(
        `UPDATE products
         SET status = ?, updated_at = NOW()
         WHERE product_id = ?`,
        [status, id]
    );

    if (!result.affectedRows) {
        throw httpError(404, "Produk tidak ditemukan");
    }

    res.json({
        status: "success",
        message: "Status produk berhasil diperbarui"
    });
});