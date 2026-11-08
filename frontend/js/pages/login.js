
/**
 * Login Page
 */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const submitButton = document.getElementById("loginButton");
    const alertBox = document.getElementById("loginAlert");

    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            showMessage("Username dan password wajib diisi.", "danger");
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Memproses...";

        try {
            const response = await AuthService.login(
                username,
                password
            );

            if (response.status === "success") {
                showMessage("Login berhasil!", "success");

                window.location.href = "dashboard.html";
            }

        } catch (error) {
            showMessage(
                error.message || "Username atau password salah.",
                "danger"
            );

        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Masuk";
        }
    });

    function showMessage(message, type) {
        if (alertBox) {
            alertBox.textContent = message;
            alertBox.className = `alert alert-${type}`;
            alertBox.classList.remove("d-none");
        } else if (window.Notification) {
            if (type === "success") Notification.success(message);
            else Notification.error(message);
        }
    }
});
