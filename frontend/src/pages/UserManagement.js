import React, { useState, useEffect } from 'react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'user',
        status: 'active'
    });

    // API base URL - replace with your actual API endpoint
    const API_URL = 'https://your-api-domain.com/api/users';

    // Fetch users from database
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = editingUser ? `${API_URL}/${editingUser.id}` : API_URL;
            const method = editingUser ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to save user');
            }

            const savedUser = await response.json();

            if (editingUser) {
                setUsers(users.map(user =>
                    user.id === editingUser.id ? savedUser : user
                ));
            } else {
                setUsers([...users, savedUser]);
            }

            resetForm();
            alert(`User ${editingUser ? 'updated' : 'created'} successfully!`);
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Failed to save user. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
        });
        setShowModal(true);
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete user');
                }

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
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/${userId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update user status');
            }

            const updatedUser = await response.json();
            setUsers(users.map(user =>
                user.id === userId ? updatedUser : user
            ));

            alert(`User ${newStatus === 'active' ? 'enabled' : 'disabled'} successfully!`);
        } catch (error) {
            console.error('Error updating user status:', error);
            alert('Failed to update user status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const enableUser = (userId) => {
        toggleUserStatus(userId, 'inactive');
    };

    const disableUser = (userId) => {
        toggleUserStatus(userId, 'active');
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            role: 'user',
            status: 'active'
        });
        setEditingUser(null);
        setShowModal(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
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
                            <div className="text-gray-600 text-lg">Loading users...</div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600 mb-4">No users found.</p>
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map(user => (
                                        <tr
                                            key={user.id}
                                            className={user.status === 'inactive' ? 'bg-gray-50' : 'hover:bg-gray-50'}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : user.role === 'moderator'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-purple-100 text-purple-800'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(user.createdAt).toLocaleDateString()}
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
                                                    {user.status === 'active' ? (
                                                        <button
                                                            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            onClick={() => disableUser(user.id)}
                                                            disabled={loading}
                                                        >
                                                            Disable
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            onClick={() => enableUser(user.id)}
                                                            disabled={loading}
                                                        >
                                                            Enable
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
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            disabled={loading}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
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
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                            Role
                                        </label>
                                        <select
                                            id="role"
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                            <option value="moderator">Moderator</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
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