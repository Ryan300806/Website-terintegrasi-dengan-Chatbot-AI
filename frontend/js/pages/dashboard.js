
/**
 * Dashboard Page
 */

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const auth = await AuthService.checkAuth();

        if (!auth.authenticated) {
            window.location.href = "login.html";
            return;
        }

        const user = auth.user;

        Sidebar.init({
            role: user.role,
            userName: user.name
        });

        Navbar.init({
            userName: user.name,
            role: user.role,
            onLogout: handleLogout
        });

        Navbar.setTitle("Dashboard", "Ringkasan aktivitas kedai kopi");

        await loadDashboard();

    } catch (error) {
        console.error(error);
        Notification.error("Gagal memuat dashboard.");
    }
});

async function loadDashboard() {
    try {
        const response = await DashboardService.getDashboard();
        const data = response.data;

        setValue("todayRevenue",
            formatRupiah(data.today_revenue ?? data.today_sales_total)
        );

        setValue("todayTransactions", data.today_transaction_count);

        if (data.role === "admin") {
            setValue("activeProducts", data.active_product_count);

            renderSalesChart(data.sales_chart_7_days);
            renderBestSelling(data.best_selling_products_30_days);
        }

    } catch (error) {
        console.error("Dashboard:", error);

        if (error.status === 401) {
            window.location.href = "login.html";
            return;
        }

        Notification.error(error.message);
    }
}

function setValue(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value ?? 0;
    }
}

function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(value) || 0);
}

function renderSalesChart(data = []) {
    const canvas = document.getElementById("salesChart");

    if (!canvas || typeof Chart === "undefined") return;

    if (window.salesChartInstance) {
        window.salesChartInstance.destroy();
    }

    window.salesChartInstance = new Chart(canvas, {
        type: "line",
        data: {
            labels: data.map(item => item.date),
            datasets: [{
                label: "Pendapatan",
                data: data.map(item => Number(item.revenue)),
                borderWidth: 2,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderBestSelling(products = []) {
    const container = document.getElementById("bestSellingProducts");

    if (!container) return;

    container.replaceChildren();

    if (!products.length) {
        container.textContent = "Belum ada data penjualan.";
        return;
    }

    products.forEach(product => {
        const item = document.createElement("div");
        item.className = "best-selling-item";

        const name = document.createElement("span");
        name.textContent = product.product_name;

        const quantity = document.createElement("strong");
        quantity.textContent = `${product.quantity_sold} terjual`;

        item.append(name, quantity);
        container.appendChild(item);
    });
}

async function handleLogout() {
    try {
        await AuthService.logout();
        window.location.href = "login.html";
    } catch (error) {
        Notification.error(error.message);
    }
}
