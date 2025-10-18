import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);

    const userMenuItems = [
        { path: '/dashboard', icon: '📊', label: 'Dashboard', key: 'dashboard' },
        { path: '/profile', icon: '👤', label: 'Profile', key: 'profile' },
        {
            path: '/products',
            icon: '📦',
            label: 'Products',
            key: 'products',
            submenu: [

                // { path: '/products/categories', label: 'Categories', key: 'categories' },
                // { path: '/products/inventory', label: 'Inventory', key: 'inventory' },
                // { path: '/products/add', label: 'Add New', key: 'add-product' },
            ]
        },
        { path: '/orders', icon: '🛒', label: 'Orders', key: 'orders' },
        // { path: '/customers', icon: '👥', label: 'Customers', key: 'customers' },
        { path: '/messages', icon: '💬', label: 'Messages', key: 'messages' },
        { path: '/settings', icon: '⚙️', label: 'Settings', key: 'settings' },
    ];

    const adminMenuItems = [
        { path: '/admin', icon: '📊', label: 'Overview', key: 'overview' },
        { path: '/admin/users', icon: '👥', label: 'User Management', key: 'users' },
        {
            path: '/admin/products',
            icon: '📦',
            label: 'Products',
            key: 'products',
            submenu: [
                { path: '/admin/products/all', label: 'All Products', key: 'all-products' },
                { path: '/admin/products/categories', label: 'Categories', key: 'categories' },
                { path: '/admin/products/inventory', label: 'Inventory', key: 'inventory' },
                { path: '/admin/products/analytics', label: 'Analytics', key: 'analytics' },
                { path: '/admin/products/add', label: 'Add New', key: 'add-product' },
                { path: '/orders', label: 'Order', key: 'order' },
                

            ]

        },
        { path: '/reports', icon: '📈', label: 'Reports', key: 'reports' },
        { path: '/admin/settings', icon: '⚙️', label: 'System Settings', key: 'settings' },
        { path: '/activitylogs', icon: '📋', label: 'Activity Logs', key: 'activitylogs' },
        { path: '/debtors', label: 'Debtors', key: 'debtor' },
        { path: '/customerReport', label: 'Customer Report', key: 'reprot' },
    ];

    const commonMenuItems = [
        { path: '/help', icon: '❓', label: 'Help & Support', key: 'help' },
    ];

    const menuItems = user?.user_type === 'admin' ? adminMenuItems : userMenuItems;

    const isActive = (path) => {
        if (path.startsWith('#')) return false;
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const hasActiveSubmenu = (submenu) => {
        return submenu?.some(item => isActive(item.path));
    };

    const handleLogout = () => {
        logout();
    };

    const toggleDropdown = (key) => {
        setOpenDropdown(openDropdown === key ? null : key);
    };

    const handleDropdownClick = (item, e) => {
        if (item.submenu) {
            e.preventDefault();
            toggleDropdown(item.key);
        } else {
            navigate(item.path);
        }
    };

    const handleSubmenuClick = (subItemPath, e) => {
        e.stopPropagation();
        navigate(subItemPath);
        setOpenDropdown(null);
    };

    return (
        <div className={`bg-white shadow-lg border-r border-gray-200 flex flex-col transition-all duration-300 fixed left-0 top-0 h-screen ${isCollapsed ? 'w-20' : 'w-64'
            }`}>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <button
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? '→' : '←'}
                </button>
                {!isCollapsed && (
                    <h3 className="text-lg font-semibold text-gray-800">
                        {user?.user_type === 'admin' ? 'Admin Panel' : 'Dashboard'}
                    </h3>
                )}
            </div>

            {/* Sidebar Content - Fixed height with scrolling */}
            <div className="flex-1 flex flex-col overflow-y-auto">
                {/* Main Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item) => (
                        <div key={item.key} className="space-y-1">
                            {item.submenu ? (
                                // Dropdown items
                                <div
                                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${hasActiveSubmenu(item.submenu)
                                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    onClick={(e) => handleDropdownClick(item, e)}
                                >
                                    <span className="text-lg mr-3">{item.icon}</span>
                                    {!isCollapsed && (
                                        <div className="flex-1 flex items-center justify-between">
                                            <span className="text-sm font-medium">{item.label}</span>
                                            <span className="text-xs transform transition-transform">
                                                {openDropdown === item.key ? '▲' : '▼'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Regular items
                                <Link
                                    to={item.path}
                                    className={`flex items-center p-3 rounded-lg transition-colors ${isActive(item.path)
                                        ? 'bg-blue-500 text-white shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <span className="text-lg mr-3">{item.icon}</span>
                                    {!isCollapsed && (
                                        <span className="text-sm font-medium">{item.label}</span>
                                    )}
                                </Link>
                            )}

                            {/* Dropdown Menu */}
                            {!isCollapsed && item.submenu && openDropdown === item.key && (
                                <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                                    {item.submenu.map((subItem) => (
                                        <Link
                                            key={subItem.key}
                                            to={subItem.path}
                                            className={`block py-2 px-3 rounded-lg text-sm transition-colors ${isActive(subItem.path)
                                                ? 'bg-blue-100 text-blue-700 font-medium'
                                                : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                            onClick={(e) => handleSubmenuClick(subItem.path, e)}
                                        >
                                            {subItem.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Common Menu Items */}
                <nav className="p-4 border-t border-gray-200 space-y-1">
                    {commonMenuItems.map((item) => (
                        <Link
                            key={item.key}
                            to={item.path}
                            className={`flex items-center p-3 rounded-lg transition-colors ${isActive(item.path)
                                ? 'bg-blue-500 text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <span className="text-lg mr-3">{item.icon}</span>
                            {!isCollapsed && (
                                <span className="text-sm font-medium">{item.label}</span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* User Profile Section */}
                {!isCollapsed ? (
                    <div className="p-4 border-t border-gray-200 space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-800 truncate">
                                    {user?.username}
                                </h4>
                                <p className="text-xs text-gray-500 capitalize">
                                    {user?.user_type}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center space-x-2 p-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                        >
                            <span>🚪</span>
                            <span>Logout</span>
                        </button>
                    </div>
                ) : (
                    <div className="p-4 border-t border-gray-200 space-y-4">
                        <div className="flex justify-center">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center p-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                        >
                            🚪
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;


