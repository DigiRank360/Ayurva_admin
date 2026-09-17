import api from '@/lib/api';

export const orderAPI = {
    getById: async (id) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },
    process: async (id) => {
        const response = await api.put(`/orders/${id}/process`);
        return response.data;
    },
    ship: async (id, trackingData) => {
        const response = await api.put(`/orders/${id}/ship`, trackingData);
        return response.data;
    },
    deliver: async (id) => {
        const response = await api.put(`/orders/${id}/deliver`);
        return response.data;
    },
    updateStatus: async (id, status) => {
        const response = await api.put(`/orders/${id}/status`, { status });
        return response.data;
    },
    cancel: async (id, reason) => {
        const response = await api.put(`/orders/${id}/cancel`, { reason });
        return response.data;
    }
};
