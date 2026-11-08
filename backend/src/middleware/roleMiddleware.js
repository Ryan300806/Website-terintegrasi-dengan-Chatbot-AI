const { httpError } = require("../utils/validators");

function authorizeRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return next(
                httpError(401, "Autentikasi diperlukan")
            );
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(
                httpError(403, "Kamu tidak memiliki hak akses")
            );
        }

        next();
    };
}

module.exports = authorizeRole;