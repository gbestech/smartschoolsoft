import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const { user } = useAuth();

    // New states for View/Edit functionality
    const [selectedUser, setSelectedUser] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/api/dashboard/');
            setUsers(response.data.users);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // View User Functionality
    const handleViewUser = (user) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    // Edit User Functionality
    const handleEditUser = (user) => {
        setSelectedUser(user);
        setEditFormData({
            username: user.username,
            email: user.email,
            user_type: user.user_type
        });
        setIsEditModalOpen(true);
    };

    // Disable User Functionality
    // Disable User Functionality with better error handling
    const handleDisableUser = async (user) => {
        const action = user.is_disabled ? 'enable' : 'disable';

        if (window.confirm(`Are you sure you want to ${action} ${user.username}? This will ${action === 'disable' ? 'prevent' : 'allow'} them from logging in.`)) {
            try {
                console.log('Attempting to update user status:', {
                    userId: user.id,
                    currentStatus: user.is_disabled,
                    newStatus: !user.is_disabled
                });

                // Try different API endpoints and methods
                let response;

                // Option 1: Try PATCH first
                try {
                    response = await axios.patch(`/api/users/${user.id}/`, {
                        is_disabled: !user.is_disabled,
                        is_active: !user.is_disabled // Try common field names
                    });
                    console.log('PATCH request successful:', response.data);
                } catch (patchError) {
                    console.log('PATCH failed, trying PUT:', patchError);

                    // Option 2: Try PUT if PATCH fails
                    try {
                        response = await axios.put(`/api/users/${user.id}/`, {
                            ...user, // Include all existing user data
                            is_disabled: !user.is_disabled,
                            is_active: !user.is_disabled
                        });
                        console.log('PUT request successful:', response.data);
                    } catch (putError) {
                        console.log('PUT failed, trying custom endpoint:', putError);

                        // Option 3: Try a custom disable/enable endpoint
                        response = await axios.post(`/api/users/${user.id}/${action}/`);
                        console.log('Custom endpoint request successful:', response.data);
                    }
                }

                // Update local state
                setUsers(users.map(u =>
                    u.id === user.id
                        ? {
                            ...u,
                            is_disabled: !user.is_disabled,
                            is_active: !user.is_disabled // Also update is_active if needed
                        }
                        : u
                ));

                // Show success message
                alert(`User ${action}d successfully!`);

            } catch (error) {
                console.error('Error updating user status:', error);

                // More detailed error information
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.error('Error response data:', error.response.data);
                    console.error('Error response status:', error.response.status);
                    console.error('Error response headers:', error.response.headers);

                    let errorMessage = `Error ${action}ing user: `;

                    if (error.response.status === 401) {
                        errorMessage += 'Unauthorized. Please check your permissions.';
                    } else if (error.response.status === 403) {
                        errorMessage += 'Forbidden. You do not have permission to perform this action.';
                    } else if (error.response.status === 404) {
                        errorMessage += 'User not found.';
                    } else if (error.response.data && error.response.data.detail) {
                        errorMessage += error.response.data.detail;
                    } else if (error.response.data && typeof error.response.data === 'string') {
                        errorMessage += error.response.data;
                    } else {
                        errorMessage += `Server responded with status ${error.response.status}`;
                    }

                    alert(errorMessage);
                } else if (error.request) {
                    // The request was made but no response was received
                    console.error('Error request:', error.request);
                    alert(`Network error: Unable to connect to server. Please check your connection and try again.`);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.error('Error message:', error.message);
                    alert(`Error: ${error.message}`);
                }
            }
        }
    };
    const handleEditFormChange = (e) => {
        setEditFormData({
            ...editFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            // Update user via API
            await axios.put(`/api/users/${selectedUser.id}/`, editFormData);

            // Update local state
            setUsers(users.map(u =>
                u.id === selectedUser.id
                    ? { ...u, ...editFormData }
                    : u
            ));

            setIsEditModalOpen(false);
            setSelectedUser(null);
            setEditFormData({});

            // Show success message (you can add a toast notification here)
            alert('User updated successfully!');

        } catch (error) {
            console.error('Error updating user:', error);
            alert('Error updating user. Please try again.');
        }
    };

    const adminStats = {
        totalUsers: users.length,
        admins: users.filter(user => user.user_type === 'admin').length,
        regularUsers: users.filter(user => user.user_type === 'user').length,
        activeToday: users.filter(() => Math.random() > 0.5).length, // Mock data
        disabledUsers: users.filter(user => user.is_disabled).length // Added disabled users count
    };

    if (loading) return <div className="flex justify-center items-center h-64 text-lg text-gray-600">Loading...</div>;

    return (
        <div className="p-6 w-full">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome, Administrator {user?.username}</p>
            </div>

            {/* Tabs Navigation */}
            <div className="flex space-x-1 border-b border-gray-200 mb-6">
                <button
                    className={`flex items-center px-4 py-3 rounded-t-lg transition-colors ${activeTab === 'overview'
                        ? 'bg-white border-t border-l border-r border-gray-200 text-blue-600 font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('overview')}
                >
                    <span className="mr-2">📊</span>
                    Overview
                </button>
                <button
                    className={`flex items-center px-4 py-3 rounded-t-lg transition-colors ${activeTab === 'users'
                        ? 'bg-white border-t border-l border-r border-gray-200 text-blue-600 font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('users')}
                >
                    <span className="mr-2">👥</span>
                    User Management
                </button>
                <button
                    className={`flex items-center px-4 py-3 rounded-t-lg transition-colors ${activeTab === 'settings'
                        ? 'bg-white border-t border-l border-r border-gray-200 text-blue-600 font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('settings')}
                >
                    <span className="mr-2">⚙️</span>
                    Settings
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Stats Cards - Added Disabled Users Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center">
                                <div className="text-2xl mr-4">👥</div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                                    <p className="text-2xl font-bold text-gray-800">{adminStats.totalUsers}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center">
                                <div className="text-2xl mr-4">🛡️</div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Administrators</h3>
                                    <p className="text-2xl font-bold text-gray-800">{adminStats.admins}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center">
                                <div className="text-2xl mr-4">👤</div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Regular Users</h3>
                                    <p className="text-2xl font-bold text-gray-800">{adminStats.regularUsers}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center">
                                <div className="text-2xl mr-4">🚫</div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Disabled Users</h3>
                                    <p className="text-2xl font-bold text-gray-800">{adminStats.disabledUsers}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center">
                                <div className="text-2xl mr-4">📈</div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Active Today</h3>
                                    <p className="text-2xl font-bold text-gray-800">{adminStats.activeToday}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Users</h2>
                            <div className="space-y-4">
                                {users.slice(0, 5).map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${user.is_disabled ? 'bg-gray-400' : 'bg-blue-500'}`}>
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-800">{user.username}</h4>
                                                <p className="text-sm text-gray-600">{user.email}</p>
                                                <div className="flex space-x-2 mt-1">
                                                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${user.user_type === 'admin'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-green-100 text-green-800'
                                                        }`}>
                                                        {user.user_type}
                                                    </span>
                                                    {user.is_disabled && (
                                                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                                            Disabled
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleViewUser(user)}
                                                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleEditUser(user)}
                                                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDisableUser(user)}
                                                className={`px-3 py-1 text-sm rounded transition-colors ${user.is_disabled
                                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                                    }`}
                                            >
                                                {user.is_disabled ? 'Enable' : 'Disable'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">System Overview</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <label className="text-gray-600">Server Status</label>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                                        Online
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <label className="text-gray-600">Database</label>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                                        Connected
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <label className="text-gray-600">Last Backup</label>
                                    <span className="text-gray-800">2 hours ago</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <label className="text-gray-600">System Uptime</label>
                                    <span className="text-gray-800">99.8%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-semibold text-gray-800">User Management</h2>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center">
                                <span className="mr-2">+</span> Add New User
                            </button>
                        </div>
                    </div>

                    <div className="w-full">
                        <table className="w-full table-auto">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Joined</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3 ${user.is_disabled ? 'bg-gray-400' : 'bg-blue-500'}`}>
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <strong className="text-gray-900">{user.username}</strong>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${user.user_type === 'admin'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}>
                                                {user.user_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${user.is_disabled
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}>
                                                {user.is_disabled ? 'Disabled' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.date_joined).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleViewUser(user)}
                                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDisableUser(user)}
                                                    className={`px-3 py-1 text-xs rounded transition-colors ${user.is_disabled
                                                        ? 'text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100'
                                                        : 'text-yellow-600 hover:text-yellow-900 bg-yellow-50 hover:bg-yellow-100'
                                                        }`}
                                                >
                                                    {user.is_disabled ? 'Enable' : 'Disable'}
                                                </button>
                                                <button className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors">
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Admin Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">System Configuration</h4>
                            <p className="text-gray-600 mb-4">Manage system-wide settings, preferences, and application configuration options.</p>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors w-full">
                                Configure Settings
                            </button>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Security Settings</h4>
                            <p className="text-gray-600 mb-4">Configure security policies, access controls, authentication methods, and permissions.</p>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors w-full">
                                Manage Security
                            </button>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Backup & Restore</h4>
                            <p className="text-gray-600 mb-4">Manage database backups, restoration processes, and data export/import functionality.</p>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors w-full">
                                Backup Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View User Modal - Added Status Display */}
            {isViewModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-800">User Details</h3>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-xl ${selectedUser.is_disabled ? 'bg-gray-400' : 'bg-blue-500'}`}>
                                    {selectedUser.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800">{selectedUser.username}</h4>
                                    <p className="text-gray-600">{selectedUser.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <label className="font-medium text-gray-500">User ID</label>
                                    <p className="text-gray-800">{selectedUser.id}</p>
                                </div>
                                <div>
                                    <label className="font-medium text-gray-500">User Type</label>
                                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${selectedUser.user_type === 'admin'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-green-100 text-green-800'
                                        }`}>
                                        {selectedUser.user_type}
                                    </span>
                                </div>
                                <div>
                                    <label className="font-medium text-gray-500">Status</label>
                                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${selectedUser.is_disabled
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-green-100 text-green-800'
                                        }`}>
                                        {selectedUser.is_disabled ? 'Disabled' : 'Active'}
                                    </span>
                                </div>
                                <div>
                                    <label className="font-medium text-gray-500">Date Joined</label>
                                    <p className="text-gray-800">{new Date(selectedUser.date_joined).toLocaleDateString()}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="font-medium text-gray-500">Last Login</label>
                                    <p className="text-gray-800">{selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString() : 'Never'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleDisableUser(selectedUser)}
                                className={`px-4 py-2 rounded-lg transition-colors ${selectedUser.is_disabled
                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                    }`}
                            >
                                {selectedUser.is_disabled ? 'Enable User' : 'Disable User'}
                            </button>
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    handleEditUser(selectedUser);
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Edit User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal - Added Status Toggle */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-800">Edit User</h3>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={editFormData.username || ''}
                                    onChange={handleEditFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editFormData.email || ''}
                                    onChange={handleEditFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                                <select
                                    name="user_type"
                                    value={editFormData.user_type || ''}
                                    onChange={handleEditFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                                    <p className="text-sm text-gray-600">
                                        {selectedUser.is_disabled ? 'User is currently disabled' : 'User is currently active'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDisableUser(selectedUser)}
                                    className={`px-4 py-2 rounded-lg transition-colors ${selectedUser.is_disabled
                                        ? 'bg-green-500 hover:bg-green-600 text-white'
                                        : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                        }`}
                                >
                                    {selectedUser.is_disabled ? 'Enable User' : 'Disable User'}
                                </button>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Update User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;