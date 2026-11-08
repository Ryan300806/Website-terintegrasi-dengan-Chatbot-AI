
/**
 * Auth Service
 * Mengelola autentikasi pengguna.
 */

const AuthService = {
    /**
     * Login pengguna.
     */
    async login(username, password) {
        return await APIService.post("/auth/login", {
            username,
            password
        });
    },

    /**
     * Logout pengguna.
     */
    async logout() {
        return await APIService.post("/auth/logout");
    },

    /**
     * Mengambil profil pengguna yang sedang login.
     */
    async getProfile() {
        return await APIService.get("/auth/me");
    },

    /**
     * Mengecek apakah pengguna sudah login.
     */
    async checkAuth() {
        try {
            const response = await this.getProfile();

            return {
                authenticated: true,
                user: response.data.user
            };

        } catch (error) {
            return {
                authenticated: false,
                user: null
            };
        }
    }
};

window.AuthService = AuthService;
