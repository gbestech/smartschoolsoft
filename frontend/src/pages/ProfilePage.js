import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { Camera, Save, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        user_type: 'user',
        passport_number: '',
        date_of_birth: '',
        gender: '',
        phone_number: '',
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);
    const [profileCompletion, setProfileCompletion] = useState(0);

    useEffect(() => {
        if (user) {
            loadUserProfile();
        }
    }, [user]);

    const calculateProfileCompletion = (userData) => {
        let completedFields = 0;
        const totalFields = 7;

        if (userData.first_name?.trim()) completedFields++;
        if (userData.last_name?.trim()) completedFields++;
        if (userData.email?.trim()) completedFields++;
        if (userData.phone_number?.trim()) completedFields++;
        if (userData.passport_number?.trim()) completedFields++;
        if (userData.date_of_birth) completedFields++;
        if (userData.gender) completedFields++;

        return Math.round((completedFields / totalFields) * 100);
    };

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getMe();
            const userData = response.data;

            const userProfile = {
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                email: userData.email || '',
                user_type: userData.profile?.user_type || 'user',
                passport_number: userData.profile?.passport_number || '',
                date_of_birth: userData.profile?.date_of_birth || '',
                gender: userData.profile?.gender || '',
                phone_number: userData.profile?.phone_number || '',
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
            console.error('Profile load error:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                logout();
            } else if (error.response?.status === 404) {
                toast.error('Profile endpoint not found. Please check backend setup.');
            } else {
                toast.error('Failed to load profile. Please check your connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
            toast.info('Profile picture selected');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const userData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                profile: {
                    user_type: formData.user_type,
                    passport_number: formData.passport_number,
                    date_of_birth: formData.date_of_birth,
                    gender: formData.gender,
                    phone_number: formData.phone_number,
                }
            };

            await userAPI.updateMe(userData);

            if (profilePicture) {
                const formDataObj = new FormData();
                formDataObj.append('profile_picture', profilePicture);
                await userAPI.uploadProfilePicture(formDataObj);
            }

            const newCompletion = calculateProfileCompletion(formData);
            setProfileCompletion(newCompletion);

            if (newCompletion >= 50 && isNewUser) {
                setIsNewUser(false);
            }

            toast.success('Profile updated successfully! 🎉');
        } catch (error) {
            console.error('Profile update error:', error);
            if (error.response?.data) {
                const errorData = error.response.data;
                if (typeof errorData === 'object') {
                    Object.values(errorData).forEach(message => {
                        if (Array.isArray(message)) {
                            message.forEach(msg => toast.error(msg));
                        } else {
                            toast.error(message);
                        }
                    });
                } else {
                    toast.error(errorData || 'Failed to update profile');
                }
            } else {
                toast.error('Failed to update profile. Please check your connection.');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <Loader className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600">Loading your profile...</p>
                <ToastContainer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
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
            />

            <div className="max-w-4xl mx-auto px-4">
                {/* Welcome Banner for New Users */}
                {isNewUser && (
                    <div className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
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
                    <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
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

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-8 py-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">Profile Settings</h1>
                                <p className="text-blue-100 mt-2">Manage your account information and preferences</p>
                            </div>
                            {!isNewUser && (
                                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                                    <span className="font-bold">{profileCompletion}% Complete</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column */}
                            <div className="lg:col-span-1">
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className="relative inline-block">
                                            <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg overflow-hidden">
                                                {previewImage ? (
                                                    <img
                                                        src={previewImage}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                                                        {user?.first_name?.[0] || user?.username?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <label htmlFor="profile-picture" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
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
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Account Type
                                        </label>
                                        <select
                                            name="user_type"
                                            value={formData.user_type}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-800 mb-2">Profile Completion</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Basic Information</span>
                                                <span className="font-medium">{profileCompletion}%</span>
                                            </div>
                                            <div className="bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${profileCompletion}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="lg:col-span-2">
                                <div className="space-y-6">
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter your first name"
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter your last name"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="your.email@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone_number"
                                                value={formData.phone_number}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>
                                    </div>

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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Gender
                                        </label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                            <option value="prefer_not_to_say">Prefer not to say</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-lg font-semibold"
                            >
                                {saving ? (
                                    <Loader className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Save className="h-5 w-5" />
                                )}
                                <span>{saving ? 'Saving Changes...' : 'Complete Profile'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;