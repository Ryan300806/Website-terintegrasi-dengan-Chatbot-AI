
/**
 * API Service
 * Pusat komunikasi HTTP antara frontend dan backend.
 */

const APIService = {
    /**
     * Mengirim HTTP request ke backend.
     *
     * @param {string} endpoint
     * @param {Object} options
     */
    async request(endpoint, options = {}) {
        const url = API_CONFIG.getURL(endpoint);

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, API_CONFIG.TIMEOUT);

        const token = localStorage.getItem("accessToken");
        const headers = {
            ...API_CONFIG.HEADERS,
            ...options.headers
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                method: options.method || "GET",

                credentials: API_CONFIG.CREDENTIALS,

                headers,

                body: options.body !== undefined
                    ? JSON.stringify(options.body)
                    : undefined,

                signal: controller.signal
            });

            const contentType = response.headers.get("content-type") || "";

            let result;

            if (contentType.includes("application/json")) {
                result = await response.json();
            } else {
                result = await response.text();
            }

            if (!response.ok) {
                const error = new Error(
                    result?.message ||
                    result ||
                    "Terjadi kesalahan pada server."
                );

                error.status = response.status;
                error.data = result;

                throw error;
            }

            return result;

        } catch (error) {
            if (error.name === "AbortError") {
                throw new Error("Request timeout. Silakan coba kembali.");
            }

            if (!navigator.onLine) {
                throw new Error("Tidak ada koneksi internet.");
            }

            throw error;

        } finally {
            clearTimeout(timeout);
        }
    },

    /**
     * GET request.
     */
    get(endpoint, params = {}) {
        const query = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                query.append(key, value);
            }
        });

        const queryString = query.toString();

        const url = queryString
            ? `${endpoint}?${queryString}`
            : endpoint;

        return this.request(url);
    },

    /**
     * POST request.
     */
    post(endpoint, body = {}) {
        return this.request(endpoint, {
            method: "POST",
            body
        });
    },

    /**
     * PUT request.
     */
    put(endpoint, body = {}) {
        return this.request(endpoint, {
            method: "PUT",
            body
        });
    },

    /**
     * PATCH request.
     */
    patch(endpoint, body = {}) {
        return this.request(endpoint, {
            method: "PATCH",
            body
        });
    },

    /**
     * DELETE request.
     */
    delete(endpoint) {
        return this.request(endpoint, {
            method: "DELETE"
        });
    },

    /**
     * Mengambil file dari backend.
     * Digunakan untuk export CSV dan PDF.
     */
    async download(endpoint, params = {}) {
        const query = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                query.append(key, value);
            }
        });

        const queryString = query.toString();

        const url = API_CONFIG.getURL(endpoint) +
            (queryString ? `?${queryString}` : "");

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, API_CONFIG.TIMEOUT);

        try {
            const response = await fetch(url, {
                method: "GET",
                credentials: API_CONFIG.CREDENTIALS,
                signal: controller.signal
            });

            if (!response.ok) {
                const result = await response.json().catch(() => ({}));

                throw new Error(
                    result.message || "Gagal mengunduh file."
                );
            }

            return await response.blob();

        } finally {
            clearTimeout(timeout);
        }
    }
};

window.APIService = APIService;
