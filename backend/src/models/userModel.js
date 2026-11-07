
const pool = require("../config/database");

async function findByUsername(username) {
    let connection;

    try {
        connection = await pool.getConnection();

        const rows = await connection.query(
            `SELECT user_id, name, username, email,
                    password, role, status
             FROM users
             WHERE username = ?
             LIMIT 1`,
            [username]
        );

        return rows[0] || null;

    } finally {
        if (connection) connection.release();
    }
}

async function findById(userId) {
    let connection;

    try {
        connection = await pool.getConnection();

        const rows = await connection.query(
            `SELECT user_id, name, username, email,
                    role, status
             FROM users
             WHERE user_id = ?
             LIMIT 1`,
            [userId]
        );

        return rows[0] || null;

    } finally {
        if (connection) connection.release();
    }
}

module.exports = {
    findByUsername,
    findById
};
