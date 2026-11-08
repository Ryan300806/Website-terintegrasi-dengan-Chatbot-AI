const pool = require("../config/database");
const bcrypt = require("bcryptjs");

const asyncHandler = require("../utils/asyncHandler");
const {
    httpError,
    requireText,
    validEmail,
    positiveInt,
    pagination
} = require("../utils/validators");

// GET ALL USERS
exports.getAllUsers = asyncHandler(async (req, res) => {
    const { page, limit, offset } = pagination(req.query);
    const search = String(req.query.search || "").trim();

    let where = "";
    let params = [];

    if (search) {
        where = `
            WHERE name LIKE ?
               OR username LIKE ?
               OR email LIKE ?
        `;

        params = [
            `%${search}%`,
            `%${search}%`,
            `%${search}%`
        ];
    }

    const count = await pool.query(
        `SELECT COUNT(*) AS total FROM users ${where}`,
        params
    );

    const users = await pool.query(
        `SELECT user_id, name, username, email,
                role, status, created_at, updated_at
         FROM users
         ${where}
         ORDER BY user_id DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
    );

    res.json({
        status: "success",
        data: users,
        pagination: {
            page,
            limit,
            total: Number(count[0].total)
        }
    });
});

// GET USER BY ID
exports.getUserById = asyncHandler(async (req, res) => {
    const id = positiveInt(req.params.id, "ID pengguna");

    const rows = await pool.query(
        `SELECT user_id, name, username, email,
                role, status, created_at, updated_at
         FROM users
         WHERE user_id = ?`,
        [id]
    );

    if (!rows[0]) {
        throw httpError(404, "Pengguna tidak ditemukan");
    }

    res.json({
        status: "success",
        data: rows[0]
    });
});

// CREATE USER
exports.createUser = asyncHandler(async (req, res) => {
    const name = requireText(req.body.name, "Nama", 100);
    const username = requireText(req.body.username, "Username", 50);
    const email = validEmail(req.body.email);
    const password = req.body.password;
    const role = req.body.role;

    if (typeof password !== "string" || password.length < 12) {
        throw httpError(400, "Password minimal 12 karakter");
    }

    if (!["admin", "kasir"].includes(role)) {
        throw httpError(400, "Role harus admin atau kasir");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await pool.query(
        `INSERT INTO users
         (name, username, email, password, role,
          status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
        [
            name,
            username,
            email,
            hashedPassword,
            role
        ]
    );

    res.status(201).json({
        status: "success",
        message: "Pengguna berhasil dibuat",
        data: {
            user_id: Number(result.insertId)
        }
    });
});

// UPDATE USER
exports.updateUser = asyncHandler(async (req, res) => {
    const id = positiveInt(req.params.id, "ID pengguna");

    const name = requireText(req.body.name, "Nama", 100);
    const username = requireText(req.body.username, "Username", 50);
    const email = validEmail(req.body.email);
    const role = req.body.role;

    if (!["admin", "kasir"].includes(role)) {
        throw httpError(400, "Role harus admin atau kasir");
    }

    if (
        id === Number(req.user.user_id) &&
        role !== req.user.role
    ) {
        throw httpError(400, "Admin tidak dapat mengubah role akunnya sendiri");
    }

    const result = await pool.query(
        `UPDATE users
         SET name = ?,
             username = ?,
             email = ?,
             role = ?,
             updated_at = NOW()
         WHERE user_id = ?`,
        [name, username, email, role, id]
    );

    if (!result.affectedRows) {
        throw httpError(404, "Pengguna tidak ditemukan");
    }

    res.json({
        status: "success",
        message: "Pengguna berhasil diperbarui"
    });
});

// CHANGE USER STATUS
exports.updateUserStatus = asyncHandler(async (req, res) => {
    const id = positiveInt(req.params.id, "ID pengguna");
    const status = req.body.status;

    if (id === Number(req.user.user_id)) {
        throw httpError(400, "Kamu tidak dapat menonaktifkan akun sendiri");
    }

    if (!["active", "inactive"].includes(status)) {
        throw httpError(400, "Status harus active atau inactive");
    }

    const result = await pool.query(
        `UPDATE users
         SET status = ?, updated_at = NOW()
         WHERE user_id = ?`,
        [status, id]
    );

    if (!result.affectedRows) {
        throw httpError(404, "Pengguna tidak ditemukan");
    }

    res.json({
        status: "success",
        message: "Status pengguna berhasil diperbarui"
    });
});

// CHANGE PASSWORD
exports.changePassword = asyncHandler(async (req, res) => {
    const id = positiveInt(req.params.id, "ID pengguna");
    const password = req.body.password;

    if (typeof password !== "string" || password.length < 12) {
        throw httpError(400, "Password minimal 12 karakter");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await pool.query(
        `UPDATE users
         SET password = ?, updated_at = NOW()
         WHERE user_id = ?`,
        [hashedPassword, id]
    );

    if (!result.affectedRows) {
        throw httpError(404, "Pengguna tidak ditemukan");
    }

    res.json({
        status: "success",
        message: "Password berhasil diperbarui"
    });
});