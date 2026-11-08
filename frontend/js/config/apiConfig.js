
/**
 * API Configuration
 * Menyimpan konfigurasi utama komunikasi frontend dan backend.
 */

const API_CONFIG = {
    // Alamat utama backend Express
    BASE_URL: "http://localhost:3000",

    // Prefix endpoint API
    API_PREFIX: "/api",

    // Pengaturan request
    TIMEOUT: 15000,

    // Pengaturan credentials untuk autentikasi berbasis cookie
    CREDENTIALS: "include",

    // Header default
    HEADERS: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
};

/**
 * Helper untuk membangun URL endpoint API.
 *
 * Contoh:
 * API_CONFIG.getURL("/auth/login")
 * Hasil:
 * http://localhost:3000/api/auth/login
 */
API_CONFIG.getURL = function (endpoint) {
    const baseURL = this.BASE_URL.replace(/\/+$/, "");
    const prefix = this.API_PREFIX.replace(/^\/+|\/+$/g, "");
    const path = endpoint.replace(/^\/+/, "");

    return `${baseURL}/${prefix}/${path}`;
};

// Membuat konfigurasi tersedia secara global.
window.API_CONFIG = API_CONFIG;
