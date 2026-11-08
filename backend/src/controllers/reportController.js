const pool = require("../config/database");
const PDFDocument = require("pdfkit");
const asyncHandler = require("../utils/asyncHandler");
const { httpError } = require("../utils/validators");

// MENENTUKAN RENTANG TANGGAL
function getDateRange(period, date) {
    const base = new Date(`${date}T12:00:00`);

    if (Number.isNaN(base.getTime())) {
        throw httpError(400, "Format tanggal harus YYYY-MM-DD");
    }

    let start = new Date(base);
    let end = new Date(base);

    if (period === "weekly") {
        const day = (base.getDay() + 6) % 7;

        start.setDate(base.getDate() - day);

        end = new Date(start);
        end.setDate(start.getDate() + 6);

    } else if (period === "monthly") {
        start = new Date(
            base.getFullYear(),
            base.getMonth(),
            1
        );

        end = new Date(
            base.getFullYear(),
            base.getMonth() + 1,
            0
        );

    } else if (period !== "daily") {
        throw httpError(
            400,
            "Period harus daily, weekly, atau monthly"
        );
    }

    function formatDate(value) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    return {
        from: formatDate(start),
        to: formatDate(end)
    };
}

// MENGAMBIL DATA LAPORAN
async function getSalesReport(query) {
    const period = query.period || "daily";

    const date = query.date ||
        new Date().toISOString().slice(0, 10);

    const range = getDateRange(period, date);

    const rows = await pool.query(
        `SELECT
            DATE(transaction_date) AS date,
            COUNT(*) AS transaction_count,
            COALESCE(SUM(total_amount), 0) AS revenue
         FROM transactions
         WHERE status = 'completed'
           AND DATE(transaction_date) BETWEEN ? AND ?
         GROUP BY DATE(transaction_date)
         ORDER BY date`,
        [range.from, range.to]
    );

    const summary = await pool.query(
        `SELECT
            COUNT(*) AS transaction_count,
            COALESCE(SUM(total_amount), 0) AS revenue
         FROM transactions
         WHERE status = 'completed'
           AND DATE(transaction_date) BETWEEN ? AND ?`,
        [range.from, range.to]
    );

    return {
        period,
        ...range,

        summary: {
            transaction_count: Number(
                summary[0].transaction_count
            ),

            revenue: Number(summary[0].revenue)
        },

        rows
    };
}

// GET SALES REPORT
exports.getSalesReport = asyncHandler(async (req, res) => {
    const report = await getSalesReport(req.query);

    res.json({
        status: "success",
        data: report
    });
});

// EXPORT CSV OR PDF
exports.exportSalesReport = asyncHandler(async (req, res) => {
    const report = await getSalesReport(req.query);

    const format = req.query.format || "csv";

    // EXPORT CSV
    if (format === "csv") {
        const rows = [
            ["Tanggal", "Jumlah Transaksi", "Pendapatan"],

            ...report.rows.map(row => [
                row.date,
                row.transaction_count,
                row.revenue
            ])
        ];

        const csv = rows
            .map(row =>
                row.map(value =>
                    `"${String(value).replace(/"/g, '""')}"`
                ).join(",")
            )
            .join("\r\n");

        res.setHeader(
            "Content-Type",
            "text/csv; charset=utf-8"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="laporan-${report.from}-${report.to}.csv"`
        );

        return res.send("\uFEFF" + csv);
    }

    // EXPORT PDF
    if (format === "pdf") {
        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="laporan-${report.from}-${report.to}.pdf"`
        );

        const doc = new PDFDocument({
            margin: 50
        });

        doc.pipe(res);

        doc.fontSize(18)
            .text("Laporan Penjualan Kedai Kopi");

        doc.moveDown();

        doc.fontSize(11)
            .text(`Periode: ${report.period}`)
            .text(`Dari: ${report.from}`)
            .text(`Sampai: ${report.to}`);

        doc.moveDown();

        doc.text(
            `Jumlah transaksi: ${report.summary.transaction_count}`
        );

        doc.text(
            `Total pendapatan: Rp ${report.summary.revenue.toLocaleString("id-ID")}`
        );

        doc.moveDown();

        doc.fontSize(14)
            .text("Rincian Penjualan Harian");

        doc.moveDown();

        report.rows.forEach(row => {
            doc.fontSize(10).text(
                `${row.date} | ${row.transaction_count} transaksi | Rp ${Number(row.revenue).toLocaleString("id-ID")}`
            );
        });

        return doc.end();
    }

    throw httpError(
        400,
        "Format ekspor harus csv atau pdf"
    );
});