
const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");

const loginLimiter = require("express-rate-limit").rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Terlalu banyak percobaan login. Coba lagi nanti."
    }
});

router.post("/login", loginLimiter, authController.login);

router.post("/logout", authController.logout);

router.get("/me", authenticateToken, authController.getProfile);

module.exports = router;
