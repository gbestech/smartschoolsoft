import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        is_active: true,
        is_staff: false,
        is_superuser: false
    });

    // Django API configuration
    const API_BASE = 'http://localhost:8000';
    const USERS_API = `${API_BASE}/api/users/`;

    // Fetch users from Django backend
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(USERS_API, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Failed to load users. Please check your connection and authentication.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Prepare data for Django
            const userData = {
                username: formData.username,
                email: formData.email,
                first_name: formData.first_name,
                last_name: formData.last_name,
                is_active: formData.is_active,
                is_staff: formData.is_staff,
                is_superuser: formData.is_superuser
            };

            if (editingUser) {
                // Update existing user
                const response = await axios.put(
                    `${USERS_API}${editingUser.id}/`,
                    userData,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Token ${localStorage.getItem('token')}`
                        }
                    }
                );
                setUsers(users.map(user =>
                    user.id === editingUser.id ? response.data : user
                ));
                alert('User updated successfully!');
            } else {
                // Create new user - Django might require password for new users
                const newUserData = {
                    ...userData,
                    password: 'defaultpassword123' // You might want to handle this differently
                };

                const response = await axios.post(
                    USERS_API,
                    newUserData,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Token ${localStorage.getItem('token')}`
                        }
                    }
                );
                setUsers([...users, response.data]);
                alert('User created successfully!');
            }

            resetForm();
        } catch (error) {
            console.error('Error saving user:', error);
            const errorMessage = error.response?.data
                ? JSON.stringify(error.response.data)
                : 'Failed to save user. Please try again.';
            alert(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username || '',
            email: user.email || '',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            is_active: user.is_active || true,
            is_staff: user.is_staff || false,
            is_superuser: user.is_superuser || false
        });
        setShowModal(true);
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setLoading(true);
            try {
                await axios.delete(`${USERS_API}${userId}/`, {
                    headers: {
                        'Authorization': `Token ${localStorage.getItem('token')}`
                    }
                });
                setUsers(users.filter(user => user.id !== userId));
                alert('User deleted successfully!');
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Failed to delete user. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        const newStatus = !currentStatus;

        setLoading(true);
        try {
            const response = await axios.patch(
                `${USERS_API}${userId}/`,
                { is_active: newStatus },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${localStorage.getItem('token')}`
                    }
                }
            );

            setUsers(users.map(user =>
                user.id === userId ? response.data : user
            ));

            alert(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`);
        } catch (error) {
            console.error('Error updating user status:', error);
            alert('Failed to update user status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const activateUser = (userId) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            toggleUserStatus(userId, user.is_active);
        }
    };

    const deactivateUser = (userId) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            toggleUserStatus(userId, user.is_active);
        }
    };

    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            first_name: '',
            last_name: '',
            is_active: true,
            is_staff: false,
            is_superuser: false
        });
        setEditingUser(null);
        setShowModal(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (error) {
            return 'Invalid Date';
        }
    };

    // Helper function to get role display
    const getUserRole = (user) => {
        if (user.is_superuser) return 'Superuser';
        if (user.is_staff) return 'Staff';
        return 'User';
    };

    // Helper function to get role color
    const getRoleColor = (user) => {
        if (user.is_superuser) return 'bg-red-100 text-red-800';
        if (user.is_staff) return 'bg-blue-100 text-blue-800';
        return 'bg-purple-100 text-purple-800';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="text-gray-600 mt-2">
                            {users.length} user{users.length !== 1 ? 's' : ''} in system
                        </p>
                    </div>
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setShowModal(true)}
                        disabled={loading}
                    >
                        Add New User
                    </button>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <div className="text-gray-600 text-lg">Loading users...</div>
                            </div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600 mb-4">No users found in system.</p>
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                                onClick={() => setShowModal(true)}
                            >
                                Add First User
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map(user => (
                                        <tr
                                            key={user.id}
                                            className={!user.is_active ? 'bg-gray-50' : 'hover:bg-gray-50'}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {user.username || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.email || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.first_name || user.last_name
                                                    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                                    : 'N/A'
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user)}`}>
                                                    {getUserRole(user)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(user.last_login)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        onClick={() => handleEdit(user)}
                                                        disabled={loading}
                                                    >
                                                        Edit
                                                    </button>
                                                    {user.is_active ? (
                                                        <button
                                                            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            onClick={() => deactivateUser(user.id)}
                                                            disabled={loading}
                                                        >
                                                            Deactivate
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            onClick={() => activateUser(user.id)}
                                                            disabled={loading}
                                                        >
                                                            Activate
                                                        </button>
                                                    )}
                                                    <button
                                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        onClick={() => handleDelete(user.id)}
                                                        disabled={loading}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Add/Edit User Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {editingUser ? 'Edit User' : 'Add New User'}
                                </h2>
                                <button
                                    className="text-gray-400 hover:text-gray-600 text-2xl disabled:opacity-50"
                                    onClick={resetForm}
                                    disabled={loading}
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                            Username *
                                        </label>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            required
                                            disabled={loading}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                            placeholder="Enter username"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            disabled={loading}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                            placeholder="Enter user email"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                id="first_name"
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleInputChange}
                                                disabled={loading}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                                placeholder="First name"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                id="last_name"
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleInputChange}
                                                disabled={loading}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                                placeholder="Last name"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Permissions</label>
                                        <div className="space-y-2">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="is_active"
                                                    checked={formData.is_active}
                                                    onChange={handleInputChange}
                                                    disabled={loading}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">Active</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="is_staff"
                                                    checked={formData.is_staff}
                                                    onChange={handleInputChange}
                                                    disabled={loading}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">Staff Member</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="is_superuser"
                                                    checked={formData.is_superuser}
                                                    onChange={handleInputChange}
                                                    disabled={loading}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">Superuser</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 mt-8">
                                    <button
                                        type="button"
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition duration-200 disabled:opacity-50"
                                        onClick={resetForm}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition duration-200 disabled:opacity-50"
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : (editingUser ? 'Update' : 'Create')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;