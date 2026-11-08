const express = require("express");

const transactionController = require("../controllers/transactionController");
const authorizeRole = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin dan Kasir dapat membuat transaksi
router.post(
    "/",
    transactionController.createTransaction
);

// Admin melihat semua transaksi.
// Kasir hanya melihat transaksi miliknya.
router.get(
    "/",
    transactionController.getTransactions
);

// Melihat detail transaksi sesuai hak akses
router.get(
    "/:id",
    transactionController.getTransactionById
);

// Hanya Admin yang dapat membatalkan transaksi
router.patch(
    "/:id/cancel",
    authorizeRole("admin"),
    transactionController.cancelTransaction
);

module.exports = router;