import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Set base URL for axios
    axios.defaults.baseURL = 'http://localhost:8000';

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
            fetchUserProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get('/api/profile/');
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const response = await axios.post('/api/login/', { username, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
            setUser(user);
            setIsAuthenticated(true);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('/api/register/', userData);
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
            setUser(user);
            setIsAuthenticated(true);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data || 'Registration failed'
            };
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/logout/');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};