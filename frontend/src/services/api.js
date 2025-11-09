import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const userAPI = {
    getMe: () => api.get('/auth/user/'),
    updateMe: (data) => api.put('/auth/user/', data),
    uploadProfilePicture: (formData) => api.post('/auth/user/upload-picture/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
};