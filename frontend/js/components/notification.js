
/**
 * Notification Component
 * Menampilkan notifikasi menggunakan Bootstrap 5 Toast.
 */

const Notification = {
    container: null,

    /**
     * Membuat container notifikasi jika belum tersedia.
     */
    init() {
        if (this.container) return;

        this.container = document.createElement("div");
        this.container.id = "notification-container";
        this.container.className =
            "toast-container position-fixed top-0 end-0 p-3";

        this.container.style.zIndex = "1090";

        document.body.appendChild(this.container);
    },

    /**
     * Menampilkan notifikasi.
     *
     * @param {string} message - Pesan notifikasi.
     * @param {string} type - success, error, warning, info.
     * @param {number} duration - Durasi tampil dalam milidetik.
     */
    show(message, type = "info", duration = 3000) {
        this.init();

        const config = {
            success: {
                title: "Berhasil",
                className: "text-bg-success",
                icon: "bi-check-circle-fill"
            },
            error: {
                title: "Terjadi Kesalahan",
                className: "text-bg-danger",
                icon: "bi-x-circle-fill"
            },
            warning: {
                title: "Peringatan",
                className: "text-bg-warning",
                icon: "bi-exclamation-triangle-fill"
            },
            info: {
                title: "Informasi",
                className: "text-bg-primary",
                icon: "bi-info-circle-fill"
            }
        };

        const selected = config[type] || config.info;

        const toast = document.createElement("div");
        toast.className = `toast ${selected.className} border-0`;
        toast.setAttribute("role", "alert");
        toast.setAttribute("aria-live", "assertive");
        toast.setAttribute("aria-atomic", "true");

        const header = document.createElement("div");
        header.className =
            "toast-header border-0 bg-transparent text-white";

        const icon = document.createElement("i");
        icon.className = `${selected.icon} me-2`;

        const title = document.createElement("strong");
        title.className = "me-auto";
        title.textContent = selected.title;

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "btn-close btn-close-white";
        closeButton.setAttribute("data-bs-dismiss", "toast");
        closeButton.setAttribute("aria-label", "Close");

        header.append(icon, title, closeButton);

        const body = document.createElement("div");
        body.className = "toast-body";
        body.textContent = message;

        toast.append(header, body);
        this.container.appendChild(toast);

        const toastInstance = new bootstrap.Toast(toast, {
            autohide: duration > 0,
            delay: duration
        });

        toast.addEventListener("hidden.bs.toast", () => {
            toast.remove();
        });

        toastInstance.show();
    },

    success(message, duration = 3000) {
        this.show(message, "success", duration);
    },

    error(message, duration = 4000) {
        this.show(message, "error", duration);
    },

    warning(message, duration = 3500) {
        this.show(message, "warning", duration);
    },

    info(message, duration = 3000) {
        this.show(message, "info", duration);
    }
};

// Membuat Notification tersedia secara global.
window.Notification = Notification;
