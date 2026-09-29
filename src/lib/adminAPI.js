import api from '@/lib/api';

export const adminAPI = {
    getDashboardStats: async () => {
        const response = await api.get('/admin/dashboard');
        return response.data;
    },
    getLowStockProducts: async () => {
        const response = await api.get('/admin/stock/low');
        return response.data;
    },
    getAllOrders: async ({ page = 1, limit = 20, status, search }) => {
        const response = await api.get('/admin/orders', { params: { page, limit, status, search } });
        return response.data;
    },
    getUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },
    toggleUserAdmin: async (id) => {
        const response = await api.put(`/admin/users/${id}/toggle`);
        return response.data;
    },
    deleteUser: async (id) => {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    },
    getReturns: async ({ page = 1, limit = 20, status } = {}) => {
        const response = await api.get('/returns/admin/all', { params: { page, limit, status: status || undefined } });
        return response.data;
    },
    updateReturnStatus: async (id, payload) => {
        const response = await api.put(`/returns/admin/${id}/status`, payload);
        return response.data;
    },
    processRefund: async (id) => {
        const response = await api.put(`/returns/admin/${id}/refund`);
        return response.data;
    },
    shipManually: async (orderId, payload) => {
        const response = await api.put(`/shipping/${orderId}/manual-ship`, payload);
        return response.data;
    },
    shipWithShiprocket: async (orderId) => {
        const response = await api.put(`/shipping/${orderId}/ship`);
        return response.data;
    },
    getOrderStats: async () => {
        const response = await api.get('/admin/orders/stats');
        return response.data;
    },
    getPaymentStats: async () => {
        const response = await api.get('/admin/payments/stats');
        return response.data;
    }
};
