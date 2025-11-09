import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleEditProfile = () => {
        console.log('Edit profile clicked');
        navigate('/edit-profile');
    };

    const handleChangePassword = () => {
        console.log('Change password clicked');
        navigate('/change-password');
    };

    const handleViewReports = () => {
        console.log('View reports clicked');
        navigate('/reports');
    };

    const handleSettings = () => {
        console.log('Settings clicked');
        navigate('/settings');
    };

    return (
        <div className="p-6 w-full">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">User Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, {user?.username}!</p>
            </div>

            {/* User Info Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Profile Information</h3>
                    <button
                        onClick={handleEditProfile}
                        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                        Edit Profile
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <label className="text-gray-600 font-medium text-sm block">Username:</label>
                        <span className="text-gray-800 font-semibold">{user?.username || 'N/A'}</span>
                    </div>
                    <div className="space-y-2">
                        <label className="text-gray-600 font-medium text-sm block">Email:</label>
                        <span className="text-gray-800 font-semibold">{user?.email || 'N/A'}</span>
                    </div>
                    <div className="space-y-2">
                        <label className="text-gray-600 font-medium text-sm block">User Type:</label>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${user?.user_type === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : user?.user_type === 'manager'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                            {user?.user_type || 'user'}
                        </span>
                    </div>
                    <div className="space-y-2">
                        <label className="text-gray-600 font-medium text-sm block">Member since:</label>
                        <span className="text-gray-800 font-semibold">
                            {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Dashboard Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800">Recent Activity</h4>
                        <span className="text-blue-500 text-sm">View All</span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-sm">📊</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-800 text-sm font-medium">Login Successful</p>
                                <p className="text-gray-500 text-xs">You logged in to your account</p>
                                <small className="text-gray-400 text-xs">Just now</small>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 text-sm">👤</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-800 text-sm font-medium">Profile Updated</p>
                                <p className="text-gray-500 text-xs">Your profile was updated</p>
                                <small className="text-gray-400 text-xs">2 days ago</small>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-red-600 text-sm">🔒</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-800 text-sm font-medium">Security Update</p>
                                <p className="text-gray-500 text-xs">Password was changed</p>
                                <small className="text-gray-400 text-xs">1 week ago</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold">12</div>
                            <div className="text-xs opacity-90 mt-1">Total Sales</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold">8</div>
                            <div className="text-xs opacity-90 mt-1">Products</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold">5</div>
                            <div className="text-xs opacity-90 mt-1">Customers</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold">₦150K</div>
                            <div className="text-xs opacity-90 mt-1">Revenue</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h4>
                    <div className="space-y-3">
                        <button
                            onClick={handleEditProfile}
                            className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                        >
                            <span>👤</span>
                            <span>Edit Profile</span>
                        </button>
                        <button
                            onClick={handleChangePassword}
                            className="w-full flex items-center justify-center space-x-2 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        >
                            <span>🔒</span>
                            <span>Change Password</span>
                        </button>
                        <button
                            onClick={handleViewReports}
                            className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
                        >
                            <span>📊</span>
                            <span>View Reports</span>
                        </button>
                        <button
                            onClick={handleSettings}
                            className="w-full flex items-center justify-center space-x-2 bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors font-medium"
                        >
                            <span>⚙️</span>
                            <span>Settings</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Additional Features Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* System Status */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">System Status</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Server Status</span>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                Online
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Database</span>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                Connected
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Last Backup</span>
                            <span className="text-gray-800 text-sm">2 hours ago</span>
                        </div>
                    </div>
                </div>

                {/* Recent Notifications */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h4>
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                            <span className="text-blue-500 text-sm">ℹ️</span>
                            <div>
                                <p className="text-blue-800 text-sm font-medium">System Update Available</p>
                                <p className="text-blue-600 text-xs">New features are ready to be installed</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                            <span className="text-yellow-500 text-sm">⚠️</span>
                            <div>
                                <p className="text-yellow-800 text-sm font-medium">Security Alert</p>
                                <p className="text-yellow-600 text-xs">Remember to update your password regularly</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;