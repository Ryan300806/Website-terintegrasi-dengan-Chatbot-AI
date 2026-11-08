
/**
 * Dashboard Service
 * Mengambil data statistik dashboard.
 */

const DashboardService = {
    /**
     * Mengambil seluruh data dashboard.
     */
    async getDashboard() {
        return await APIService.get("/dashboard");
    }
};

window.DashboardService = DashboardService;
