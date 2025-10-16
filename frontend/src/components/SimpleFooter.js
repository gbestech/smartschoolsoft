import React from 'react';
import { useAuth } from '../context/AuthContext';

const SimpleFooter = () => {
    const { isAuthenticated, user } = useAuth();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-800 text-white py-4 px-6 border-t border-gray-700">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                <div className="footer-left">
                    <p className="text-sm text-gray-300">
                        &copy; {currentYear} G-bestech. All rights reserved.
                    </p>
                </div>
                <div className="footer-right flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    {isAuthenticated && (
                        <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                            {user?.username} ({user?.user_type})
                        </span>
                    )}
                    <div className="flex space-x-4">
                        <a
                            href="/privacy"
                            className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            Privacy
                        </a>
                        <a
                            href="/terms"
                            className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            Terms
                        </a>
                        <a
                            href="/help"
                            className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            Help
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default SimpleFooter;