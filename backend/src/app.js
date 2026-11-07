const express = require("express");

const app = express();

// Middleware untuk membaca JSON
app.use(express.json());

// Route utama untuk pengecekan server
app.get("/", (req, res) => {
    res.json({
        message: "API Sistem Informasi Asisten Bisnis Kedai Kopi berjalan!",
        status: "success"
    });
});

module.exports = app;