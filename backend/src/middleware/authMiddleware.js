const jwt = require("jsonwebtoken");
const { httpError } = require("../utils/validators");

function authenticateToken(req, res, next) {
    const token = req.cookies?.token;

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