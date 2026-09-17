import api from '@/lib/api';

export const offerAPI = {
    // Get all offers (admin)
    getAll: async () => {
        const response = await api.get('/offers/admin');
        return response.data;
    },

    // Get single offer
    getById: async (id) => {
        const response = await api.get(`/offers/${id}`);
        return response.data;
    },

    // Create offer
    create: async (offerData) => {
        const response = await api.post('/offers', offerData);
        return response.data;
    },

    // Update offer
    update: async (id, offerData) => {
        const response = await api.put(`/offers/${id}`, offerData);
        return response.data;
    },

    // Delete offer
    delete: async (id) => {
        const response = await api.delete(`/offers/${id}`);
        return response.data;
    },

    // Validate coupon
    validate: async (code, orderAmount) => {
        const response = await api.post('/offers/validate', { code, orderAmount });
        return response.data;
    },
};
