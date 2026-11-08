
/**
 * Navbar Component
 * Mengelola navbar, profil pengguna, dan navigasi mobile.
 */

const Navbar = {
    container: null,

    /**
     * Inisialisasi navbar.
     *
     * @param {Object} options
     */
    init({
        selector = "#navbar-container",
        userName = "Pengguna",
        role = "kasir",
        onLogout = null
    } = {}) {
        this.container = document.querySelector(selector);

        if (!this.container) {
            console.error("Navbar container tidak ditemukan.");
            return;
        }

        this.render(userName, role);
        this.bindEvents(onLogout);
    },

    /**
     * Merender navbar.
     */
    render(userName, role) {
        const roleLabel = role.toLowerCase() === "admin"
            ? "Administrator"
            : "Kasir";

        this.container.innerHTML = `
            <header class="navbar">

                <div class="navbar-left">

                    <button
                        type="button"
                        class="navbar-toggle"
                        id="navbar-toggle"
                        aria-label="Buka navigasi"
                    >
                        <i class="bi bi-list"></i>
                    </button>

                    <div class="navbar-page-info">
                        <h5 id="navbar-page-title">Dashboard</h5>
                        <small>Selamat datang di Kedai Kopi</small>
                    </div>

                </div>

                <div class="navbar-right">

                    <div class="navbar-profile dropdown">

                        <button
                            type="button"
                            class="navbar-profile-button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <div class="navbar-avatar">
                                <i class="bi bi-person-fill"></i>
                            </div>

                            <div class="navbar-profile-info">
                                <strong>${this.escapeHTML(userName)}</strong>
                                <small>${roleLabel}</small>
                            </div>

                            <i class="bi bi-chevron-down"></i>
                        </button>

                        <ul class="dropdown-menu dropdown-menu-end">

                            <li>
                                <span class="dropdown-item-text">
                                    <strong>${this.escapeHTML(userName)}</strong>
                                    <br>
                                    <small class="text-muted">
                                        ${roleLabel}
                                    </small>
                                </span>
                            </li>

                            <li>
                                <hr class="dropdown-divider">
                            </li>

                            <li>
                                <button
                                    type="button"
                                    class="dropdown-item text-danger"
                                    id="navbar-logout"
                                >
                                    <i class="bi bi-box-arrow-right me-2"></i>
                                    Logout
                                </button>
                            </li>

                        </ul>

                    </div>

                </div>

            </header>
        `;
    },

    /**
     * Menghubungkan event navbar.
     */
    bindEvents(onLogout) {
        const toggleButton = this.container.querySelector(
            "#navbar-toggle"
        );

        const logoutButton = this.container.querySelector(
            "#navbar-logout"
        );

        toggleButton?.addEventListener("click", () => {
            if (window.Sidebar) {
                Sidebar.open();
            }
        });

        logoutButton?.addEventListener("click", async () => {
            if (typeof onLogout === "function") {
                await onLogout();
            } else {
                console.warn(
                    "Fungsi logout belum dihubungkan."
                );
            }
        });
    },

    /**
     * Mengubah judul halaman.
     */
    setTitle(title, subtitle = "Selamat datang di Kedai Kopi") {
        if (!this.container) return;

        const titleElement = this.container.querySelector(
            "#navbar-page-title"
        );

        const subtitleElement = this.container.querySelector(
            ".navbar-page-info small"
        );

        if (titleElement) {
            titleElement.textContent = title;
        }

        if (subtitleElement) {
            subtitleElement.textContent = subtitle;
        }
    },

    /**
     * Mengubah informasi pengguna.
     */
    setUser(userName, role) {
        if (!this.container) return;

        const roleLabel = role.toLowerCase() === "admin"
            ? "Administrator"
            : "Kasir";

        const profileInfo = this.container.querySelector(
            ".navbar-profile-info"
        );

        const dropdownInfo = this.container.querySelector(
            ".dropdown-item-text"
        );

        if (profileInfo) {
            profileInfo.innerHTML = `
                <strong>${this.escapeHTML(userName)}</strong>
                <small>${roleLabel}</small>
            `;
        }

        if (dropdownInfo) {
            dropdownInfo.innerHTML = `
                <strong>${this.escapeHTML(userName)}</strong>
                <br>
                <small class="text-muted">${roleLabel}</small>
            `;
        }
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

// Membuat Navbar tersedia secara global.
window.Navbar = Navbar;
