import api from '@/lib/api';

export const productAPI = {
    // Get all products with filters
    getAll: async ({ page = 1, limit = 20, search = '', category = '', sort = '', active = '' }) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (sort) params.append('sort', sort);
        if (active !== '') params.append('active', active);

        const response = await api.get(`/products?${params.toString()}`);
        return response.data;
    },

    // Get single product
    getById: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    // Create product
    create: async (productData) => {
        const response = await api.post('/products', productData);
        return response.data;
    },

    // Update product
    update: async (id, productData) => {
        const response = await api.put(`/products/${id}`, productData);
        return response.data;
    },

    // Delete product
    delete: async (id) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },
};
