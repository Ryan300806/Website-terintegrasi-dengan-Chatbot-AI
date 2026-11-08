const express = require("express");
const rateLimit = require("express-rate-limit").rateLimit;

const authController = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false
});

router.post(
    "/login",
    loginLimiter,
    authController.login
);

router.post(
    "/logout",
    authController.logout
);

router.get(
    "/me",
    authenticateToken,
    authController.getProfile
);

module.exports = router;