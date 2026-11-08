
/**
 * Validation Utility
 * Mengelola validasi input aplikasi.
 */

const Validation = {
    /**
     * Memeriksa apakah nilai kosong.
     */
    required(value) {
        return (
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
        );
    },

    /**
     * Memvalidasi email.
     */
    email(value) {
        if (!this.required(value)) return false;

        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return pattern.test(String(value).trim());
    },

    /**
     * Memvalidasi username.
     * Huruf, angka, underscore, dan titik.
     */
    username(value) {
        if (!this.required(value)) return false;

        const pattern = /^[a-zA-Z0-9_.]{3,50}$/;

        return pattern.test(String(value).trim());
    },

    /**
     * Memvalidasi password minimal 12 karakter.
     */
    password(value) {
        return (
            typeof value === "string" &&
            value.length >= 12
        );
    },

    /**
     * Memvalidasi angka positif.
     */
    positiveNumber(value) {
        if (value === "" || value === null || value === undefined) {
            return false;
        }

        const number = Number(value);

        return Number.isFinite(number) && number > 0;
    },

    /**
     * Memvalidasi harga produk.
     */
    price(value) {
        return this.positiveNumber(value);
    },

    /**
     * Memvalidasi kuantitas produk.
     */
    quantity(value) {
        const number = Number(value);

        return (
            Number.isInteger(number) &&
            number > 0
        );
    },

    /**
     * Memvalidasi role pengguna.
     */
    role(value) {
        return ["admin", "kasir"].includes(value);
    },

    /**
     * Memvalidasi status.
     */
    status(value) {
        return ["active", "inactive"].includes(value);
    },

    /**
     * Memvalidasi metode pembayaran.
     * Sesuaikan daftar ini dengan enum di backend.
     */
    paymentMethod(value) {
        return ["cash", "transfer", "qris"].includes(
            String(value).toLowerCase()
        );
    },

    /**
     * Memvalidasi format tanggal YYYY-MM-DD.
     */
    date(value) {
        if (typeof value !== "string") return false;

        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return false;
        }

        const [year, month, day] = value.split("-").map(Number);

        const date = new Date(year, month - 1, day);

        return (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
        );
    },

    /**
     * Memvalidasi rentang tanggal.
     */
    dateRange(startDate, endDate) {
        if (!this.date(startDate) || !this.date(endDate)) {
            return false;
        }

        return startDate <= endDate;
    },

    /**
     * Memeriksa seluruh field wajib dalam object.
     */
    requiredFields(data, fields) {
        return fields.every(field =>
            this.required(data[field])
        );
    }
};

window.Validation = Validation;
