import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditProfile = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        address: '',
        city: '',
        country: '',
        date_of_birth: '',
        bio: ''
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isChanged, setIsChanged] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone_number: user.phone_number || '',
                address: user.address || '',
                city: user.city || '',
                country: user.country || '',
                date_of_birth: user.date_of_birth || '',
                bio: user.bio || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setIsChanged(true);
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (formData.phone_number && !/^\+?[\d\s-()]+$/.test(formData.phone_number)) {
            newErrors.phone_number = 'Phone number is invalid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submission started...');

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            console.log('Token:', token ? 'Present' : 'Missing');
            console.log('Current User ID:', user?.id);
            console.log('Form data to send:', formData);

            // Try different API endpoints - focusing on current user endpoints
            const endpoints = [
                `http://127.0.0.1:8000/api/auth/user/`,  // Django REST Auth current user
                `http://127.0.0.1:8000/api/users/me/`,   // Common current user endpoint
                `http://127.0.0.1:8000/api/user/profile/`, // Custom profile endpoint
                `http://127.0.0.1:8000/api/profile/`,     // Simple profile endpoint
            ];

            let response;
            let lastError;

            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying endpoint: ${endpoint}`);
                    
                    // Try PUT first, then PATCH if PUT fails
                    try {
                        response = await axios.put(
                            endpoint,
                            formData,
                            {
                                headers: {
                                    'Authorization': `Token ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                timeout: 10000
                            }
                        );
                        console.log('Success with PUT on endpoint:', endpoint);
                    } catch (putError) {
                        console.log(`PUT failed, trying PATCH on endpoint: ${endpoint}`);
                        response = await axios.patch(
                            endpoint,
                            formData,
                            {
                                headers: {
                                    'Authorization': `Token ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                timeout: 10000
                            }
                        );
                        console.log('Success with PATCH on endpoint:', endpoint);
                    }
                    
                    break; // Exit loop if successful
                } catch (error) {
                    lastError = error;
                    console.log(`Failed with endpoint ${endpoint}:`, error.response?.status, error.message);
                    continue; // Try next endpoint
                }
            }

            if (!response) {
                throw lastError || new Error('All endpoints failed');
            }

            console.log('Profile update response:', response.data);

            // Update user in context
            updateUser(response.data);

            toast.success('Profile updated successfully!');
            setIsChanged(false);

            // Redirect to dashboard after successful update
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);

        } catch (error) {
            console.error('Error updating profile:', error);
            console.error('Error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            if (error.response?.status === 400) {
                const backendErrors = error.response.data;
                console.log('Backend validation errors:', backendErrors);
                setErrors(backendErrors);
                
                // Show specific error messages
                if (backendErrors.username) {
                    toast.error(`Username error: ${backendErrors.username}`);
                } else if (backendErrors.email) {
                    toast.error(`Email error: ${backendErrors.email}`);
                } else {
                    toast.error('Please fix the validation errors');
                }
            } else if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                // Redirect to login
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else if (error.response?.status === 403) {
                // Permission denied - try alternative approach
                toast.error('Permission issue. Trying alternative method...');
                await tryAlternativeUpdate();
            } else if (error.response?.status === 404) {
                toast.error('User not found. Please contact support.');
            } else if (error.code === 'NETWORK_ERROR') {
                toast.error('Network error. Please check your connection.');
            } else {
                toast.error('Failed to update profile. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Alternative update method - try updating only specific fields
    const tryAlternativeUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Trying alternative update method...');

            // Try with only basic fields that are less likely to have permission issues
            const basicData = {
                username: formData.username,
                email: formData.email,
                first_name: formData.first_name,
                last_name: formData.last_name
            };

            const endpoints = [
                `http://127.0.0.1:8000/api/auth/user/`,
                `http://127.0.0.1:8000/api/users/me/`,
            ];

            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying alternative update on: ${endpoint}`);
                    const response = await axios.patch(
                        endpoint,
                        basicData,
                        {
                            headers: {
                                'Authorization': `Token ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    console.log('Alternative update successful:', response.data);
                    updateUser(response.data);
                    toast.success('Basic profile information updated successfully!');
                    setIsChanged(false);
                    
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 1500);
                    return;
                } catch (error) {
                    console.log(`Alternative update failed on ${endpoint}:`, error.response?.status);
                }
            }

            toast.error('Unable to update profile. Please contact administrator.');
        } catch (error) {
            console.error('Alternative update failed:', error);
            toast.error('Profile update failed. Please contact support.');
        }
    };

    const handleCancel = () => {
        if (isChanged) {
            if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                navigate('/dashboard');
            }
        } else {
            navigate('/dashboard');
        }
    };

    // Debug function to check current state
    const debugState = () => {
        console.log('Current form data:', formData);
        console.log('Current user:', user);
        console.log('Loading:', loading);
        console.log('Errors:', errors);
        console.log('Is changed:', isChanged);
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading user data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Debug button - remove in production */}
            <button 
                onClick={debugState}
                className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-lg text-xs opacity-50 hover:opacity-100"
                style={{zIndex: 1000}}
            >
                Debug
            </button>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
                            <p className="text-gray-600 mt-2">
                                Update your personal information and preferences
                            </p>
                        </div>
                        <button
                            onClick={handleCancel}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors w-full sm:w-auto"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Personal Information
                                </h2>
                                <p className="text-gray-600 text-sm mt-1">
                                    Update your basic profile details
                                </p>
                                <p className="text-xs text-yellow-600 mt-2">
                                    Note: Some fields might have restricted access based on your permissions.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Username */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Username *
                                        </label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.username ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            placeholder="Enter your username"
                                        />
                                        {errors.username && (
                                            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            placeholder="Enter your email"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>

                                    {/* First Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="First name"
                                        />
                                        {errors.first_name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                                        )}
                                    </div>

                                    {/* Last Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Last name"
                                        />
                                        {errors.last_name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                                        )}
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone_number"
                                            value={formData.phone_number}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.phone_number ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            placeholder="+1234567890"
                                        />
                                        {errors.phone_number && (
                                            <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                                        )}
                                    </div>

                                    {/* Date of Birth */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            name="date_of_birth"
                                            value={formData.date_of_birth}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    {/* Address */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Street address"
                                        />
                                    </div>

                                    {/* City */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="City"
                                        />
                                    </div>

                                    {/* Country */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Country
                                        </label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Country"
                                        />
                                    </div>

                                    {/* Bio */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Bio
                                        </label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            rows="4"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                            placeholder="Tell us a little about yourself..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Maximum 500 characters
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 mt-6">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="flex-1 bg-gray-500 text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || !isChanged}
                                        className="flex-1 bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                Updating...
                                            </div>
                                        ) : (
                                            'Update Profile'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Profile Summary */}
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Member since:</span>
                                    <span className="text-sm font-medium text-gray-800">
                                        {new Date(user.date_joined).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">User type:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.user_type === 'admin'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-green-100 text-green-800'
                                        }`}>
                                        {user.user_type}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Last login:</span>
                                    <span className="text-sm font-medium text-gray-800">
                                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Profile Completion */}
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Completion</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Basic info</span>
                                    <span className="text-sm font-medium text-green-600">✓ Complete</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Contact details</span>
                                    <span className={`text-sm font-medium ${formData.phone_number ? 'text-green-600' : 'text-yellow-600'
                                        }`}>
                                        {formData.phone_number ? '✓ Complete' : '⚠️ Pending'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Location</span>
                                    <span className={`text-sm font-medium ${formData.address && formData.city ? 'text-green-600' : 'text-yellow-600'
                                        }`}>
                                        {formData.address && formData.city ? '✓ Complete' : '⚠️ Pending'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Tips</h4>
                            <ul className="text-xs text-blue-700 space-y-1">
                                <li>• Keep your profile information up to date</li>
                                <li>• Use a professional profile picture</li>
                                <li>• Add your bio to help others know you better</li>
                                <li>• Ensure your contact information is current</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;