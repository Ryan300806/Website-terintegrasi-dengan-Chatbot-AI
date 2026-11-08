
/**
 * Product Service
 * Mengelola data produk.
 */

const ProductService = {
    /**
     * Mengambil daftar produk.
     *
     * @param {Object} params
     */
    async getAll(params = {}) {
        return await APIService.get("/products", params);
    },

    /**
     * Mengambil detail produk.
     */
    async getById(id) {
        return await APIService.get(`/products/${id}`);
    },

    /**
     * Menambahkan produk.
     */
    async create(productData) {
        return await APIService.post(
            "/products",
            productData
        );
    },

    /**
     * Memperbarui produk.
     */
    async update(id, productData) {
        return await APIService.put(
            `/products/${id}`,
            productData
        );
    },

    /**
     * Mengubah status produk.
     */
    async updateStatus(id, status) {
        return await APIService.patch(
            `/products/${id}/status`,
            { status }
        );
    }
};

window.ProductService = ProductService;
