import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing auth
        const storedToken = localStorage.getItem('adminToken');
        const storedUser = localStorage.getItem('adminUser');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/users/login', { email, password });
            const { token, ...userData } = response.data;

            // Check if user is admin
            if (!userData.isAdmin) {
                throw new Error('Unauthorized: Admin access required');
            }

            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', JSON.stringify(userData));

            setToken(token);
            setUser(userData);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
