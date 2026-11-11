function errorMiddleware(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
            status: "error",
            message: "Username atau email sudah digunakan"
        });
    }

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({
            status: "error",
            message: "Data referensi tidak ditemukan"
        });
    }

    const status = Number(error.status) || 500;
    const message =
        error.message && error.message !== "Terjadi kesalahan pada server"
            ? error.message
            : "Terjadi kesalahan pada server";

    if (status >= 500) {
        console.error(error);
    }

    res.status(status).json({
        status: "error",
        message
    });
}

module.exports = errorMiddleware;