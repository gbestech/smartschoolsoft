import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { Camera, Save, Loader, CheckCircle, AlertCircle, User, Mail, Phone, Calendar, MapPin, Shield, RefreshCw, WifiOff } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProfilePage = () => {
    const { user, logout, refreshToken } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        user_type: 'user',
        passport_number: '',
        date_of_birth: '',
        gender: '',
        phone_number: '',
        address: '',
        city: '',
        country: '',
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);
    const [profileCompletion, setProfileCompletion] = useState(0);
    const [debugMode, setDebugMode] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [workingEndpoint, setWorkingEndpoint] = useState('');

    useEffect(() => {
        if (user) {
            loadUserProfile();
        }
    }, [user]);

    const calculateProfileCompletion = (userData) => {
        let completedFields = 0;
        const totalFields = Object.keys(userData).length;

        Object.values(userData).forEach(value => {
            if (value && value.toString().trim() !== '') {
                completedFields++;
            }
        });

        return Math.round((completedFields / totalFields) * 100);
    };

    const validateEmail = (email) => {
        if (!email) return 'Email is required';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }

        return '';
    };

    const handleEmailBlur = (e) => {
        const email = e.target.value;
        const error = validateEmail(email);
        setEmailError(error);

        if (error) {
            toast.error(error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Clear email error when user starts typing again
        if (name === 'email') {
            setEmailError('');
        }

        // Validate user_type
        if (name === 'user_type') {
            const validUserTypes = ['user', 'admin', 'staff', 'supplier', 'distributor', 'inspector', 'manager'];
            if (!validUserTypes.includes(value)) {
                toast.error('Please select a valid user type');
                return;
            }
        }

        // Validate date_of_birth - only when date is complete
        if (name === 'date_of_birth' && value) {
            const selectedDate = new Date(value);
            const today = new Date();

            // Check if date is in the future
            if (selectedDate > today) {
                toast.error('Date of birth cannot be in the future');
                return;
            }

            // Check if user is at least 13 years old
            const minAgeDate = new Date();
            minAgeDate.setFullYear(today.getFullYear() - 13);
            if (selectedDate > minAgeDate) {
                toast.error('You must be at least 13 years old to use this platform');
                return;
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                toast.error('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
                return;
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                toast.error('Image size must be less than 5MB');
                return;
            }

            setProfilePicture(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.onerror = () => {
                toast.error('Error reading image file. Please try another image.');
            };
            reader.readAsDataURL(file);
            toast.info('Profile picture selected');
        }
    };

    const validateForm = () => {
        // Clear previous errors
        setEmailError('');

        if (!formData.first_name?.trim()) {
            toast.error('First name is required');
            return false;
        }

        if (!formData.last_name?.trim()) {
            toast.error('Last name is required');
            return false;
        }

        if (!formData.email?.trim()) {
            toast.error('Email address is required');
            return false;
        }

        // Final email validation on submit
        const emailValidationError = validateEmail(formData.email);
        if (emailValidationError) {
            setEmailError(emailValidationError);
            toast.error(emailValidationError);
            return false;
        }

        // Phone number validation only if provided and complete
        if (formData.phone_number && formData.phone_number.trim()) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            const cleanPhone = formData.phone_number.replace(/[\s\-\(\)]/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                toast.error('Please enter a valid phone number');
                return false;
            }
        }

        return true;
    };

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            console.log('🔄 Loading user profile...', { userId: user?.id });

            const response = await userAPI.getMe();
            const userData = response.data;

            console.log('✅ Profile loaded successfully:', userData);

            const userProfile = {
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                email: userData.email || '',
                user_type: userData.profile?.user_type || 'user',
                passport_number: userData.profile?.passport_number || '',
                date_of_birth: userData.profile?.date_of_birth || '',
                gender: userData.profile?.gender || '',
                phone_number: userData.profile?.phone_number || '',
                address: userData.profile?.address || '',
                city: userData.profile?.city || '',
                country: userData.profile?.country || '',
            };

            setFormData(userProfile);

            const completion = calculateProfileCompletion(userProfile);
            setProfileCompletion(completion);

            if (completion < 50) {
                setIsNewUser(true);
            }

            if (userData.profile?.profile_picture) {
                setPreviewImage(userData.profile.profile_picture);
            }

            toast.success('Profile loaded successfully!');
        } catch (error) {
            console.error('❌ Profile load error:', {
                status: error.response?.status,
                data: error.response?.data,
                user: user,
                url: error.config?.url
            });

            if (!error.response) {
                toast.error('Network error. Please check your internet connection and try again.');
                return;
            }

            switch (error.response.status) {
                case 401:
                    toast.error('Session expired. Please login again.');
                    setTimeout(() => logout(), 2000);
                    break;
                case 403:
                    toast.error('Access denied. You do not have permission to view this profile.');
                    break;
                case 404:
                    toast.error('Profile endpoint not found. Please check backend setup.');
                    break;
                case 500:
                    toast.error('Server error. Please try again later.');
                    break;
                default:
                    toast.error('Failed to load profile. Please check your connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSaving(true);

        try {
            // Debug information
            console.log('🔄 Starting profile update...', {
                userId: user?.id,
                userEmail: user?.email,
                formData: formData
            });

            const userData = {
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                email: formData.email.trim(),
                profile: {
                    user_type: formData.user_type,
                    passport_number: formData.passport_number?.trim() || '',
                    date_of_birth: formData.date_of_birth,
                    gender: formData.gender,
                    phone_number: formData.phone_number?.trim() || '',
                    address: formData.address?.trim() || '',
                    city: formData.city?.trim() || '',
                    country: formData.country?.trim() || '',
                }
            };

            console.log('📤 Sending update data to /api/users/me/:', userData);

            // Use PUT instead of PATCH for full updates
            const response = await userAPI.updateMe(userData);
            console.log('✅ Profile update successful:', response.data);

            toast.success('Profile updated successfully! 🎉');

            // Upload profile picture if selected
            if (profilePicture) {
                try {
                    console.log('🖼️ Uploading profile picture...');
                    const formDataObj = new FormData();
                    formDataObj.append('profile_picture', profilePicture);
                    await userAPI.uploadProfilePicture(formDataObj);
                    toast.success('Profile picture updated successfully!');
                } catch (uploadError) {
                    console.error('❌ Profile picture upload error:', uploadError);
                    // Don't fail the entire update if picture upload fails
                    toast.error('Profile updated but picture upload failed. Please try again.');
                }
            }

            const newCompletion = calculateProfileCompletion(formData);
            setProfileCompletion(newCompletion);

            if (newCompletion >= 50 && isNewUser) {
                setIsNewUser(false);
                toast.success('Welcome! Your profile is now complete. 🎊');
            }

        } catch (error) {
            console.error('❌ Profile update error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                url: error.config?.url,
                method: error.config?.method,
                data: error.response?.data,
                backendMessage: error.response?.data?.detail || error.response?.data
            });

            // Enhanced error handling
            if (!error.response) {
                toast.error('Network error. Please check your internet connection and try again.');
                return;
            }

            switch (error.response.status) {
                case 403:
                    const errorDetail = error.response.data;
                    console.error('🔒 403 Forbidden investigation:', {
                        errorDetail,
                        requestedUrl: error.config?.url,
                        user: user?.id
                    });

                    if (errorDetail.detail) {
                        toast.error(`Permission denied: ${errorDetail.detail}`);
                    } else if (error.response.data?.error) {
                        toast.error(`Access error: ${error.response.data.error}`);
                    } else {
                        toast.error(
                            <div>
                                <strong>Permission Denied (403)</strong>
                                <br />
                                Cannot update profile at: <code>{error.config?.url}</code>
                                <br />
                                <small>Please check if the endpoint exists and you have proper permissions.</small>
                            </div>
                        );
                    }
                    break;

                case 404:
                    toast.error(
                        <div>
                            <strong>Endpoint Not Found (404)</strong>
                            <br />
                            The API endpoint <code>{error.config?.url}</code> was not found.
                            <br />
                            <small>Please check backend URL configuration.</small>
                        </div>
                    );
                    break;

                case 401:
                    toast.error('Your session has expired. Please login again.');
                    setTimeout(() => logout(), 2000);
                    break;

                default:
                    toast.error('Failed to update profile. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        // Reload original data
        loadUserProfile();
        setProfilePicture(null);
        setEmailError('');
        toast.info('Changes discarded');
    };

    const handleRetryWithRefresh = async () => {
        toast.info('Refreshing session and retrying...');
        try {
            if (refreshToken) {
                await refreshToken();
            }
            await loadUserProfile();
            toast.success('Session refreshed successfully!');
        } catch (error) {
            toast.error('Failed to refresh session. Please login again.');
            logout();
        }
    };

    const handleDebug = () => {
        setDebugMode(!debugMode);
        console.log('🐛 Debug mode:', !debugMode);
        console.log('Current state:', {
            user,
            formData,
            profileCompletion,
            hasToken: !!localStorage.getItem('authToken')
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center">
                <div className="text-center">
                    <Loader className="h-16 w-16 animate-spin text-blue-600 mb-4 mx-auto" />
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">Loading Your Profile</h2>
                    <p className="text-gray-600">Please wait while we load your information...</p>
                </div>
                <ToastContainer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Debug Header */}
                {debugMode && (
                    <div className="mb-4 bg-yellow-100 border border-yellow-400 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-yellow-800">🐛 Debug Mode Active</h3>
                                <p className="text-yellow-700 text-sm">User ID: {user?.id} | Token: {localStorage.getItem('authToken') ? 'Present' : 'Missing'}</p>
                            </div>
                            <button
                                onClick={handleDebug}
                                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                            >
                                Hide Debug
                            </button>
                        </div>
                    </div>
                )}

                {/* Welcome Banner for New Users */}
                {isNewUser && (
                    <div className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-[1.01] transition-transform duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                                    <AlertCircle className="h-8 w-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">
                                        Welcome, {user?.username || 'New User'}! 🎉
                                    </h2>
                                    <p className="text-blue-100 text-lg">
                                        Please complete your profile to get the most out of our platform.
                                        Your profile is currently <span className="font-bold">{profileCompletion}%</span> complete.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                                <span className="font-bold text-lg">{profileCompletion}%</span>
                            </div>
                        </div>

                        <div className="mt-4 bg-white bg-opacity-20 rounded-full h-2">
                            <div
                                className="bg-green-400 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${profileCompletion}%` }}
                            ></div>
                        </div>

                        <div className="mt-3 text-sm text-blue-100">
                            <p>Complete all fields to reach 100% and unlock all features!</p>
                        </div>
                    </div>
                )}

                {/* Profile Completion Success Banner */}
                {!isNewUser && profileCompletion >= 50 && (
                    <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-[1.01] transition-transform duration-200">
                        <div className="flex items-center space-x-4">
                            <CheckCircle className="h-8 w-8" />
                            <div>
                                <h2 className="text-xl font-bold mb-1">Profile Complete! 🎊</h2>
                                <p className="text-green-100">
                                    Thank you for completing your profile! You're all set to explore our platform.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:shadow-2xl transition-all duration-300">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-8 py-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">Profile Settings</h1>
                                <p className="text-blue-100 mt-2">Manage your account information and preferences</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                {!isNewUser && (
                                    <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                                        <span className="font-bold">{profileCompletion}% Complete</span>
                                    </div>
                                )}
                                <button
                                    onClick={handleDebug}
                                    className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-colors"
                                    title="Debug mode"
                                >
                                    <Shield className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={handleRetryWithRefresh}
                                    className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-colors"
                                    title="Refresh session"
                                >
                                    <RefreshCw className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column - Profile Picture & Basic Info */}
                            <div className="lg:col-span-1">
                                <div className="space-y-6">
                                    {/* Profile Picture Upload */}
                                    <div className="text-center">
                                        <div className="relative inline-block">
                                            <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-200">
                                                {previewImage ? (
                                                    <img
                                                        src={previewImage}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold ${previewImage ? 'hidden' : 'flex'}`}>
                                                    {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                                                </div>
                                            </div>
                                            <label htmlFor="profile-picture" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                                                <Camera className="h-4 w-4" />
                                                <input
                                                    id="profile-picture"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-3">Click camera icon to upload photo</p>
                                        <p className="text-xs text-gray-400 mt-1">Max 5MB • JPEG, PNG, GIF, WEBP</p>
                                    </div>

                                    {/* Account Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <User className="h-4 w-4 mr-2" />
                                            Account Type
                                        </label>
                                        <select
                                            name="user_type"
                                            value={formData.user_type}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            <option value="user">Regular User</option>
                                            <option value="admin">Administrator</option>
                                            <option value="staff">Staff</option>
                                            <option value="supplier">Supplier</option>
                                            <option value="distributor">Distributor</option>
                                            <option value="inspector">Inspector</option>
                                            <option value="manager">Manager</option>
                                        </select>
                                    </div>

                                    {/* Profile Completion */}
                                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
                                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                            Profile Completion
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Progress</span>
                                                <span className="font-medium text-blue-600">{profileCompletion}%</span>
                                            </div>
                                            <div className="bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${profileCompletion}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {profileCompletion < 50 ? 'Complete more fields to improve your profile' :
                                                    profileCompletion < 80 ? 'Great progress! Almost there!' :
                                                        'Excellent! Your profile is nearly complete!'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Form Fields */}
                            <div className="lg:col-span-2">
                                <div className="space-y-6">
                                    {/* Personal Information Section */}
                                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <User className="h-5 w-5 mr-2 text-blue-600" />
                                            Personal Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    First Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="first_name"
                                                    value={formData.first_name}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    placeholder="Enter your first name"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Last Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="last_name"
                                                    value={formData.last_name}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    placeholder="Enter your last name"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                    <Mail className="h-4 w-4 mr-2 text-blue-600" />
                                                    Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    onBlur={handleEmailBlur}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${emailError ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    placeholder="your.email@example.com"
                                                    required
                                                />
                                                {emailError && (
                                                    <p className="text-red-500 text-xs mt-1">{emailError}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                    <Phone className="h-4 w-4 mr-2 text-blue-600" />
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone_number"
                                                    value={formData.phone_number}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    placeholder="+1 (555) 123-4567"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Information Section */}
                                    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <Calendar className="h-5 w-5 mr-2 text-green-600" />
                                            Additional Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Passport Number
                                                </label>
                                                <input
                                                    type="text"
                                                    name="passport_number"
                                                    value={formData.passport_number}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    placeholder="Enter passport number"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Date of Birth
                                                </label>
                                                <input
                                                    type="date"
                                                    name="date_of_birth"
                                                    value={formData.date_of_birth}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Gender
                                            </label>
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                                <option value="prefer_not_to_say">Prefer not to say</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                                                    Address
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    placeholder="Enter your street address"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    City
                                                </label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    placeholder="City"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Country
                                            </label>
                                            <input
                                                type="text"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                placeholder="Country"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={saving}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2 text-lg font-semibold shadow-lg"
                            >
                                {saving ? (
                                    <Loader className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Save className="h-5 w-5" />
                                )}
                                <span>{saving ? 'Saving Changes...' : 'Save Profile'}</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Quick Tips */}
                <div className="mt-6 bg-white rounded-lg p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 Quick Tips</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Fields marked with * are required</li>
                        <li>• Use a clear profile picture for better recognition</li>
                        <li>• Keep your contact information up to date</li>
                        <li>• Complete all fields for full platform access</li>
                        {debugMode && (
                            <li className="text-red-600 font-semibold">• Debug mode active - check console for details</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;