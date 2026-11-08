
/**
 * Format Currency Utility
 * Mengatur format mata uang untuk aplikasi.
 */

const FormatCurrency = {
    /**
     * Format angka menjadi Rupiah.
     *
     * @param {number|string} value
     * @returns {string}
     */
    rupiah(value) {
        const amount = Number(value);

        if (!Number.isFinite(amount)) {
            return "Rp0";
        }

        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    /**
     * Format angka tanpa simbol mata uang.
     *
     * @param {number|string} value
     * @returns {string}
     */
    number(value) {
        const amount = Number(value);

        if (!Number.isFinite(amount)) {
            return "0";
        }

        return new Intl.NumberFormat("id-ID", {
            maximumFractionDigits: 0
        }).format(amount);
    },

    /**
     * Mengubah format Rupiah menjadi angka.
     *
     * Contoh: "Rp15.000" menjadi 15000.
     *
     * @param {string} value
     * @returns {number}
     */
    toNumber(value) {
        if (typeof value === "number") {
            return Number.isFinite(value) ? value : 0;
        }

        const result = Number(
            String(value).replace(/[^\d,-]/g, "").replace(",", ".")
        );

        return Number.isFinite(result) ? result : 0;
    }
};

window.FormatCurrency = FormatCurrency;
