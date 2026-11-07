
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            status: "error",
            message: "Silakan login terlebih dahulu"
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            status: "error",
            message: "Sesi tidak valid atau sudah kedaluwarsa"
        });
    }
}

module.exports = authenticateToken;
