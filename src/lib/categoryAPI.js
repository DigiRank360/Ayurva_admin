import api from './api';

export const categoryAPI = {
    // Get all categories
    getAll: async () => {
        const { data } = await api.get('/categories');
        return data;
    },

    // Get category by ID
    getById: async (id) => {
        const { data } = await api.get(`/categories/${id}`);
        return data;
    },

    // Create new category
    create: async (categoryData) => {
        const { data } = await api.post('/categories', categoryData);
        return data;
    },

    // Update category
    update: async (id, categoryData) => {
        const { data } = await api.put(`/categories/${id}`, categoryData);
        return data;
    },

    // Delete category
    delete: async (id) => {
        const { data } = await api.delete(`/categories/${id}`);
        return data;
    },
};

export default categoryAPI;
