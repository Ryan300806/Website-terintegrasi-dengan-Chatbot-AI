
/**
 * Transaction History Page
 */

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const auth = await AuthService.checkAuth();

        if (!auth.authenticated) {
            window.location.href = "login.html";
            return;
        }

        window.currentUser = auth.user;

        Sidebar.init({
            role: auth.user.role,
            userName: auth.user.name
        });

        Navbar.init({
            userName: auth.user.name,
            role: auth.user.role,
            onLogout: handleHistoryLogout
        });

        Navbar.setTitle(
            "Riwayat Transaksi",
            "Lihat seluruh catatan transaksi"
        );

        bindHistoryEvents();
        await loadTransactionHistory();

    } catch (error) {
        console.error(error);
        Notification.error("Gagal memuat riwayat transaksi.");
    }
});

function bindHistoryEvents() {
    document.getElementById("historySearch")
        ?.addEventListener("input", loadTransactionHistory);

    document.getElementById("historyStatus")
        ?.addEventListener("change", loadTransactionHistory);

    document.getElementById("historyDateFrom")
        ?.addEventListener("change", loadTransactionHistory);

    document.getElementById("historyDateTo")
        ?.addEventListener("change", loadTransactionHistory);
}

async function loadTransactionHistory() {
    try {
        const params = {
            page: 1,
            limit: 100,
            status: document.getElementById("historyStatus")?.value || "",
            date_from: document.getElementById("historyDateFrom")?.value || "",
            date_to: document.getElementById("historyDateTo")?.value || ""
        };

        const response = await TransactionService.getAll(params);

        let transactions = response.data || [];

        const keyword = (
            document.getElementById("historySearch")?.value || ""
        ).toLowerCase();

        if (keyword) {
            transactions = transactions.filter(item =>
                String(item.invoice_number).toLowerCase().includes(keyword) ||
                String(item.cashier_name).toLowerCase().includes(keyword)
            );
        }

        renderTransactionHistory(transactions);

    } catch (error) {
        console.error(error);
        Notification.error(error.message);
    }
}

function renderTransactionHistory(transactions) {
    const tbody = document.getElementById("historyTableBody");

    if (!tbody) return;

    tbody.replaceChildren();

    if (!transactions.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    Tidak ada transaksi ditemukan.
                </td>
            </tr>
        `;
        return;
    }

    transactions.forEach(transaction => {
        const row = document.createElement("tr");

        const invoice = document.createElement("td");
        invoice.textContent = transaction.invoice_number;

        const date = document.createElement("td");
        date.textContent = new Date(
            transaction.transaction_date
        ).toLocaleString("id-ID");

        const cashier = document.createElement("td");
        cashier.textContent = transaction.cashier_name;

        const total = document.createElement("td");
        total.textContent = formatHistoryCurrency(
            transaction.total_amount
        );

        const method = document.createElement("td");
        method.textContent = transaction.payment_method;

        const status = document.createElement("td");
        status.textContent = transaction.status;
        status.className = transaction.status === "completed"
            ? "text-success"
            : "text-danger";

        const actions = document.createElement("td");

        const detailButton = document.createElement("button");
        detailButton.className = "btn btn-sm btn-primary me-2";
        detailButton.textContent = "Detail";

        detailButton.addEventListener("click", () => {
            showTransactionDetail(transaction.transaction_id);
        });

        actions.appendChild(detailButton);

        if (
            window.currentUser.role === "admin" &&
            transaction.status === "completed"
        ) {
            const cancelButton = document.createElement("button");

            cancelButton.className = "btn btn-sm btn-danger";
            cancelButton.textContent = "Batalkan";

            cancelButton.addEventListener("click", () => {
                cancelHistoryTransaction(transaction);
            });

            actions.appendChild(cancelButton);
        }

        row.append(
            invoice,
            date,
            cashier,
            total,
            method,
            status,
            actions
        );

        tbody.appendChild(row);
    });
}

async function showTransactionDetail(id) {
    try {
        const response = await TransactionService.getById(id);
        const transaction = response.data;

        const wrapper = document.createElement("div");

        const invoice = document.createElement("p");
        invoice.textContent = `Invoice: ${transaction.invoice_number}`;

        const cashier = document.createElement("p");
        cashier.textContent = `Kasir: ${transaction.cashier_name}`;

        const total = document.createElement("p");
        total.textContent = `Total: ${formatHistoryCurrency(transaction.total_amount)}`;

        const status = document.createElement("p");
        status.textContent = `Status: ${transaction.status}`;

        const heading = document.createElement("h6");
        heading.textContent = "Detail Produk";

        const list = document.createElement("ul");

        (transaction.details || []).forEach(item => {
            const li = document.createElement("li");

            li.textContent =
                `${item.product_name} - ${item.quantity} x ` +
                `${formatHistoryCurrency(item.unit_price)} = ` +
                `${formatHistoryCurrency(item.subtotal)}`;

            list.appendChild(li);
        });

        wrapper.append(invoice, cashier, total, status, heading, list);

        AppModal.show({
            title: "Detail Transaksi",
            body: wrapper
        });

    } catch (error) {
        Notification.error(error.message);
    }
}

function cancelHistoryTransaction(transaction) {
    AppModal.show({
        title: "Batalkan Transaksi",
        body: `
            <p>Invoice: ${escapeHistoryHTML(transaction.invoice_number)}</p>
            <label for="cancellationReason" class="form-label">
                Alasan pembatalan
            </label>
            <textarea
                id="cancellationReason"
                class="form-control"
                rows="3"
                required
            ></textarea>
        `,
        footer: createCancelFooter(transaction)
    });
}

function createCancelFooter(transaction) {
    const wrapper = document.createElement("div");
    wrapper.className = "d-flex gap-2";

    const closeButton = document.createElement("button");
    closeButton.className = "btn btn-light";
    closeButton.textContent = "Tutup";
    closeButton.setAttribute("data-bs-dismiss", "modal");

    const confirmButton = document.createElement("button");
    confirmButton.className = "btn btn-danger";
    confirmButton.textContent = "Batalkan Transaksi";

    confirmButton.addEventListener("click", async () => {
        const reason = document.getElementById(
            "cancellationReason"
        )?.value.trim();

        if (!reason) {
            Notification.warning("Alasan pembatalan wajib diisi.");
            return;
        }

        try {
            await TransactionService.cancel(
                transaction.transaction_id,
                reason
            );

            AppModal.hide();
            Notification.success("Transaksi berhasil dibatalkan.");

            await loadTransactionHistory();

        } catch (error) {
            Notification.error(error.message);
        }
    });

    wrapper.append(closeButton, confirmButton);

    return wrapper;
}

function escapeHistoryHTML(value) {
    const element = document.createElement("span");
    element.textContent = value;
    return element.innerHTML;
}

function formatHistoryCurrency(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(value) || 0);
}

async function handleHistoryLogout() {
    try {
        await AuthService.logout();
        window.location.href = "login.html";
    } catch (error) {
        Notification.error(error.message);
    }
}
