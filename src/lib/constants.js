export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const ORDER_STATUS = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
};

export const PAYMENT_STATUS = {
    PENDING: 'Pending',
    PAID: 'Paid',
    FAILED: 'Failed',
    REFUNDED: 'Refunded',
};

export const RETURN_STATUS = {
    REQUESTED: 'Requested',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    PICKUP_SCHEDULED: 'PickupScheduled',
    PICKED: 'Picked',
    COMPLETED: 'Completed',
};

export const PAYMENT_METHODS = {
    COD: 'COD',
    RAZORPAY: 'Razorpay',
    WALLET: 'Wallet',
};

export const PRODUCT_CATEGORIES = [
    'Women',
    'Men',
    'Kids',
    'Banarasi Sarees',
    'Designer Suits',
    'Kanjivaram',
    'Party Wear',
];

export const SORT_OPTIONS = [
    { label: 'Newest First', value: '-createdAt' },
    { label: 'Oldest First', value: 'createdAt' },
    { label: 'Price: Low to High', value: 'price' },
    { label: 'Price: High to Low', value: '-price' },
    { label: 'Name: A-Z', value: 'name' },
    { label: 'Name: Z-A', value: '-name' },
];
