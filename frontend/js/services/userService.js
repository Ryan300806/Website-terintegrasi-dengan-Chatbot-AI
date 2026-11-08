
/**
 * User Service
 * Mengelola data pengguna aplikasi.
 */

const UserService = {
    /**
     * Mengambil daftar pengguna.
     */
    async getAll(params = {}) {
        return await APIService.get(
            "/users",
            params
        );
    },

    /**
     * Mengambil detail pengguna.
     */
    async getById(id) {
        return await APIService.get(
            `/users/${id}`
        );
    },

    /**
     * Menambahkan pengguna.
     */
    async create(userData) {
        return await APIService.post(
            "/users",
            userData
        );
    },

    /**
     * Memperbarui data pengguna.
     */
    async update(id, userData) {
        return await APIService.put(
            `/users/${id}`,
            userData
        );
    },

    /**
     * Mengubah status pengguna.
     */
    async updateStatus(id, status) {
        return await APIService.patch(
            `/users/${id}/status`,
            { status }
        );
    },

    /**
     * Mengubah password pengguna.
     */
    async changePassword(id, password) {
        return await APIService.patch(
            `/users/${id}/password`,
            { password }
        );
    }
};

window.UserService = UserService;
