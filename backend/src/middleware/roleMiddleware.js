
function authorizeRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: "error",
                message: "Autentikasi diperlukan"
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: "error",
                message: "Kamu tidak memiliki hak akses"
            });
        }

        next();
    };
}

module.exports = authorizeRole;
