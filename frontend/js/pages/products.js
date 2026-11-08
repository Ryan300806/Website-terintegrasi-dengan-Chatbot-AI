
/**
 * Products Page
 */

let productList = [];

document.addEventListener("DOMContentLoaded", async () => {
    await initializeProductsPage();
});

async function initializeProductsPage() {
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
            onLogout: handleProductLogout
        });

        Navbar.setTitle("Manajemen Produk", "Kelola produk kedai kopi");

        bindProductEvents();
        await loadProducts();
        await loadProductCategories();

    } catch (error) {
        console.error(error);
        Notification.error("Gagal memuat halaman produk.");
    }
}

function bindProductEvents() {
    document.getElementById("productSearch")
        ?.addEventListener("input", loadProducts);

    document.getElementById("productCategoryFilter")
        ?.addEventListener("change", loadProducts);

    document.getElementById("productStatusFilter")
        ?.addEventListener("change", loadProducts);

    document.getElementById("productForm")
        ?.addEventListener("submit", saveProduct);
}

async function loadProducts() {
    try {
        const params = {
            page: 1,
            limit: 100,
            search: document.getElementById("productSearch")?.value || "",
            category_id: document.getElementById("productCategoryFilter")?.value || "",
            status: document.getElementById("productStatusFilter")?.value || ""
        };

        const response = await ProductService.getAll(params);

        productList = response.data || [];

        renderProducts(productList);

    } catch (error) {
        console.error(error);
        Notification.error(error.message);
    }
}

function renderProducts(products) {
    const tbody = document.getElementById("productTableBody");

    if (!tbody) return;

    tbody.replaceChildren();

    if (!products.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    Produk tidak ditemukan.
                </td>
            </tr>
        `;
        return;
    }

    products.forEach(product => {
        const row = document.createElement("tr");

        const name = document.createElement("td");
        name.textContent = product.product_name;

        const category = document.createElement("td");
        category.textContent = product.category_name || "-";

        const price = document.createElement("td");
        price.textContent = formatProductCurrency(product.price);

        const status = document.createElement("td");
        status.textContent = product.status;
        status.className = product.status === "active"
            ? "text-success"
            : "text-secondary";

        const actions = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.className = "btn btn-sm btn-warning me-2";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
            openProductForm(product);
        });

        const statusButton = document.createElement("button");
        statusButton.className = "btn btn-sm btn-outline-secondary";
        statusButton.textContent = product.status === "active"
            ? "Nonaktifkan"
            : "Aktifkan";

        statusButton.addEventListener("click", () => {
            toggleProductStatus(product);
        });

        actions.append(editButton, statusButton);
        row.append(name, category, price, status, actions);

        tbody.appendChild(row);
    });
}

async function loadProductCategories() {
    const select = document.getElementById("productCategory");

    if (!select) return;

    try {
        const response = await CategoryService.getAll();

        select.replaceChildren();

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Pilih kategori";

        select.appendChild(defaultOption);

        (response.data || []).forEach(category => {
            const option = document.createElement("option");
            option.value = category.category_id;
            option.textContent = category.category_name;

            select.appendChild(option);
        });

    } catch (error) {
        Notification.error(error.message);
    }
}

function openProductForm(product = null) {
    const form = document.getElementById("productForm");

    if (!form) return;

    form.reset();

    document.getElementById("productId").value =
        product?.product_id || "";

    document.getElementById("productName").value =
        product?.product_name || "";

    document.getElementById("productCategory").value =
        product?.category_id || "";

    document.getElementById("productPrice").value =
        product?.price || "";

    document.getElementById("productDescription").value =
        product?.description || "";

    document.getElementById("productModalTitle").textContent =
        product ? "Edit Produk" : "Tambah Produk";

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById("productModal")
    ).show();
}

async function saveProduct(event) {
    event.preventDefault();

    const id = document.getElementById("productId").value;

    const productData = {
        product_name: document.getElementById("productName").value.trim(),
        category_id: Number(document.getElementById("productCategory").value),
        price: Number(document.getElementById("productPrice").value),
        description: document.getElementById("productDescription").value.trim()
    };

    if (
        !productData.product_name ||
        !productData.category_id ||
        !Number.isFinite(productData.price) ||
        productData.price <= 0
    ) {
        Notification.warning("Lengkapi data produk dengan benar.");
        return;
    }

    try {
        if (id) {
            await ProductService.update(id, productData);
            Notification.success("Produk berhasil diperbarui.");
        } else {
            await ProductService.create(productData);
            Notification.success("Produk berhasil ditambahkan.");
        }

        bootstrap.Modal.getInstance(
            document.getElementById("productModal")
        )?.hide();

        await loadProducts();

    } catch (error) {
        Notification.error(error.message);
    }
}

function toggleProductStatus(product) {
    const nextStatus = product.status === "active"
        ? "inactive"
        : "active";

    AppModal.confirm({
        title: "Ubah Status Produk",
        message: `Ubah status ${product.product_name} menjadi ${nextStatus}?`,
        confirmText: "Ya, Ubah",
        onConfirm: async () => {
            await ProductService.updateStatus(
                product.product_id,
                nextStatus
            );

            Notification.success("Status produk berhasil diperbarui.");
            await loadProducts();
        }
    });
}

function formatProductCurrency(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(value) || 0);
}

async function handleProductLogout() {
    try {
        await AuthService.logout();
        window.location.href = "login.html";
    } catch (error) {
        Notification.error(error.message);
    }
}
