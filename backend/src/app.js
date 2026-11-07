
const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false
});

app.use("/api", apiLimiter);

// Endpoint utama
app.get("/", (req, res) => {
    res.json({
        message: "API Sistem Informasi Asisten Bisnis Kedai Kopi berjalan!",
        status: "success"
    });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Route tidak ditemukan
app.use((req, res) => {
    res.status(404).json({
        status: "error",
        message: "Endpoint tidak ditemukan"
    });
});

module.exports = app;
