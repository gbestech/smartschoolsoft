import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalSales: 0,
        totalProducts: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        totalDebt: 0,
        totalDebtors: 0,
        loading: true
    });
    const [recentSales, setRecentSales] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [topDebtors, setTopDebtors] = useState([]);

    const isAdmin = user?.user_type === 'admin';
    const isManager = user?.user_type === 'manager';
    const canManageProducts = isAdmin || isManager;

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch sales data
            const salesResponse = await axios.get('http://127.0.0.1:8000/api/sales/sales/', {
                headers: { 'Authorization': `Token ${token}` }
            });

            // Fetch products data
            const productsResponse = await axios.get('http://127.0.0.1:8000/api/products/', {
                headers: { 'Authorization': `Token ${token}` }
            });

            const salesData = salesResponse.data;
            const productsData = productsResponse.data;

            // Calculate statistics based on user role
            const totalSales = salesData.length;
            const totalProducts = productsData.length;

            // For non-admin users, only show their own sales data
            const userSalesData = (isAdmin || isManager) ? salesData : salesData.filter(sale => sale.created_by === user?.id);

            // Calculate totals based on filtered data
            const totalRevenue = userSalesData.reduce((sum, sale) => sum + parseFloat(sale.total || 0), 0);
            const totalDebt = userSalesData.reduce((sum, sale) => sum + parseFloat(sale.balance || 0), 0);

            // Count unique customers and debtors for the user
            const uniqueCustomers = new Set(userSalesData.map(sale => sale.customer_name?.toLowerCase().trim()).filter(Boolean));
            const totalCustomers = uniqueCustomers.size;

            // Find debtors (customers with balance > 0) for the user
            const debtorsMap = new Map();
            userSalesData.forEach(sale => {
                if (sale.balance > 0 && sale.customer_name) {
                    const customerName = sale.customer_name.toLowerCase().trim();
                    if (debtorsMap.has(customerName)) {
                        debtorsMap.set(customerName, debtorsMap.get(customerName) + parseFloat(sale.balance));
                    } else {
                        debtorsMap.set(customerName, parseFloat(sale.balance));
                    }
                }
            });

            const totalDebtors = debtorsMap.size;

            // Get top 5 debtors (highest debt) - only user's debtors for non-admin
            const topDebtorsList = Array.from(debtorsMap.entries())
                .map(([name, debt]) => ({ name, debt }))
                .sort((a, b) => b.debt - a.debt)
                .slice(0, 5);

            // Get recent sales (last 5) - only user's sales for non-admin
            const recentSalesData = userSalesData
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5);

            // Get low stock products (quantity <= 10) - non-admin can see this
            const lowStockItems = productsData
                .filter(product => product.quantity <= 10)
                .slice(0, 5);

            setStats({
                totalSales: userSalesData.length,
                totalProducts,
                totalCustomers,
                totalRevenue,
                totalDebt,
                totalDebtors,
                loading: false
            });

            setRecentSales(recentSalesData);
            setLowStockProducts(lowStockItems);
            setTopDebtors(topDebtorsList);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    const handleEditProfile = () => {
        navigate('/edit-profile');
    };

    const handleChangePassword = () => {
        navigate('/change-password');
    };

    const handleViewReports = () => {
        if (!isAdmin && !isManager) {
            alert('Only administrators and managers can access reports');
            return;
        }
        navigate('/reports');
    };

    const handleSettings = () => {
        if (!isAdmin) {
            alert('Only administrators can access settings');
            return;
        }
        navigate('/settings');
    };

    const handleViewSales = () => {
        navigate('/sales');
    };

    const handleViewInventory = () => {
        navigate('/inventory');
    };

    const handleViewDebtors = () => {
        navigate('/debtors');
    };

    const handleAddProduct = () => {
        if (!canManageProducts) {
            alert('You do not have permission to add products');
            return;
        }
        navigate('/admin/products/add');
    };

    const handleEditProduct = () => {
        if (!canManageProducts) {
            alert('You do not have permission to edit products');
            return;
        }
        navigate('/inventory');
    };

    const handleDeleteProduct = () => {
        if (!canManageProducts) {
            alert('You do not have permission to delete products');
            return;
        }
        navigate('/inventory');
    };

    const handleManageProducts = () => {
        if (!canManageProducts) {
            alert('You do not have permission to manage products');
            return;
        }
        navigate('/inventory');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="p-6 w-full">
            {/* Header */}
            <div className="mb-2">
                <h1 className="text-2xl font-bold text-gray-800">
                    {isAdmin ? 'Admin Dashboard' : isManager ? 'Manager Dashboard' : 'User Dashboard'}
                </h1>
                <p className="text-gray-600 mt-1">
                    Welcome back, {user?.username}!
                    <span className={`ml-2 ${isAdmin ? 'text-purple-600' : isManager ? 'text-blue-600' : 'text-green-600'}`}>
                        {isAdmin ? '👑 Administrator' : isManager ? '👔 Manager' : '👤 Standard User'}
                    </span>
                </p>
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

            {/* Enhanced Stats Overview - Different for Admin/Manager vs User */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Total Sales - All can see */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center">
                        <div className="text-2xl mr-4 text-blue-500">💰</div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">
                                {isAdmin || isManager ? 'Total Sales' : 'My Sales'}
                            </h3>
                            <p className="text-2xl font-bold text-gray-800">
                                {stats.loading ? '...' : stats.totalSales}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Total Revenue - All can see but different context */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center">
                        <div className="text-2xl mr-4 text-green-500">📈</div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">
                                {isAdmin || isManager ? 'Total Revenue' : 'My Revenue'}
                            </h3>
                            <p className="text-2xl font-bold text-green-600">
                                {stats.loading ? '...' : formatCurrency(stats.totalRevenue).replace('NGN', '₦')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Outstanding Debt - All can see but different context */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center">
                        <div className="text-2xl mr-4 text-red-500">⚠️</div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">
                                {isAdmin || isManager ? 'Outstanding Debt' : 'My Outstanding'}
                            </h3>
                            <p className="text-2xl font-bold text-red-600">
                                {stats.loading ? '...' : formatCurrency(stats.totalDebt).replace('NGN', '₦')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Total Debtors - All can see but different context */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center">
                        <div className="text-2xl mr-4 text-orange-500">👥</div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">
                                {isAdmin || isManager ? 'Total Debtors' : 'My Debtors'}
                            </h3>
                            <p className="text-2xl font-bold text-orange-600">
                                {stats.loading ? '...' : stats.totalDebtors}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Widgets - Show for Admin and Manager */}
            {(isAdmin || isManager) && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Sales - Admin/Manager only */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-800">Recent Sales</h4>
                            <button
                                onClick={handleViewSales}
                                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                            >
                                View All
                            </button>
                        </div>
                        <div className="space-y-4">
                            {recentSales.length > 0 ? (
                                recentSales.map((sale, index) => (
                                    <div key={sale.id || index} className="flex items-start space-x-3">
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${sale.balance > 0 ? 'bg-red-100' : 'bg-green-100'
                                            }`}>
                                            <span className={`text-sm ${sale.balance > 0 ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                {sale.balance > 0 ? '⚠️' : '💰'}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-800 text-sm font-medium">
                                                {sale.customer_name || 'Unknown Customer'}
                                            </p>
                                            <p className="text-gray-500 text-xs">
                                                {formatCurrency(sale.total)} • {formatDate(sale.date)}
                                            </p>
                                            <div className="flex justify-between items-center mt-1">
                                                <small className="text-gray-400 text-xs">
                                                    {sale.payment_method || 'Cash'} • {sale.items?.length || 0} items
                                                </small>
                                                {sale.balance > 0 && (
                                                    <small className="text-red-500 text-xs font-medium">
                                                        Owes: {formatCurrency(sale.balance).replace('NGN', '₦')}
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4">
                                    <span className="text-gray-400 text-sm">No recent sales</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats - Admin/Manager only */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Business Overview</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold">
                                    {stats.loading ? '...' : stats.totalSales}
                                </div>
                                <div className="text-xs opacity-90 mt-1">Total Sales</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold">
                                    {stats.loading ? '...' : stats.totalProducts}
                                </div>
                                <div className="text-xs opacity-90 mt-1">Products</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold">
                                    {stats.loading ? '...' : stats.totalCustomers}
                                </div>
                                <div className="text-xs opacity-90 mt-1">Customers</div>
                            </div>
                            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold">
                                    {stats.loading ? '...' : stats.totalDebtors}
                                </div>
                                <div className="text-xs opacity-90 mt-1">Debtors</div>
                            </div>
                        </div>

                        {/* Additional Stats */}
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                                <div className="text-lg font-bold text-gray-800">
                                    {lowStockProducts.length}
                                </div>
                                <div className="text-xs text-gray-600">Low Stock Items</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                                <div className="text-lg font-bold text-gray-800">
                                    {stats.totalSales > 0 ? formatCurrency(stats.totalRevenue / stats.totalSales).replace('NGN', '₦') : '₦0'}
                                </div>
                                <div className="text-xs text-gray-600">Avg. Sale Value</div>
                            </div>
                        </div>
                    </div>

                    {/* Top Debtors - Admin/Manager only */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-800">Top Debtors</h4>
                            <button
                                onClick={handleViewDebtors}
                                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                            >
                                View All
                            </button>
                        </div>
                        <div className="space-y-4">
                            {topDebtors.length > 0 ? (
                                topDebtors.map((debtor, index) => (
                                    <div key={index} className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                            <span className="text-red-600 text-sm">⚠️</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-800 text-sm font-medium">
                                                {debtor.name}
                                            </p>
                                            <p className="text-red-600 text-xs font-semibold">
                                                Owes: {formatCurrency(debtor.debt).replace('NGN', '₦')}
                                            </p>
                                            <small className="text-gray-400 text-xs">
                                                {debtor.phone || 'No contact info'}
                                            </small>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4">
                                    <span className="text-gray-400 text-sm">No outstanding debts</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Additional Features Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Low Stock Alerts - All can see */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800">Low Stock Alerts</h4>
                        <button
                            onClick={handleViewInventory}
                            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                        >
                            View All
                        </button>
                    </div>
                    <div className="space-y-3">
                        {lowStockProducts.length > 0 ? (
                            lowStockProducts.map((product, index) => (
                                <div key={product.id || index} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                                    <div>
                                        <p className="text-orange-800 text-sm font-medium">
                                            {product.name}
                                        </p>
                                        <p className="text-orange-600 text-xs">
                                            Only {product.quantity} units left
                                        </p>
                                    </div>
                                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                                        Low Stock
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4">
                                <span className="text-gray-400 text-sm">No low stock items</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Status & Financial Health - Admin/Manager only */}
                {(isAdmin || isManager) && (
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Financial Health</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600">Total Revenue</span>
                                <span className="text-green-600 font-semibold">
                                    {formatCurrency(stats.totalRevenue).replace('NGN', '₦')}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600">Outstanding Debt</span>
                                <span className="text-red-600 font-semibold">
                                    {formatCurrency(stats.totalDebt).replace('NGN', '₦')}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600">Collection Rate</span>
                                <span className={`font-semibold ${stats.totalRevenue > 0 ?
                                    (1 - stats.totalDebt / stats.totalRevenue) > 0.9 ? 'text-green-600' :
                                        (1 - stats.totalDebt / stats.totalRevenue) > 0.7 ? 'text-yellow-600' : 'text-red-600'
                                    : 'text-gray-600'
                                    }`}>
                                    {stats.totalRevenue > 0 ?
                                        `${((1 - stats.totalDebt / stats.totalRevenue) * 100).toFixed(1)}%` :
                                        'N/A'
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600">Active Debtors</span>
                                <span className="text-orange-600 font-semibold">{stats.totalDebtors}</span>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="mt-6">
                            <h5 className="text-md font-semibold text-gray-800 mb-3">System Alerts</h5>
                            <div className="space-y-3">
                                {stats.totalDebt > 0 && (
                                    <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                        <span className="text-red-500 text-sm">💰</span>
                                        <div>
                                            <p className="text-red-800 text-sm font-medium">Outstanding Debt</p>
                                            <p className="text-red-600 text-xs">
                                                {stats.totalDebtors} customer(s) owe {formatCurrency(stats.totalDebt).replace('NGN', '₦')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {lowStockProducts.length > 0 && (
                                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <span className="text-yellow-500 text-sm">⚠️</span>
                                        <div>
                                            <p className="text-yellow-800 text-sm font-medium">Low Stock Alert</p>
                                            <p className="text-yellow-600 text-xs">
                                                {lowStockProducts.length} product(s) need restocking
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* User Performance Summary - For all users */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">My Performance Summary</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Total Sales Made</span>
                            <span className="text-blue-600 font-semibold">{stats.totalSales}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Revenue Generated</span>
                            <span className="text-green-600 font-semibold">
                                {formatCurrency(stats.totalRevenue).replace('NGN', '₦')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Pending Collections</span>
                            <span className="text-red-600 font-semibold">
                                {formatCurrency(stats.totalDebt).replace('NGN', '₦')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Customers Served</span>
                            <span className="text-purple-600 font-semibold">{stats.totalCustomers}</span>
                        </div>
                    </div>

                    {/* User-specific notifications */}
                    <div className="mt-6">
                        <h5 className="text-md font-semibold text-gray-800 mb-3">My Alerts</h5>
                        <div className="space-y-3">
                            {stats.totalDebt > 0 && (
                                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                    <span className="text-red-500 text-sm">💰</span>
                                    <div>
                                        <p className="text-red-800 text-sm font-medium">Collections Needed</p>
                                        <p className="text-red-600 text-xs">
                                            {stats.totalDebtors} customer(s) owe you {formatCurrency(stats.totalDebt).replace('NGN', '₦')}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {lowStockProducts.length > 0 && (
                                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <span className="text-yellow-500 text-sm">⚠️</span>
                                    <div>
                                        <p className="text-yellow-800 text-sm font-medium">Low Stock Alert</p>
                                        <p className="text-yellow-600 text-xs">
                                            {lowStockProducts.length} product(s) need restocking
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions - Admin and Manager */}
            {(isAdmin || isManager) && (
                <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <button
                            onClick={handleViewSales}
                            className="flex items-center justify-center space-x-2 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
                        >
                            <span>💰</span>
                            <span>View Sales</span>
                        </button>
                        <button
                            onClick={handleManageProducts}
                            className="flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                        >
                            <span>📦</span>
                            <span>Manage Products</span>
                        </button>
                        <button
                            onClick={handleViewDebtors}
                            className="flex items-center justify-center space-x-2 bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                            <span>👥</span>
                            <span>Manage Debtors</span>
                        </button>
                        <button
                            onClick={handleViewReports}
                            className="flex items-center justify-center space-x-2 bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors font-medium"
                        >
                            <span>📊</span>
                            <span>View Reports</span>
                        </button>
                    </div>

                    {/* Product Management Actions - Only for Admin and Manager */}
                    {canManageProducts && (
                        <div className="mt-6">
                            <h5 className="text-md font-semibold text-gray-800 mb-3">Product Management</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <button
                                    onClick={handleAddProduct}
                                    className="flex items-center justify-center space-x-2 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                                >
                                    <span>➕</span>
                                    <span>Add New Product</span>
                                </button>
                                <button
                                    onClick={handleEditProduct}
                                    className="flex items-center justify-center space-x-2 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                                >
                                    <span>✏️</span>
                                    <span>Edit Products</span>
                                </button>
                                <button
                                    onClick={handleDeleteProduct}
                                    className="flex items-center justify-center space-x-2 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                                >
                                    <span>🗑️</span>
                                    <span>Delete Products</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Refresh Button */}
            <div className="mt-6 flex justify-center">
                <button
                    onClick={fetchDashboardData}
                    disabled={stats.loading}
                    className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50"
                >
                    <span>🔄</span>
                    <span>{stats.loading ? 'Refreshing...' : 'Refresh Data'}</span>
                </button>
            </div>
        </div>
    );
};

export default Dashboard;