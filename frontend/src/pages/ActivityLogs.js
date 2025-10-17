import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [filters, setFilters] = useState({
        action: '',
        module: '',
        user: '',
        start_date: '',
        end_date: '',
        search: ''
    });
    const [page, setPage] = useState(1);
    const perPage = 20;

    const actionOptions = [
        { value: '', label: 'All Actions' },
        { value: 'CREATE', label: 'Create' },
        { value: 'UPDATE', label: 'Update' },
        { value: 'DELETE', label: 'Delete' },
        { value: 'LOGIN', label: 'Login' },
        { value: 'LOGOUT', label: 'Logout' },
        { value: 'VIEW', label: 'View' },
        { value: 'EXPORT', label: 'Export' }
    ];

    const moduleOptions = [
        { value: '', label: 'All Modules' },
        { value: 'PRODUCT', label: 'Products' },
        { value: 'SALE', label: 'Sales' },
        { value: 'CUSTOMER', label: 'Customers' },
        { value: 'USER', label: 'Users' },
        { value: 'INVENTORY', label: 'Inventory' },
        { value: 'AUTH', label: 'Authentication' }
    ];

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();

            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            params.append('page', page);

            const response = await axios.get(`http://127.0.0.1:8000/api/activity-logs/?${params}`, {
                headers: { Authorization: `Token ${token}` }
            });

            setLogs(response.data.results || response.data);
        } catch (err) {
            console.error('Error fetching activity logs:', err);
            toast.error('Failed to load activity logs');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:8000/api/activity-logs/stats/', {
                headers: { Authorization: `Token ${token}` }
            });
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const exportLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:8000/api/activity-logs/export/', {
                headers: { Authorization: `Token ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'activity_logs.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Logs exported successfully');
        } catch (err) {
            console.error('Error exporting logs:', err);
            toast.error('Failed to export logs');
        }
    };

    useEffect(() => {
        fetchLogs();
        fetchStats();
    }, [filters, page]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({
            action: '',
            module: '',
            user: '',
            start_date: '',
            end_date: '',
            search: ''
        });
        setPage(1);
    };

    const getActionColor = (action) => {
        const colors = {
            CREATE: 'bg-green-100 text-green-800',
            UPDATE: 'bg-blue-100 text-blue-800',
            DELETE: 'bg-red-100 text-red-800',
            LOGIN: 'bg-purple-100 text-purple-800',
            LOGOUT: 'bg-gray-100 text-gray-800',
            VIEW: 'bg-yellow-100 text-yellow-800',
            EXPORT: 'bg-indigo-100 text-indigo-800',
            IMPORT: 'bg-pink-100 text-pink-800'
        };
        return colors[action] || 'bg-gray-100 text-gray-800';
    };

    const getModuleColor = (module) => {
        const colors = {
            PRODUCT: 'border-l-green-500',
            SALE: 'border-l-blue-500',
            CUSTOMER: 'border-l-purple-500',
            USER: 'border-l-orange-500',
            INVENTORY: 'border-l-red-500',
            AUTH: 'border-l-indigo-500',
            SYSTEM: 'border-l-gray-500'
        };
        return colors[module] || 'border-l-gray-500';
    };

    if (loading && !logs.length) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-gray-600">Loading activity logs...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 w-full">
            <ToastContainer position="top-right" autoClose={3000} theme="light" />

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Activity Logs</h1>
                <p className="text-gray-600 mt-2">View system activity and audit logs</p>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Activities (30d)</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.total_activities}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <span className="text-blue-600 text-xl">📊</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Recent (7d)</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.recent_activities}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <span className="text-green-600 text-xl">🔄</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Top Module</p>
                                <p className="text-lg font-bold text-gray-800">
                                    {stats.module_stats[0]?.module || 'N/A'}
                                </p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <span className="text-purple-600 text-xl">📦</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Top Action</p>
                                <p className="text-lg font-bold text-gray-800">
                                    {stats.action_stats[0]?.action || 'N/A'}
                                </p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-full">
                                <span className="text-orange-600 text-xl">⚡</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                        <select
                            value={filters.action}
                            onChange={(e) => handleFilterChange('action', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {actionOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
                        <select
                            value={filters.module}
                            onChange={(e) => handleFilterChange('module', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {moduleOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            value={filters.start_date}
                            onChange={(e) => handleFilterChange('start_date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                            type="date"
                            value={filters.end_date}
                            onChange={(e) => handleFilterChange('end_date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <input
                            type="text"
                            placeholder="Search in descriptions..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex items-end gap-2">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Clear
                        </button>
                        <button
                            onClick={exportLogs}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            Export CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Timestamp
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Module
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    IP Address
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center">
                                        <div className="text-gray-500 text-lg mb-2">📝</div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No Activity Logs</h3>
                                        <p className="text-gray-500">No activity logs found matching your criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(log.timestamp).toLocaleDateString()}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {log.user_name || 'System'}
                                            </div>
                                            {log.user_email && (
                                                <div className="text-sm text-gray-500">{log.user_email}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{log.module}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-md truncate">
                                                {log.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500">
                                                {log.ip_address || 'N/A'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {logs.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                            Showing {logs.length} activities
                        </div>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                                {page}
                            </span>
                            <button
                                onClick={() => setPage(page + 1)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogs;