
/**
 * Format Date Utility
 * Mengatur format tanggal dan waktu aplikasi.
 */

const FormatDate = {
    /**
     * Format tanggal menjadi tanggal Indonesia.
     *
     * @param {string|Date} value
     */
    date(value) {
        const date = this.parse(value);

        if (!date) return "-";

        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(date);
    },

    /**
     * Format tanggal dan waktu.
     *
     * @param {string|Date} value
     */
    dateTime(value) {
        const date = this.parse(value);

        if (!date) return "-";

        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }).format(date);
    },

    /**
     * Format tanggal singkat.
     *
     * @param {string|Date} value
     */
    shortDate(value) {
        const date = this.parse(value);

        if (!date) return "-";

        return new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).format(date);
    },

    /**
     * Format tanggal untuk input HTML type="date".
     *
     * @param {Date} value
     */
    toInputDate(value = new Date()) {
        const date = this.parse(value);

        if (!date) return "";

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    },

    /**
     * Memvalidasi dan mengubah nilai menjadi Date.
     *
     * @param {string|Date} value
     */
    parse(value) {
        if (!value) return null;

        const date = value instanceof Date
            ? new Date(value.getTime())
            : new Date(value);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        return date;
    }
};

window.FormatDate = FormatDate;
