
/**
 * Category Service
 * Mengelola data kategori produk.
 */

const CategoryService = {
    /**
     * Mengambil seluruh kategori.
     */
    async getAll() {
        return await APIService.get("/categories");
    },

    /**
     * Menambahkan kategori.
     */
    async create(categoryData) {
        return await APIService.post(
            "/categories",
            categoryData
        );
    },

    /**
     * Memperbarui kategori.
     */
    async update(id, categoryData) {
        return await APIService.put(
            `/categories/${id}`,
            categoryData
        );
    },

    /**
     * Menghapus kategori.
     */
    async delete(id) {
        return await APIService.delete(
            `/categories/${id}`
        );
    }
};

window.CategoryService = CategoryService;
