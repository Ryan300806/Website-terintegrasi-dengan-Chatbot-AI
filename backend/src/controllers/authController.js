
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                status: "error",
                message: "Username dan password wajib diisi"
            });
        }

        const user = await userModel.findByUsername(
            username.trim()
        );

        // Pesan dibuat sama agar tidak membocorkan
        // apakah username tertentu terdaftar.
        if (!user || user.status !== "active") {
            return res.status(401).json({
                status: "error",
                message: "Username atau password salah"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                status: "error",
                message: "Username atau password salah"
            });
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

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
            path: "/"
        });

        return res.status(200).json({
            status: "success",
            message: "Login berhasil",
            data: {
                user_id: user.user_id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            status: "error",
            message: "Terjadi kesalahan pada server"
        });
    }
}

function logout(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    });

    return res.status(200).json({
        status: "success",
        message: "Logout berhasil"
    });
}

async function getProfile(req, res) {
    try {
        const user = await userModel.findById(
            req.user.user_id
        );

        if (!user || user.status !== "active") {
            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/"
            });

            return res.status(401).json({
                status: "error",
                message: "Akun tidak tersedia atau sudah dinonaktifkan"
            });
        }

        return res.status(200).json({
            status: "success",
            data: user
        });

    } catch (error) {
        console.error("Profile error:", error);

        return res.status(500).json({
            status: "error",
            message: "Terjadi kesalahan pada server"
        });
    }
}

module.exports = {
    login,
    logout,
    getProfile
};
