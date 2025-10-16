import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const { user } = useAuth();

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

    const adminStats = {
        totalUsers: users.length,
        admins: users.filter(user => user.user_type === 'admin').length,
        regularUsers: users.filter(user => user.user_type === 'user').length,
        activeToday: users.filter(() => Math.random() > 0.5).length // Mock data
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
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-800">{user.username}</h4>
                                                <p className="text-sm text-gray-600">{user.email}</p>
                                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${user.user_type === 'admin'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {user.user_type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                                                View
                                            </button>
                                            <button className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
                                                Edit
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
                                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
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
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.date_joined).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors">
                                                    Edit
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
        </div>
    );
};

export default AdminDashboard;