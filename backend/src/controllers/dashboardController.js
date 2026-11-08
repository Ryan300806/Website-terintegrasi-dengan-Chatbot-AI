const pool = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");

exports.getDashboard = asyncHandler(async (req, res) => {
    const isKasir = req.user.role === "kasir";

    const todayQuery = `
        SELECT
            COUNT(*) AS transaction_count,
            COALESCE(SUM(total_amount), 0) AS revenue
        FROM transactions
        WHERE status = 'completed'
          AND DATE(transaction_date) = CURDATE()
        ${isKasir ? "AND cashier_id = ?" : ""}
    `;

    const todayParams = isKasir
        ? [req.user.user_id]
        : [];

    const todayRows = await pool.query(
        todayQuery,
        todayParams
    );

    const today = todayRows[0];

    // Dashboard Kasir
    if (isKasir) {
        return res.json({
            status: "success",
            data: {
                role: "kasir",
                today_transaction_count: Number(
                    today.transaction_count
                ),
                today_sales_total: Number(today.revenue)
            }
        });
    }

    // Dashboard Admin
    const [activeProducts, salesChart, bestSelling] =
        await Promise.all([
            pool.query(
                `SELECT COUNT(*) AS total
                 FROM products
                 WHERE status = 'active'`
            ),

            pool.query(
                `SELECT
                    DATE(transaction_date) AS date,
                    SUM(total_amount) AS revenue,
                    COUNT(*) AS transactions
                 FROM transactions
                 WHERE status = 'completed'
                   AND transaction_date >=
                       DATE_SUB(CURDATE(), INTERVAL 6 DAY)
                 GROUP BY DATE(transaction_date)
                 ORDER BY date`
            ),

            pool.query(
                `SELECT
                    p.product_id,
                    p.product_name,
                    SUM(td.quantity) AS quantity_sold,
                    SUM(td.subtotal) AS revenue
                 FROM transaction_details td
                 JOIN transactions t
                    ON t.transaction_id = td.transaction_id
                 JOIN products p
                    ON p.product_id = td.product_id
                 WHERE t.status = 'completed'
                   AND t.transaction_date >=
                       DATE_SUB(CURDATE(), INTERVAL 29 DAY)
                 GROUP BY p.product_id, p.product_name
                 ORDER BY quantity_sold DESC
                 LIMIT 5`
            )
        ]);

    res.json({
        status: "success",
        data: {
            role: "admin",

            today_revenue: Number(today.revenue),

            today_transaction_count: Number(
                today.transaction_count
            ),

            active_product_count: Number(
                activeProducts[0].total
            ),

            sales_chart_7_days: salesChart,

            best_selling_products_30_days: bestSelling
        }
    });
});