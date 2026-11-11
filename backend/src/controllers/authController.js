const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userModel = require("../models/userModel");
const asyncHandler = require("../utils/asyncHandler");
const {
    httpError,
    requireText
} = require("../utils/validators");

function cookieOptions() {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/"
    };
}

// LOGIN
exports.login = asyncHandler(async (req, res) => {
    const username = requireText(
        req.body.username,
        "Username",
        50
    );

    if (
        typeof req.body.password !== "string" ||
        !req.body.password
    ) {
        throw httpError(400, "Password wajib diisi");
    }

    const user = await userModel.findByUsername(username);

    if (!user || user.status !== "active") {
        throw httpError(401, "Username atau password salah");
    }

    const passwordValid = await bcrypt.compare(
        req.body.password,
        user.password
    );

    if (!passwordValid) {
        throw httpError(401, "Username atau password salah");
    }

    const token = jwt.sign(
        {
            user_id: user.user_id,
            username: user.username,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        }
    );

    res.cookie("token", token, cookieOptions());
    res.setHeader("Authorization", `Bearer ${token}`);

    res.json({
        status: "success",
        message: "Login berhasil",
        data: {
            token,
            tokenType: "Bearer",
            user: {
                user_id: user.user_id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role
            }
        }
    });
});

// LOGOUT
exports.logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    });

    res.json({
        status: "success",
        message: "Logout berhasil"
    });
};

// GET PROFILE
exports.getProfile = asyncHandler(async (req, res) => {
    const user = await userModel.findById(
        req.user.user_id
    );

    if (!user || user.status !== "active") {
        throw httpError(
            401,
            "Akun tidak aktif atau tidak ditemukan"
        );
    }

    res.json({
        status: "success",
        data: { user }
    });
});