
/**
 * Auth Guard Utility
 * Mengatur autentikasi dan hak akses halaman.
 */

const AuthGuard = {
    /**
     * Memeriksa autentikasi pengguna.
     *
     * Jika belum login, arahkan ke halaman login.
     */
    async requireAuth() {
        try {
            const result = await AuthService.checkAuth();

            if (!result.authenticated || !result.user) {
                this.redirectToLogin();
                return null;
            }

            return result.user;

        } catch (error) {
            console.error("Authentication error:", error);

            this.redirectToLogin();

            return null;
        }
    },

    /**
     * Memeriksa apakah pengguna memiliki role yang diizinkan.
     *
     * @param {string[]} allowedRoles
     */
    async requireRole(allowedRoles = []) {
        const user = await this.requireAuth();

        if (!user) return null;

        if (!allowedRoles.includes(user.role)) {
            this.redirectToDashboard();

            return null;
        }

        return user;
    },

    /**
     * Khusus halaman Admin.
     */
    async requireAdmin() {
        return await this.requireRole(["admin"]);
    },

    /**
     * Khusus halaman Kasir.
     */
    async requireCashier() {
        return await this.requireRole(["kasir"]);
    },

    /**
     * Mengarahkan pengguna ke login.
     */
    redirectToLogin() {
        window.location.href = "login.html";
    },

    /**
     * Mengarahkan pengguna ke dashboard.
     */
    redirectToDashboard() {
        window.location.href = "dashboard.html";
    },

    /**
     * Mengarahkan pengguna yang sudah login
     * agar tidak kembali ke halaman login.
     */
    async redirectIfAuthenticated() {
        const result = await AuthService.checkAuth();

        if (result.authenticated) {
            window.location.href = "dashboard.html";
        }
    }
};

window.AuthGuard = AuthGuard;
