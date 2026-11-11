const jwt = require("jsonwebtoken");
const { httpError } = require("../utils/validators");

function authenticateToken(req, res, next) {
    const cookieToken = req.cookies?.token;
    const authHeader = req.headers.authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : "";
    const token = bearerToken || cookieToken;

    if (!token) {
        return next(
            httpError(401, "Silakan login terlebih dahulu")
        );
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;
        next();

    } catch (error) {
        next(
            httpError(401, "Sesi tidak valid atau sudah kedaluwarsa")
        );
    }
}

module.exports = authenticateToken;