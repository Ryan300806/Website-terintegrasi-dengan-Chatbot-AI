
/**
 * Modal Component
 * Mengelola modal Bootstrap 5 secara dinamis.
 */

const AppModal = {
    instance: null,
    element: null,

    /**
     * Membuat struktur modal.
     */
    init() {
        if (this.element) return;

        const modal = document.createElement("div");

        modal.id = "app-modal";
        modal.className = "modal fade";
        modal.tabIndex = -1;
        modal.setAttribute("aria-hidden", "true");

        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">

                    <div class="modal-header">
                        <h5 class="modal-title" id="app-modal-title">
                            Informasi
                        </h5>

                        <button
                            type="button"
                            class="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close">
                        </button>
                    </div>

                    <div class="modal-body" id="app-modal-body">
                    </div>

                    <div class="modal-footer" id="app-modal-footer">
                    </div>

                </div>
            </div>
        `;

        document.body.appendChild(modal);

        this.element = modal;
        this.instance = new bootstrap.Modal(modal);
    },

    /**
     * Menampilkan modal umum.
     *
     * @param {Object} options
     */
    show({
        title = "Informasi",
        body = "",
        footer = "",
        size = "",
        centered = true
    } = {}) {
        this.init();

        const dialog = this.element.querySelector(".modal-dialog");

        dialog.className = "modal-dialog";

        if (centered) {
            dialog.classList.add("modal-dialog-centered");
        }

        if (size) {
            dialog.classList.add(`modal-${size}`);
        }

        this.element.querySelector("#app-modal-title").textContent = title;

        const bodyElement = this.element.querySelector("#app-modal-body");
        const footerElement = this.element.querySelector("#app-modal-footer");

        bodyElement.replaceChildren();
        footerElement.replaceChildren();

        if (body instanceof Node) {
            bodyElement.appendChild(body);
        } else {
            bodyElement.innerHTML = body;
        }

        if (footer instanceof Node) {
            footerElement.appendChild(footer);
        } else {
            footerElement.innerHTML = footer;
        }

        this.instance.show();
    },

    /**
     * Menampilkan modal konfirmasi.
     *
     * @param {Object} options
     */
    confirm({
        title = "Konfirmasi",
        message = "Apakah Anda yakin ingin melanjutkan?",
        confirmText = "Ya, Lanjutkan",
        cancelText = "Batal",
        confirmClass = "btn-primary",
        onConfirm = () => {}
    } = {}) {
        this.init();

        const footer = document.createElement("div");
        footer.className = "d-flex gap-2";

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.className = "btn btn-light";
        cancelButton.textContent = cancelText;
        cancelButton.setAttribute("data-bs-dismiss", "modal");

        const confirmButton = document.createElement("button");
        confirmButton.type = "button";
        confirmButton.className = `btn ${confirmClass}`;
        confirmButton.textContent = confirmText;

        confirmButton.addEventListener("click", async () => {
            confirmButton.disabled = true;

            try {
                await onConfirm();
                this.hide();
            } catch (error) {
                console.error("Modal confirmation error:", error);
            } finally {
                confirmButton.disabled = false;
            }
        });

        footer.append(cancelButton, confirmButton);

        this.show({
            title,
            body: message,
            footer
        });
    },

    /**
     * Menutup modal.
     */
    hide() {
        if (this.instance) {
            this.instance.hide();
        }
    },

    /**
     * Membersihkan instance setelah modal ditutup.
     */
    destroy() {
        if (!this.element) return;

        this.hide();

        this.element.addEventListener(
            "hidden.bs.modal",
            () => {
                this.element.remove();
                this.instance.dispose();

                this.element = null;
                this.instance = null;
            },
            { once: true }
        );
    }
};

// Membuat AppModal tersedia secara global.
window.AppModal = AppModal;
