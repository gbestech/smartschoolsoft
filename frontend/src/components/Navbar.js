import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <nav className="bg-black shadow-lg border-b border-gray-800 fixed top-0 left-0 right-0 z-50">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Brand Logo */}
                    <div className="flex-shrink-0">
                        <Link
                            to="/"
                            className="flex items-center text-xl font-bold text-white hover:text-blue-300 transition-colors"
                        >
                            <span className="mr-2 text-2xl">🔐</span>
                            G-bestech
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="text-white hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Dashboard
                                </Link>
                                {user?.user_type === 'admin' && (
                                    <Link
                                        to="/admin"
                                        className="text-white hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Admin
                                    </Link>
                                )}
                                <span className="text-gray-300 px-3 py-2 text-sm font-medium">
                                    Hi, <span className="font-semibold text-white">{user?.username}</span>
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-white hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;