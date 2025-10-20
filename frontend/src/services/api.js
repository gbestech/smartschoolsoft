// src/services/api.js - Fix the baseURL and endpoints
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000', // Remove /api from baseURL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post('http://localhost:8000/api/auth/token/refresh/', {
                        refresh: refreshToken
                    });

                    const newToken = response.data.access;
                    localStorage.setItem('authToken', newToken);

                    // Retry the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh token failed, logout user
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userData');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Authentication API
export const authAPI = {
    login: (credentials) => api.post('/api/auth/login/', credentials),
    register: (userData) => api.post('/api/auth/register/', userData),
    refreshToken: (refresh) => api.post('/api/auth/token/refresh/', { refresh }),
};

// User API - Fixed endpoints
export const userAPI = {
    getMe: () => api.get('/api/auth/me/'),
    updateMe: (data) => api.patch('/api/auth/me/', data),
    uploadProfilePicture: (formData) => api.post('/api/auth/profile-picture/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export default api;