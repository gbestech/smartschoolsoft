// services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log all requests for debugging
        console.log('🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            hasToken: !!token
        });

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for better error handling
api.interceptors.response.use(
    (response) => {
        console.log('✅ API Response Success:', {
            url: response.config.url,
            status: response.status
        });
        return response;
    },
    (error) => {
        console.error('❌ API Response Error:', {
            url: error.config?.url,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
        return Promise.reject(error);
    }
);

// CORRECT API endpoints - match your Django URLs
export const userAPI = {
    // User profile endpoints
    getMe: () => api.get('/users/me/'),
    updateMe: (data) => api.put('/users/me/', data),  // Use PUT instead of PATCH
    partialUpdateMe: (data) => api.patch('/users/me/', data),  // Alternative PATCH

    // Profile picture endpoint
    uploadProfilePicture: (formData) => api.patch('/users/me/profile-picture/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Test different endpoints
    testEndpoints: async () => {
        const endpoints = [
            '/users/me/',
            '/profile/',
            '/auth/me/'
        ];

        for (const endpoint of endpoints) {
            try {
                console.log(`🔍 Testing endpoint: ${endpoint}`);
                const response = await api.get(endpoint);
                console.log(`✅ Endpoint works: ${endpoint}`);
                return endpoint;
            } catch (error) {
                console.log(`❌ Endpoint failed: ${endpoint} - ${error.response?.status}`);
            }
        }
        return null;
    }
};

export default api;