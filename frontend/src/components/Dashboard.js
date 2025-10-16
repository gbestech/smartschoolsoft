import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="p-6 w-full">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">User Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, {user?.username}!</p>
            </div>

            {/* User Info Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex justify-between items-center py-1">
                        <label className="text-gray-600 font-medium text-sm">Username:</label>
                        <span className="text-gray-800 text-sm">{user?.username}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                        <label className="text-gray-600 font-medium text-sm">Email:</label>
                        <span className="text-gray-800 text-sm">{user?.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                        <label className="text-gray-600 font-medium text-sm">User Type:</label>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user?.user_type === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                            }`}>
                            {user?.user_type}
                        </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                        <label className="text-gray-600 font-medium text-sm">Member since:</label>
                        <span className="text-gray-800 text-sm">{new Date(user?.date_joined).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Dashboard Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <h4 className="text-md font-semibold text-gray-800 mb-3">Recent Activity</h4>
                    <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                            <span className="text-md mt-0.5">📊</span>
                            <div className="flex-1">
                                <p className="text-gray-800 text-xs">You logged in to your account</p>
                                <small className="text-gray-500 text-xs">Just now</small>
                            </div>
                        </div>
                        <div className="flex items-start space-x-2">
                            <span className="text-md mt-0.5">👤</span>
                            <div className="flex-1">
                                <p className="text-gray-800 text-xs">Profile updated successfully</p>
                                <small className="text-gray-500 text-xs">2 days ago</small>
                            </div>
                        </div>
                        <div className="flex items-start space-x-2">
                            <span className="text-md mt-0.5">🔒</span>
                            <div className="flex-1">
                                <p className="text-gray-800 text-xs">Password changed</p>
                                <small className="text-gray-500 text-xs">1 week ago</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <h4 className="text-md font-semibold text-gray-800 mb-3">Quick Stats</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-xl font-bold text-blue-600">12</div>
                            <div className="text-xs text-gray-600 mt-1">Projects</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-xl font-bold text-green-600">5</div>
                            <div className="text-xs text-gray-600 mt-1">Tasks</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-xl font-bold text-purple-600">3</div>
                            <div className="text-xs text-gray-600 mt-1">Messages</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-xl font-bold text-orange-600">98%</div>
                            <div className="text-xs text-gray-600 mt-1">Profile Complete</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <h4 className="text-md font-semibold text-gray-800 mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                        <button className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium">
                            Edit Profile
                        </button>
                        <button className="w-full bg-gray-500 text-white py-2 px-3 rounded-lg hover:bg-gray-600 transition-colors text-xs font-medium">
                            Change Password
                        </button>
                        <button className="w-full bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors text-xs font-medium">
                            View Reports
                        </button>
                        <button className="w-full bg-purple-500 text-white py-2 px-3 rounded-lg hover:bg-purple-600 transition-colors text-xs font-medium">
                            Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;