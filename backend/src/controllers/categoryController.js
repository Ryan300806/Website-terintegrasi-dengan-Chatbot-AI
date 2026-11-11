const pool = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");

const {
    httpError,
    requireText,
    positiveInt
} = require("../utils/validators");

// GET ALL CATEGORIES
exports.getAllCategories = asyncHandler(async (req, res) => {
    const categories = await pool.query(
        `SELECT
            c.category_id,
            c.category_name,
            c.description,
            c.created_at,
            c.updated_at,
            COUNT(p.product_id) AS product_count
         FROM categories c
         LEFT JOIN products p
            ON p.category_id = c.category_id
         GROUP BY
            c.category_id,
            c.category_name,
            c.description,
            c.created_at,
            c.updated_at
         ORDER BY c.category_name ASC`
    );

    res.json({
        status: "success",
        data: categories
    });
});

// CREATE CATEGORY
exports.createCategory = asyncHandler(async (req, res) => {
    const categoryName = requireText(
        req.body.category_name,
        "Nama kategori",
        100
    );

    const description = req.body.description || null;

    const result = await pool.query(
        `INSERT INTO categories
         (category_name, description, created_at, updated_at)
         VALUES (?, ?, NOW(), NOW())`,
        [categoryName, description]
    );

    res.status(201).json({
        status: "success",
        message: "Kategori berhasil dibuat",
        data: {
            category_id: Number(result.insertId)
        }
    });
});

// UPDATE CATEGORY
exports.updateCategory = asyncHandler(async (req, res) => {
    const id = positiveInt(req.params.id, "ID kategori");

    const categoryName = requireText(
        req.body.category_name,
        "Nama kategori",
        100
    );

    const description = req.body.description || null;

    const result = await pool.query(
        `UPDATE categories
         SET category_name = ?,
             description = ?,
             updated_at = NOW()
         WHERE category_id = ?`,
        [categoryName, description, id]
    );

    if (!result.affectedRows) {
        throw httpError(404, "Kategori tidak ditemukan");
    }

    res.json({
        status: "success",
        message: "Kategori berhasil diperbarui"
    });
});

// DELETE CATEGORY
exports.deleteCategory = asyncHandler(async (req, res) => {
    const id = positiveInt(req.params.id, "ID kategori");

    const used = await pool.query(
        `SELECT COUNT(*) AS total
         FROM products
         WHERE category_id = ?`,
        [id]
    );

    if (Number(used[0].total) > 0) {
        throw httpError(
            409,
            "Kategori masih digunakan produk dan tidak dapat dihapus"
        );
    }

    const result = await pool.query(
        "DELETE FROM categories WHERE category_id = ?",
        [id]
    );

    if (!result.affectedRows) {
        throw httpError(404, "Kategori tidak ditemukan");
    }

    res.json({
        status: "success",
        message: "Kategori berhasil dihapus"
    });
});