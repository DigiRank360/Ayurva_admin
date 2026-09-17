import api from '@/lib/api';

export const bannerAPI = {
    // Get all banners (admin)
    getAll: async () => {
        const response = await api.get('/banners/admin');
        return response.data;
    },

    // Get single banner
    getById: async (id) => {
        const response = await api.get(`/banners/${id}`);
        return response.data;
    },

    // Create banner
    create: async (bannerData) => {
        const response = await api.post('/banners', bannerData);
        return response.data;
    },

    // Update banner
    update: async (id, bannerData) => {
        const response = await api.put(`/banners/${id}`, bannerData);
        return response.data;
    },

    // Delete banner
    delete: async (id) => {
        const response = await api.delete(`/banners/${id}`);
        return response.data;
    },

    // Toggle banner status
    toggle: async (id) => {
        const response = await api.put(`/banners/${id}/toggle`);
        return response.data;
    },
};
