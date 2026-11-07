require("dotenv").config();

const app = require("./src/app");
const pool = require("./src/config/database");

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Menguji koneksi database
        const connection = await pool.getConnection();

        console.log("Database MariaDB berhasil terhubung!");

        connection.release();

        // Menjalankan Express Server
        app.listen(PORT, () => {
            console.log(`Server berjalan di http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Gagal menjalankan server:", error.message);
        process.exit(1);
    }
}

startServer();