
/**
 * Transactions Page - Point of Sale
 */

let posProducts = [];
let cartItems = [];

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const auth = await AuthService.checkAuth();

        if (!auth.authenticated) {
            window.location.href = "login.html";
            return;
        }

        Sidebar.init({
            role: auth.user.role,
            userName: auth.user.name
        });

        Navbar.init({
            userName: auth.user.name,
            role: auth.user.role,
            onLogout: handleTransactionLogout
        });

        Navbar.setTitle("Transaksi Penjualan", "Buat transaksi baru");

        bindTransactionEvents();
        await loadPOSProducts();

    } catch (error) {
        console.error(error);
        Notification.error("Gagal memuat halaman transaksi.");
    }
});

function bindTransactionEvents() {
    document.getElementById("posSearch")
        ?.addEventListener("input", renderPOSProducts);

    document.getElementById("paymentAmount")
        ?.addEventListener("input", updateCartSummary);

    document.getElementById("paymentMethod")
        ?.addEventListener("change", updateCartSummary);

    document.getElementById("checkoutButton")
        ?.addEventListener("click", checkoutTransaction);
}

async function loadPOSProducts() {
    try {
        const response = await ProductService.getAll({
            page: 1,
            limit: 100,
            status: "active"
        });

        posProducts = (response.data || []).filter(
            product => product.status === "active"
        );

        renderPOSProducts();

    } catch (error) {
        Notification.error(error.message);
    }
}

function renderPOSProducts() {
    const container = document.getElementById("posProductList");

    if (!container) return;

    const keyword = (
        document.getElementById("posSearch")?.value || ""
    ).toLowerCase();

    const filtered = posProducts.filter(product =>
        product.product_name.toLowerCase().includes(keyword)
    );

    container.replaceChildren();

    if (!filtered.length) {
        container.textContent = "Produk tidak ditemukan.";
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement("div");
        card.className = "pos-product-card";

        const name = document.createElement("h6");
        name.textContent = product.product_name;

        const price = document.createElement("p");
        price.textContent = formatPOSCurrency(product.price);

        const button = document.createElement("button");
        button.className = "btn btn-primary btn-sm";
        button.textContent = "Tambah";

        button.addEventListener("click", () => {
            addToCart(product);
        });

        card.append(name, price, button);
        container.appendChild(card);
    });
}

function addToCart(product) {
    const existing = cartItems.find(
        item => item.product_id === product.product_id
    );

    if (existing) {
        existing.quantity += 1;
    } else {
        cartItems.push({
            product_id: product.product_id,
            product_name: product.product_name,
            price: Number(product.price),
            quantity: 1
        });
    }

    renderCart();
}

function changeCartQuantity(productId, change) {
    const item = cartItems.find(
        item => item.product_id === productId
    );

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        cartItems = cartItems.filter(
            item => item.product_id !== productId
        );
    }

    renderCart();
}

function removeFromCart(productId) {
    cartItems = cartItems.filter(
        item => item.product_id !== productId
    );

    renderCart();
}

function renderCart() {
    const container = document.getElementById("cartItems");

    if (!container) return;

    container.replaceChildren();

    if (!cartItems.length) {
        container.textContent = "Keranjang masih kosong.";
        updateCartSummary();
        return;
    }

    cartItems.forEach(item => {
        const row = document.createElement("div");
        row.className = "cart-item";

        const name = document.createElement("span");
        name.textContent = item.product_name;

        const quantity = document.createElement("span");
        quantity.textContent = item.quantity;

        const subtotal = document.createElement("strong");
        subtotal.textContent = formatPOSCurrency(
            item.price * item.quantity
        );

        const decrease = document.createElement("button");
        decrease.textContent = "-";
        decrease.className = "btn btn-sm btn-light";
        decrease.addEventListener("click", () => {
            changeCartQuantity(item.product_id, -1);
        });

        const increase = document.createElement("button");
        increase.textContent = "+";
        increase.className = "btn btn-sm btn-light";
        increase.addEventListener("click", () => {
            changeCartQuantity(item.product_id, 1);
        });

        const remove = document.createElement("button");
        remove.textContent = "Hapus";
        remove.className = "btn btn-sm btn-outline-danger";
        remove.addEventListener("click", () => {
            removeFromCart(item.product_id);
        });

        row.append(
            name,
            decrease,
            quantity,
            increase,
            subtotal,
            remove
        );

        container.appendChild(row);
    });

    updateCartSummary();
}

function getCartTotal() {
    return cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );
}

function updateCartSummary() {
    const total = getCartTotal();

    const payment = Number(
        document.getElementById("paymentAmount")?.value || 0
    );

    const change = Math.max(payment - total, 0);

    setPOSValue("cartTotal", formatPOSCurrency(total));
    setPOSValue("paymentChange", formatPOSCurrency(change));
}

async function checkoutTransaction() {
    if (!cartItems.length) {
        Notification.warning("Keranjang masih kosong.");
        return;
    }

    const paymentMethod = document.getElementById("paymentMethod")?.value;
    const amountPaid = Number(
        document.getElementById("paymentAmount")?.value || 0
    );

    const total = getCartTotal();

    if (!paymentMethod) {
        Notification.warning("Pilih metode pembayaran.");
        return;
    }

    if (!Number.isFinite(amountPaid) || amountPaid < total) {
        Notification.warning("Pembayaran tidak mencukupi.");
        return;
    }

    const transactionData = {
        items: cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity
        })),

        payment_method: paymentMethod,
        amount_paid: amountPaid
    };

    const checkoutButton = document.getElementById("checkoutButton");

    try {
        checkoutButton.disabled = true;
        checkoutButton.textContent = "Memproses...";

        const response = await TransactionService.create(
            transactionData
        );

        cartItems = [];
        renderCart();

        document.getElementById("paymentAmount").value = "";

        Notification.success(
            `Transaksi berhasil. Invoice: ${response.data.invoice_number}`
        );

        if (typeof window.showTransactionReceipt === "function") {
            window.showTransactionReceipt(response.data);
        }

    } catch (error) {
        Notification.error(error.message);

    } finally {
        checkoutButton.disabled = false;
        checkoutButton.textContent = "Proses Pembayaran";
    }
}

function setPOSValue(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function formatPOSCurrency(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(value) || 0);
}

async function handleTransactionLogout() {
    try {
        await AuthService.logout();
        window.location.href = "login.html";
    } catch (error) {
        Notification.error(error.message);
    }
}
