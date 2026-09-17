import api from '@/lib/api';

export const adminAPI = {
    getDashboardStats: async () => {
        const response = await api.get('/admin/dashboard');
        return response.data;
    },
    getAllOrders: async ({ page = 1, limit = 20 }) => {
        const response = await api.get(`/admin/orders?page=${page}&limit=${limit}`);
        return response.data;
    },
    getOrderStats: async () => {
        const response = await api.get('/admin/orders/stats');
        return response.data;
    }
};
