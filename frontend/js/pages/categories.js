
/**
 * Categories Page
 */

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
            onLogout: handleCategoryLogout
        });

        Navbar.setTitle("Manajemen Kategori", "Kelola kategori produk");

        bindCategoryEvents();
        await loadCategories();

    } catch (error) {
        console.error(error);
        Notification.error("Gagal memuat kategori.");
    }
});

function bindCategoryEvents() {
    document.getElementById("categoryAddButton")
        ?.addEventListener("click", () => openCategoryForm());

    document.getElementById("categoryForm")
        ?.addEventListener("submit", saveCategory);
}

async function loadCategories() {
    try {
        const response = await CategoryService.getAll();

        renderCategories(response.data || []);

    } catch (error) {
        Notification.error(error.message);
    }
}

function renderCategories(categories) {
    const tbody = document.getElementById("categoryTableBody");

    if (!tbody) return;

    tbody.replaceChildren();

    if (!categories.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    Belum ada kategori.
                </td>
            </tr>
        `;
        return;
    }

    categories.forEach(category => {
        const row = document.createElement("tr");

        const name = document.createElement("td");
        name.textContent = category.category_name;

        const description = document.createElement("td");
        description.textContent = category.description || "-";

        const count = document.createElement("td");
        count.textContent = category.product_count ?? 0;

        const actions = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.className = "btn btn-sm btn-warning me-2";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
            openCategoryForm(category);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "btn btn-sm btn-danger";
        deleteButton.textContent = "Hapus";
        deleteButton.addEventListener("click", () => {
            deleteCategory(category);
        });

        actions.append(editButton, deleteButton);
        row.append(name, description, count, actions);

        tbody.appendChild(row);
    });
}

function openCategoryForm(category = null) {
    const form = document.getElementById("categoryForm");

    if (!form) return;

    form.reset();

    document.getElementById("categoryId").value =
        category?.category_id || "";

    document.getElementById("categoryName").value =
        category?.category_name || "";

    document.getElementById("categoryDescription").value =
        category?.description || "";

    document.getElementById("categoryModalTitle").textContent =
        category ? "Edit Kategori" : "Tambah Kategori";

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById("categoryModal")
    ).show();
}

async function saveCategory(event) {
    event.preventDefault();

    const id = document.getElementById("categoryId").value;

    const categoryData = {
        category_name: document.getElementById("categoryName").value.trim(),
        description: document.getElementById("categoryDescription").value.trim()
    };

    if (!categoryData.category_name) {
        Notification.warning("Nama kategori wajib diisi.");
        return;
    }

    try {
        if (id) {
            await CategoryService.update(id, categoryData);
            Notification.success("Kategori berhasil diperbarui.");
        } else {
            await CategoryService.create(categoryData);
            Notification.success("Kategori berhasil ditambahkan.");
        }

        bootstrap.Modal.getInstance(
            document.getElementById("categoryModal")
        )?.hide();

        await loadCategories();

    } catch (error) {
        Notification.error(error.message);
    }
}

function deleteCategory(category) {
    AppModal.confirm({
        title: "Hapus Kategori",
        message: `Hapus kategori "${category.category_name}"?`,
        confirmText: "Ya, Hapus",
        confirmClass: "btn-danger",

        onConfirm: async () => {
            await CategoryService.delete(category.category_id);

            Notification.success("Kategori berhasil dihapus.");
            await loadCategories();
        }
    });
}

async function handleCategoryLogout() {
    try {
        await AuthService.logout();
        window.location.href = "login.html";
    } catch (error) {
        Notification.error(error.message);
    }
}
