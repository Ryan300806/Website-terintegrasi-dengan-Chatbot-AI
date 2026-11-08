
/**
 * Users Page
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
            onLogout: handleUserLogout
        });

        Navbar.setTitle("Manajemen Pengguna", "Kelola akun Admin dan Kasir");

        bindUserEvents();
        await loadUsers();

    } catch (error) {
        console.error(error);
        Notification.error("Gagal memuat manajemen pengguna.");
    }
});

function bindUserEvents() {
    document.getElementById("userSearch")
        ?.addEventListener("input", loadUsers);

    document.getElementById("userForm")
        ?.addEventListener("submit", saveUser);
}

async function loadUsers() {
    try {
        const response = await UserService.getAll({
            page: 1,
            limit: 100,
            search: document.getElementById("userSearch")?.value || ""
        });

        renderUsers(response.data || []);

    } catch (error) {
        Notification.error(error.message);
    }
}

function renderUsers(users) {
    const tbody = document.getElementById("userTableBody");

    if (!tbody) return;

    tbody.replaceChildren();

    if (!users.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    Pengguna tidak ditemukan.
                </td>
            </tr>
        `;
        return;
    }

    users.forEach(user => {
        const row = document.createElement("tr");

        const name = document.createElement("td");
        name.textContent = user.name;

        const username = document.createElement("td");
        username.textContent = user.username;

        const email = document.createElement("td");
        email.textContent = user.email;

        const role = document.createElement("td");
        role.textContent = user.role;

        const status = document.createElement("td");
        status.textContent = user.status;
        status.className = user.status === "active"
            ? "text-success"
            : "text-secondary";

        const actions = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.className = "btn btn-sm btn-warning me-2";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
            openUserForm(user);
        });

        const statusButton = document.createElement("button");
        statusButton.className = "btn btn-sm btn-outline-secondary me-2";
        statusButton.textContent = user.status === "active"
            ? "Nonaktifkan"
            : "Aktifkan";

        statusButton.disabled =
            Number(user.user_id) === Number(window.currentUserId);

        statusButton.addEventListener("click", () => {
            toggleUserStatus(user);
        });

        const passwordButton = document.createElement("button");
        passwordButton.className = "btn btn-sm btn-outline-primary";
        passwordButton.textContent = "Password";
        passwordButton.addEventListener("click", () => {
            openPasswordForm(user);
        });

        actions.append(editButton, statusButton, passwordButton);

        row.append(name, username, email, role, status, actions);
        tbody.appendChild(row);
    });
}

function openUserForm(user = null) {
    const form = document.getElementById("userForm");

    if (!form) return;

    form.reset();

    document.getElementById("userId").value =
        user?.user_id || "";

    document.getElementById("userName").value =
        user?.name || "";

    document.getElementById("userUsername").value =
        user?.username || "";

    document.getElementById("userEmail").value =
        user?.email || "";

    document.getElementById("userRole").value =
        user?.role || "kasir";

    const passwordGroup = document.getElementById("userPasswordGroup");

    if (passwordGroup) {
        passwordGroup.classList.toggle("d-none", Boolean(user));
    }

    document.getElementById("userModalTitle").textContent =
        user ? "Edit Pengguna" : "Tambah Pengguna";

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById("userModal")
    ).show();
}

async function saveUser(event) {
    event.preventDefault();

    const id = document.getElementById("userId").value;

    const userData = {
        name: document.getElementById("userName").value.trim(),
        username: document.getElementById("userUsername").value.trim(),
        email: document.getElementById("userEmail").value.trim(),
        role: document.getElementById("userRole").value
    };

    if (!userData.name || !userData.username || !userData.email) {
        Notification.warning("Lengkapi seluruh data pengguna.");
        return;
    }

    if (!id) {
        userData.password = document.getElementById("userPassword").value;

        if (userData.password.length < 12) {
            Notification.warning("Password minimal 12 karakter.");
            return;
        }
    }

    try {
        if (id) {
            await UserService.update(id, userData);
            Notification.success("Pengguna berhasil diperbarui.");
        } else {
            await UserService.create(userData);
            Notification.success("Pengguna berhasil ditambahkan.");
        }

        bootstrap.Modal.getInstance(
            document.getElementById("userModal")
        )?.hide();

        await loadUsers();

    } catch (error) {
        Notification.error(error.message);
    }
}

function toggleUserStatus(user) {
    const nextStatus = user.status === "active"
        ? "inactive"
        : "active";

    AppModal.confirm({
        title: "Ubah Status Pengguna",
        message: `Ubah status ${user.name} menjadi ${nextStatus}?`,
        confirmText: "Ya, Ubah",

        onConfirm: async () => {
            await UserService.updateStatus(
                user.user_id,
                nextStatus
            );

            Notification.success("Status pengguna diperbarui.");
            await loadUsers();
        }
    });
}

function openPasswordForm(user) {
    const wrapper = document.createElement("div");

    const label = document.createElement("label");
    label.className = "form-label";
    label.textContent = "Password baru";

    const input = document.createElement("input");
    input.type = "password";
    input.id = "newUserPassword";
    input.className = "form-control";
    input.minLength = 12;
    input.placeholder = "Minimal 12 karakter";

    wrapper.append(label, input);

    const footer = document.createElement("div");
    footer.className = "d-flex gap-2";

    const cancelButton = document.createElement("button");
    cancelButton.className = "btn btn-light";
    cancelButton.textContent = "Batal";
    cancelButton.setAttribute("data-bs-dismiss", "modal");

    const saveButton = document.createElement("button");
    saveButton.className = "btn btn-primary";
    saveButton.textContent = "Simpan Password";

    saveButton.addEventListener("click", async () => {
        const password = input.value;

        if (password.length < 12) {
            Notification.warning("Password minimal 12 karakter.");
            return;
        }

        try {
            await UserService.changePassword(
                user.user_id,
                password
            );

            AppModal.hide();
            Notification.success("Password berhasil diperbarui.");

        } catch (error) {
            Notification.error(error.message);
        }
    });

    footer.append(cancelButton, saveButton);

    AppModal.show({
        title: `Ubah Password - ${user.name}`,
        body: wrapper,
        footer
    });
}

async function handleUserLogout() {
    try {
        await AuthService.logout();
        window.location.href = "login.html";
    } catch (error) {
        Notification.error(error.message);
    }
}
