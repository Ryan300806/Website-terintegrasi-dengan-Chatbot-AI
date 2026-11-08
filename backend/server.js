require("dotenv").config();

const app = require("./src/app");
const pool = require("./src/config/database");

const PORT = process.env.PORT || 3000;

async function startServer() {
    let connection;

    try {
        if (
            !process.env.JWT_SECRET ||
            process.env.JWT_SECRET.length < 32
        ) {
            throw new Error(
                "JWT_SECRET wajib diisi dan minimal 32 karakter"
            );
        }

        connection = await pool.getConnection();

        await connection.query("SELECT 1");

        console.log(
            "Database MariaDB berhasil terhubung!"
        );

        app.listen(PORT, () => {
            console.log(
                `Server berjalan di http://localhost:${PORT}`
            );
        });

    } catch (error) {
        console.error(
            "Gagal menjalankan server:",
            error.message
        );

        process.exit(1);

    } finally {
        if (connection) {
            connection.release();
        }
    }
}

startServer();