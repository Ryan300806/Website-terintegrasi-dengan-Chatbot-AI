
/**
 * Report Service
 * Mengelola laporan dan export penjualan.
 */

const ReportService = {
    /**
     * Mengambil laporan penjualan.
     *
     * @param {Object} params
     */
    async getSalesReport(params = {}) {
        return await APIService.get(
            "/reports/sales",
            params
        );
    },

    /**
     * Mengunduh laporan CSV.
     */
    async exportCSV(params = {}) {
        return await APIService.download(
            "/reports/sales/export",
            {
                ...params,
                format: "csv"
            }
        );
    },

    /**
     * Mengunduh laporan PDF.
     */
    async exportPDF(params = {}) {
        return await APIService.download(
            "/reports/sales/export",
            {
                ...params,
                format: "pdf"
            }
        );
    },

    /**
     * Menyimpan blob sebagai file.
     */
    saveFile(blob, fileName) {
        const fileURL = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = fileURL;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(fileURL);
    }
};

window.ReportService = ReportService;
