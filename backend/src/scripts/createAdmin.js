
require("dotenv").config();

const bcrypt = require("bcryptjs");
const pool = require("../config/database");

async function createAdmin() {
    let connection;

    try {
        const {
            ADMIN_NAME,
            ADMIN_USERNAME,
            ADMIN_EMAIL,
            ADMIN_PASSWORD
        } = process.env;

        if (
            !ADMIN_NAME ||
            !ADMIN_USERNAME ||
            !ADMIN_EMAIL ||
            !ADMIN_PASSWORD
        ) {
            throw new Error(
                "Lengkapi ADMIN_NAME, ADMIN_USERNAME, ADMIN_EMAIL, dan ADMIN_PASSWORD di .env"
            );
        }

        if (ADMIN_PASSWORD.length < 12) {
            throw new Error(
                "Password Admin minimal 12 karakter"
            );
        }

        connection = await pool.getConnection();

        const existing = await connection.query(
            "SELECT user_id FROM users WHERE username = ? OR email = ? LIMIT 1",
            [ADMIN_USERNAME, ADMIN_EMAIL]
        );

        if (existing.length > 0) {
            console.log("Username atau email sudah digunakan.");
            return;
        }

        const hashedPassword = await bcrypt.hash(
            ADMIN_PASSWORD,
            12
        );

        await connection.query(
            `INSERT INTO users
                (name, username, email, password, role, status)
             VALUES (?, ?, ?, ?, 'admin', 'active')`,
            [
                ADMIN_NAME,
                ADMIN_USERNAME,
                ADMIN_EMAIL,
                hashedPassword
            ]
        );

        console.log("Akun Admin berhasil dibuat.");

    } catch (error) {
        console.error("Gagal membuat Admin:", error.message);
        process.exitCode = 1;
    } finally {
        if (connection) connection.release();
        await pool.end();
    }
}

createAdmin();
