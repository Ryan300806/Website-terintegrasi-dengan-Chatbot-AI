function httpError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function requireText(value, field, maxLength) {
    if (typeof value !== "string" || !value.trim()) {
        throw httpError(400, `${field} wajib diisi`);
    }

    const result = value.trim();

    if (result.length > maxLength) {
        throw httpError(
            400,
            `${field} maksimal ${maxLength} karakter`
        );
    }

    return result;
}

function positiveInt(value, field) {
    const number = Number(value);

    if (!Number.isInteger(number) || number <= 0) {
        throw httpError(400, `${field} harus bilangan bulat positif`);
    }

    return number;
}

function positiveMoney(value, field, allowZero = false) {
    const number = Number(value);

    if (
        !Number.isFinite(number) ||
        (allowZero ? number < 0 : number <= 0)
    ) {
        throw httpError(400, `${field} tidak valid`);
    }

    return Math.round((number + Number.EPSILON) * 100) / 100;
}

function validEmail(value) {
    const email = requireText(value, "Email", 100).toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw httpError(400, "Format email tidak valid");
    }

    return email;
}

function pagination(query) {
    const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
    const limit = Math.min(
        100,
        Math.max(1, Number.parseInt(query.limit, 10) || 20)
    );

    return {
        page,
        limit,
        offset: (page - 1) * limit
    };
}

module.exports = {
    httpError,
    requireText,
    positiveInt,
    positiveMoney,
    validEmail,
    pagination
};