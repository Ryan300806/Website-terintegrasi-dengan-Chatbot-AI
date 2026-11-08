
/**
 * Reports Page
 */

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const auth = await AuthService.checkAuth();

        if (!auth.authenticated) {
            window.location.href = "login.html";
            return;
        }

        if (auth.user.role !== "admin") {
            window.location.href = "dashboard.html";
            return;
        }

        Sidebar.init({
            role: auth.user.role,
            userName: auth.user.name
        });

        Navbar.init({
            userName: auth.user.name,
            role: auth.user.role,
            onLogout: handleReportLogout
        });

        Navbar.setTitle("Laporan Penjualan", "Analisis penjualan kedai kopi");

        bindReportEvents();
        await loadSalesReport();

    } catch (error) {
        console.error(error);
        Notification.error("Gagal memuat laporan.");
    }
});

function bindReportEvents() {
    document.getElementById("reportPeriod")
        ?.addEventListener("change", loadSalesReport);

    document.getElementById("reportDate")
        ?.addEventListener("change", loadSalesReport);

    document.getElementById("exportCSV")
        ?.addEventListener("click", exportSalesCSV);

    document.getElementById("exportPDF")
        ?.addEventListener("click", exportSalesPDF);
}

async function loadSalesReport() {
    try {
        const period = document.getElementById("reportPeriod")?.value || "daily";

        const date = document.getElementById("reportDate")?.value ||
            new Date().toISOString().slice(0, 10);

        const response = await ReportService.getSalesReport({
            period,
            date
        });

        const report = response.data;

        renderReportSummary(report.summary);
        renderReportChart(report.rows);
        renderReportTable(report.rows);

        setReportValue("reportStartDate", report.from);
        setReportValue("reportEndDate", report.to);

    } catch (error) {
        console.error(error);
        Notification.error(error.message);
    }
}

function renderReportSummary(summary) {
    setReportValue(
        "reportRevenue",
        formatReportCurrency(summary.revenue)
    );

    setReportValue(
        "reportTransactions",
        summary.transaction_count
    );
}

function renderReportChart(rows = []) {
    const canvas = document.getElementById("reportChart");

    if (!canvas || typeof Chart === "undefined") return;

    if (window.reportChartInstance) {
        window.reportChartInstance.destroy();
    }

    window.reportChartInstance = new Chart(canvas, {
        type: "bar",

        data: {
            labels: rows.map(row => row.date),

            datasets: [{
                label: "Pendapatan",
                data: rows.map(row => Number(row.revenue)),
                borderWidth: 1
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

function renderReportTable(rows = []) {
    const tbody = document.getElementById("reportTableBody");

    if (!tbody) return;

    tbody.replaceChildren();

    if (!rows.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center">
                    Belum ada data penjualan.
                </td>
            </tr>
        `;
        return;
    }

    rows.forEach(row => {
        const tr = document.createElement("tr");

        const date = document.createElement("td");
        date.textContent = row.date;

        const count = document.createElement("td");
        count.textContent = row.transaction_count;

        const revenue = document.createElement("td");
        revenue.textContent = formatReportCurrency(row.revenue);

        tr.append(date, count, revenue);
        tbody.appendChild(tr);
    });
}

async function exportSalesCSV() {
    await downloadSalesReport("csv");
}

async function exportSalesPDF() {
    await downloadSalesReport("pdf");
}

async function downloadSalesReport(format) {
    try {
        const period = document.getElementById("reportPeriod")?.value || "daily";

        const date = document.getElementById("reportDate")?.value ||
            new Date().toISOString().slice(0, 10);

        let blob;

        if (format === "csv") {
            blob = await ReportService.exportCSV({ period, date });
        } else {
            blob = await ReportService.exportPDF({ period, date });
        }

        const fileName = `laporan-penjualan-${date}.${format}`;

        ReportService.saveFile(blob, fileName);

        Notification.success("Laporan berhasil diunduh.");

    } catch (error) {
        Notification.error(error.message);
    }
}

function setReportValue(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value ?? "-";
    }
}

function formatReportCurrency(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(value) || 0);
}

async function handleReportLogout() {
    try {
        await AuthService.logout();
        window.location.href = "login.html";
    } catch (error) {
        Notification.error(error.message);
    }
}
