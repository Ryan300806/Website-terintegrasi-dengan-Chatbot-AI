
/**
 * Sidebar Component
 * Mengelola navigasi utama dan hak akses menu.
 */

const Sidebar = {
    container: null,

    /**
     * Daftar menu berdasarkan role.
     */
    menus: {
        admin: [
            {
                title: "Dashboard",
                icon: "bi-grid",
                link: "dashboard.html",
                page: "dashboard.html"
            },
            {
                title: "Produk",
                icon: "bi-box-seam",
                link: "products.html",
                page: "products.html"
            },
            {
                title: "Kategori",
                icon: "bi-tags",
                link: "categories.html",
                page: "categories.html"
            },
            {
                title: "Transaksi",
                icon: "bi-cart3",
                link: "transactions.html",
                page: "transactions.html"
            },
            {
                title: "Riwayat Transaksi",
                icon: "bi-clock-history",
                link: "transaction-history.html",
                page: "transaction-history.html"
            },
            {
                title: "Manajemen Pengguna",
                icon: "bi-people",
                link: "users.html",
                page: "users.html"
            },
            {
                title: "Laporan Penjualan",
                icon: "bi-graph-up",
                link: "reports.html",
                page: "reports.html"
            }
        ],

        kasir: [
            {
                title: "Dashboard",
                icon: "bi-grid",
                link: "dashboard.html",
                page: "dashboard.html"
            },
            {
                title: "Produk",
                icon: "bi-box-seam",
                link: "products.html",
                page: "products.html"
            },
            {
                title: "Kategori",
                icon: "bi-tags",
                link: "categories.html",
                page: "categories.html"
            },
            {
                title: "Transaksi",
                icon: "bi-cart3",
                link: "transactions.html",
                page: "transactions.html"
            },
            {
                title: "Riwayat Transaksi",
                icon: "bi-clock-history",
                link: "transaction-history.html",
                page: "transaction-history.html"
            }
        ]
    },

    /**
     * Membuat sidebar.
     *
     * @param {Object} options
     */
    init({
        selector = "#sidebar-container",
        role = "kasir",
        userName = "Pengguna"
    } = {}) {
        this.container = document.querySelector(selector);

        if (!this.container) {
            console.error("Sidebar container tidak ditemukan.");
            return;
        }

        const normalizedRole = role.toLowerCase();
        const menuItems = this.menus[normalizedRole];

        if (!menuItems) {
            console.error("Role pengguna tidak dikenali.");
            return;
        }

        this.render(menuItems, normalizedRole, userName);
        this.setActiveMenu();
        this.initMobileSidebar();
    },

    /**
     * Merender struktur sidebar.
     */
    render(menuItems, role, userName) {
        const menuHTML = menuItems.map(item => `
            <a
                href="${item.link}"
                class="sidebar-link"
                data-page="${item.page}"
            >
                <i class="bi ${item.icon}"></i>
                <span>${item.title}</span>
            </a>
        `).join("");

        const roleLabel = role === "admin" ? "Administrator" : "Kasir";

        this.container.innerHTML = `
            <aside class="sidebar">

                <div class="sidebar-brand">
                    <div class="sidebar-brand-icon">
                        <i class="bi bi-cup-hot-fill"></i>
                    </div>

                    <div>
                        <h5>Kedai Kopi</h5>
                        <small>Management System</small>
                    </div>
                </div>

                <div class="sidebar-user">
                    <div class="sidebar-user-avatar">
                        <i class="bi bi-person-fill"></i>
                    </div>

                    <div class="sidebar-user-info">
                        <strong>${this.escapeHTML(userName)}</strong>
                        <small>${roleLabel}</small>
                    </div>
                </div>

                <nav class="sidebar-nav">
                    <small class="sidebar-section-title">
                        MENU UTAMA
                    </small>

                    ${menuHTML}
                </nav>

                <div class="sidebar-footer">
                    <small>
                        &copy; ${new Date().getFullYear()} Kedai Kopi
                    </small>
                </div>

            </aside>

            <div class="sidebar-overlay" id="sidebar-overlay"></div>
        `;
    },

    /**
     * Menandai menu berdasarkan halaman aktif.
     */
    setActiveMenu() {
        const currentPage = window.location.pathname
            .split("/")
            .pop();

        const links = this.container.querySelectorAll(
            ".sidebar-link"
        );

        links.forEach(link => {
            const page = link.dataset.page;

            link.classList.toggle(
                "active",
                page === currentPage
            );
        });
    },

    /**
     * Mengatur sidebar pada tampilan mobile.
     */
    initMobileSidebar() {
        const sidebar = this.container.querySelector(".sidebar");
        const overlay = this.container.querySelector("#sidebar-overlay");

        if (!sidebar || !overlay) return;

        overlay.addEventListener("click", () => {
            this.close();
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                this.close();
            }
        });
    },

    /**
     * Membuka sidebar.
     */
    open() {
        const sidebar = this.container?.querySelector(".sidebar");
        const overlay = this.container?.querySelector(
            "#sidebar-overlay"
        );

        sidebar?.classList.add("show");
        overlay?.classList.add("show");
    },

    /**
     * Menutup sidebar.
     */
    close() {
        const sidebar = this.container?.querySelector(".sidebar");
        const overlay = this.container?.querySelector(
            "#sidebar-overlay"
        );

        sidebar?.classList.remove("show");
        overlay?.classList.remove("show");
    },

    /**
     * Membersihkan teks dari karakter HTML.
     */
    escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[character];
        });
    }
};

// Membuat Sidebar tersedia secara global.
window.Sidebar = Sidebar;
