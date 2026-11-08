const pool = require("../config/database");

async function findByUsername(username) {
    const rows = await pool.query(
        `SELECT user_id, name, username, email,
                password, role, status
         FROM users
         WHERE username = ?
         LIMIT 1`,
        [username]
    );

    return rows[0] || null;
}

async function findById(userId) {
    const rows = await pool.query(
        `SELECT user_id, name, username, email,
                role, status, created_at, updated_at
         FROM users
         WHERE user_id = ?
         LIMIT 1`,
        [userId]
    );

    return rows[0] || null;
}

module.exports = {
    findByUsername,
    findById
};