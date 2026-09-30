export const calculateDiscount = (mrp, price) => {
    const originalPrice = Number(mrp);
    const offerPrice = Number(price);

    if (!Number.isFinite(originalPrice) || !Number.isFinite(offerPrice) || originalPrice <= 0 || offerPrice < 0 || offerPrice >= originalPrice) {
        return 0;
    }

    return Math.round(((originalPrice - offerPrice) / originalPrice) * 100);
};

const skuSegment = (value, maxLength = 12) => String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, maxLength)
    .replace(/-$/g, '');

export const createSkuId = () => {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
    return Math.random().toString(36).slice(2, 8).toUpperCase();
};

export const generateProductSku = ({ category, name, unit, size, color, id }) => {
    const parts = [
        'AYV',
        skuSegment(category, 8),
        skuSegment(name, 16),
        skuSegment(unit, 10),
        skuSegment(size, 10),
        skuSegment(color, 10),
        skuSegment(id, 6) || createSkuId(),
    ].filter(Boolean);

    return parts.join('-');
};