
/**
 * Transaction Service
 * Mengelola transaksi penjualan.
 */

const TransactionService = {
    /**
     * Membuat transaksi baru.
     */
    async create(transactionData) {
        return await APIService.post(
            "/transactions",
            transactionData
        );
    },

    /**
     * Mengambil daftar transaksi.
     */
    async getAll(params = {}) {
        return await APIService.get(
            "/transactions",
            params
        );
    },

    /**
     * Mengambil detail transaksi.
     */
    async getById(id) {
        return await APIService.get(
            `/transactions/${id}`
        );
    },

    /**
     * Membatalkan transaksi.
     * Hanya Admin yang diizinkan backend.
     */
    async cancel(id, reason) {
        return await APIService.patch(
            `/transactions/${id}/cancel`,
            { reason }
        );
    }
};

window.TransactionService = TransactionService;
