import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [stats, setStats] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: 'company',
        email: '',
        phone: '',
        website: '',
        address: '',
        city: '',
        state: '',
        country: 'Nigeria',
        postal_code: '',
        company_name: '',
        tax_id: '',
        registration_number: '',
        contact_person: '',
        contact_position: '',
        bank_name: '',
        account_number: '',
        account_name: '',
        status: 'active',
        notes: ''
    });

    // Debug function to check API responses
    const debugAPI = (response, endpoint) => {
        console.log(`🔍 ${endpoint} Response:`, response);
        console.log(`📊 Response data:`, response.data);
        console.log(`📋 Response status:`, response.status);
    };

    // Fetch suppliers
    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            console.log('🔑 Token exists:', !!token);
            
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (statusFilter) params.append('status', statusFilter);
            if (typeFilter) params.append('type', typeFilter);

            const url = `http://127.0.0.1:8000/api/suppliers/${params.toString() ? `?${params.toString()}` : ''}`;
            console.log('🌐 Fetching from URL:', url);

            const response = await axios.get(url, {
                headers: { 
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            debugAPI(response, 'fetchSuppliers');
            setSuppliers(response.data);
            
        } catch (error) {
            console.error('❌ Error fetching suppliers:', error);
            console.error('📞 Error response:', error.response);
            console.error('🔧 Error message:', error.message);
            
            if (error.response) {
                // Server responded with error status
                if (error.response.status === 401) {
                    toast.error('Authentication failed. Please login again.');
                } else if (error.response.status === 403) {
                    toast.error('You do not have permission to view suppliers.');
                } else if (error.response.status === 404) {
                    toast.error('Suppliers endpoint not found. Check backend URL.');
                } else {
                    toast.error(`Server error: ${error.response.status}`);
                }
            } else if (error.request) {
                // Network error
                toast.error('Cannot connect to server. Check if Django server is running.');
            } else {
                toast.error('Unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch statistics
    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:8000/api/suppliers/stats/', {
                headers: { 
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });
            
            debugAPI(response, 'fetchStats');
            setStats(response.data);
            
        } catch (error) {
            console.warn('⚠️ Could not fetch stats:', error);
            // Don't show error for stats - it's not critical
        }
    };

    useEffect(() => {
        console.log('🚀 Suppliers component mounted');
        fetchSuppliers();
        fetchStats();
    }, [searchTerm, statusFilter, typeFilter]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            type: 'company',
            email: '',
            phone: '',
            website: '',
            address: '',
            city: '',
            state: '',
            country: 'Nigeria',
            postal_code: '',
            company_name: '',
            tax_id: '',
            registration_number: '',
            contact_person: '',
            contact_position: '',
            bank_name: '',
            account_number: '',
            account_name: '',
            status: 'active',
            notes: ''
        });
        setEditingSupplier(null);
    };

    // Create supplier
    const handleCreateSupplier = async (e) => {
        e.preventDefault();
        console.log('📝 Creating supplier with data:', formData);
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://127.0.0.1:8000/api/suppliers/', formData, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            debugAPI(response, 'createSupplier');
            toast.success('✅ Supplier created successfully!');
            setShowModal(false);
            resetForm();
            fetchSuppliers();
            fetchStats();
            
        } catch (error) {
            console.error('❌ Error creating supplier:', error);
            
            if (error.response?.data) {
                const errors = error.response.data;
                console.log('📋 Validation errors:', errors);
                
                // Handle different error formats
                if (typeof errors === 'object') {
                    Object.entries(errors).forEach(([field, messages]) => {
                        if (Array.isArray(messages)) {
                            messages.forEach(msg => toast.error(`❌ ${field}: ${msg}`));
                        } else {
                            toast.error(`❌ ${field}: ${messages}`);
                        }
                    });
                } else if (typeof errors === 'string') {
                    toast.error(`❌ ${errors}`);
                } else {
                    toast.error('❌ Validation error occurred');
                }
            } else if (error.request) {
                toast.error('❌ Cannot connect to server');
            } else {
                toast.error('❌ Failed to create supplier');
            }
        }
    };

    // Update supplier
    const handleUpdateSupplier = async (e) => {
        e.preventDefault();
        console.log('✏️ Updating supplier:', editingSupplier?.id, 'with data:', formData);
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://127.0.0.1:8000/api/suppliers/${editingSupplier.id}/`, 
                formData, 
                {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            debugAPI(response, 'updateSupplier');
            toast.success('✅ Supplier updated successfully!');
            setShowModal(false);
            resetForm();
            fetchSuppliers();
            fetchStats();
            
        } catch (error) {
            console.error('❌ Error updating supplier:', error);
            
            if (error.response?.data) {
                const errors = error.response.data;
                Object.entries(errors).forEach(([field, messages]) => {
                    if (Array.isArray(messages)) {
                        messages.forEach(msg => toast.error(`❌ ${field}: ${msg}`));
                    } else {
                        toast.error(`❌ ${field}: ${messages}`);
                    }
                });
            } else {
                toast.error('❌ Failed to update supplier');
            }
        }
    };

    // Delete supplier
    const handleDeleteSupplier = async (id) => {
        if (!window.confirm('Are you sure you want to delete this supplier?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://127.0.0.1:8000/api/suppliers/${id}/`, {
                headers: { 
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            toast.success('✅ Supplier deleted successfully!');
            fetchSuppliers();
            fetchStats();
            
        } catch (error) {
            console.error('❌ Error deleting supplier:', error);
            toast.error('❌ Failed to delete supplier');
        }
    };

    // Edit supplier
    const handleEditSupplier = (supplier) => {
        console.log('📋 Editing supplier:', supplier);
        setFormData({
            name: supplier.name || '',
            type: supplier.type || 'company',
            email: supplier.email || '',
            phone: supplier.phone || '',
            website: supplier.website || '',
            address: supplier.address || '',
            city: supplier.city || '',
            state: supplier.state || '',
            country: supplier.country || 'Nigeria',
            postal_code: supplier.postal_code || '',
            company_name: supplier.company_name || '',
            tax_id: supplier.tax_id || '',
            registration_number: supplier.registration_number || '',
            contact_person: supplier.contact_person || '',
            contact_position: supplier.contact_position || '',
            bank_name: supplier.bank_name || '',
            account_number: supplier.account_number || '',
            account_name: supplier.account_name || '',
            status: supplier.status || 'active',
            notes: supplier.notes || ''
        });
        setEditingSupplier(supplier);
        setShowModal(true);
    };

    // View supplier details
    const handleViewSupplier = (supplier) => {
        const details = `
Supplier Details:

📋 Name: ${supplier.name}
📧 Email: ${supplier.email}
📞 Phone: ${supplier.phone}
🏢 Type: ${supplier.type_display || supplier.type}
📊 Status: ${supplier.status_display || supplier.status}
🏠 City: ${supplier.city}
📍 State: ${supplier.state}
${supplier.company_name ? `💼 Company: ${supplier.company_name}` : ''}
${supplier.contact_person ? `👤 Contact: ${supplier.contact_person}` : ''}
        `.trim();
        
        alert(details);
    };

    // Test API connection
    const testConnection = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:8000/api/suppliers/', {
                headers: { 'Authorization': `Token ${token}` },
                timeout: 5000
            });
            console.log('✅ Connection test successful:', response.status);
            toast.success('✅ Backend connection successful!');
        } catch (error) {
            console.error('❌ Connection test failed:', error);
            toast.error('❌ Cannot connect to backend server');
        }
    };

    return (
        <div className="p-6 w-full">
            <ToastContainer position="top-right" autoClose={5000} />

            {/* Debug Header */}
            {/* <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-yellow-800">Debug Mode</h3>
                        <p className="text-yellow-600 text-sm">Check browser console for detailed logs</p>
                    </div>
                    <button
                        onClick={testConnection}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                    >
                        Test Connection
                    </button>
                </div>
            </div> */}

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Supplier Management</h1>
                <p className="text-gray-600 mt-2">Manage your suppliers and vendor information</p>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="text-2xl mr-4">🏢</div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Total Suppliers</h3>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_suppliers}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="text-2xl mr-4">✅</div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Active</h3>
                                <p className="text-2xl font-bold text-green-600">{stats.active_suppliers}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="text-2xl mr-4">⏸️</div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Inactive</h3>
                                <p className="text-2xl font-bold text-orange-600">{stats.inactive_suppliers}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="text-2xl mr-4">🚫</div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Suspended</h3>
                                <p className="text-2xl font-bold text-red-600">{stats.suspended_suppliers}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters and Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="flex flex-col md:flex-row gap-4 flex-1">
                        <input
                            type="text"
                            placeholder="Search suppliers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                        </select>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Types</option>
                            <option value="individual">Individual</option>
                            <option value="company">Company</option>
                            <option value="wholesaler">Wholesaler</option>
                            <option value="manufacturer">Manufacturer</option>
                        </select>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchSuppliers}
                            disabled={loading}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center disabled:opacity-50"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {loading ? 'Loading...' : 'Refresh'}
                        </button>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Supplier
                        </button>
                    </div>
                </div>
            </div>

            {/* Suppliers Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="text-gray-600">🔄 Loading suppliers...</div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {suppliers.length > 0 ? suppliers.map((supplier) => (
                                    <tr key={supplier.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{supplier.name}</div>
                                            {supplier.company_name && (
                                                <div className="text-sm text-gray-500">{supplier.company_name}</div>
                                            )}
                                            {supplier.contact_person && (
                                                <div className="text-xs text-gray-400 mt-1">
                                                    Contact: {supplier.contact_person}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{supplier.email}</div>
                                            <div className="text-sm text-gray-500">{supplier.phone}</div>
                                            {supplier.website && (
                                                <div className="text-xs text-blue-500 truncate max-w-xs">
                                                    {supplier.website}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{supplier.city}, {supplier.state}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-xs">
                                                {supplier.address}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                supplier.type === 'company' ? 'bg-blue-100 text-blue-800' :
                                                supplier.type === 'individual' ? 'bg-green-100 text-green-800' :
                                                supplier.type === 'wholesaler' ? 'bg-purple-100 text-purple-800' :
                                                'bg-orange-100 text-orange-800'
                                            }`}>
                                                {supplier.type_display || supplier.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                supplier.status === 'active' ? 'bg-green-100 text-green-800' :
                                                supplier.status === 'inactive' ? 'bg-orange-100 text-orange-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {supplier.status_display || supplier.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleViewSupplier(supplier)}
                                                    className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded transition-colors text-sm flex items-center"
                                                    title="View Details"
                                                >
                                                    👁️ View
                                                </button>
                                                <button
                                                    onClick={() => handleEditSupplier(supplier)}
                                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors text-sm flex items-center"
                                                    title="Edit Supplier"
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSupplier(supplier.id)}
                                                    className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors text-sm flex items-center"
                                                    title="Delete Supplier"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center">
                                            <div className="text-4xl mb-4">🏢</div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                No Suppliers Found
                                            </h3>
                                            <p className="text-gray-500 mb-4">
                                                {searchTerm || statusFilter || typeFilter 
                                                    ? 'Try adjusting your search or filters.'
                                                    : 'No suppliers in the system yet.'
                                                }
                                            </p>
                                            <button
                                                onClick={() => {
                                                    resetForm();
                                                    setShowModal(true);
                                                }}
                                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                            >
                                                Add First Supplier
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Supplier Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-gray-800">
                                    {editingSupplier ? '✏️ Edit Supplier' : '➕ Add New Supplier'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <form onSubmit={editingSupplier ? handleUpdateSupplier : handleCreateSupplier} className="p-6">
                            <div className="space-y-6">
                                {/* Basic Information */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">📋 Basic Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Supplier Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                                placeholder="Enter supplier name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Type *
                                            </label>
                                            <select
                                                name="type"
                                                value={formData.type}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="individual">👤 Individual</option>
                                                <option value="company">🏢 Company</option>
                                                <option value="wholesaler">📦 Wholesaler</option>
                                                <option value="manufacturer">🏭 Manufacturer</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                                placeholder="supplier@example.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone *
                                            </label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                                placeholder="+234 800 000 0000"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Status
                                            </label>
                                            <select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="active">✅ Active</option>
                                                <option value="inactive">⏸️ Inactive</option>
                                                <option value="suspended">🚫 Suspended</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Website
                                            </label>
                                            <input
                                                type="url"
                                                name="website"
                                                value={formData.website}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Address Information */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">🏠 Address Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Address *
                                            </label>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                                placeholder="Full street address"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                City *
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                                placeholder="City"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                State *
                                            </label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                                placeholder="State"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Country
                                            </label>
                                            <input
                                                type="text"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Country"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Postal Code
                                            </label>
                                            <input
                                                type="text"
                                                name="postal_code"
                                                value={formData.postal_code}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Postal code"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Information - Collapsible */}
                                <details className="border border-gray-200 rounded-lg">
                                    <summary className="p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-between">
                                        <span className="font-medium text-gray-700">📎 Additional Information (Optional)</span>
                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </summary>
                                    <div className="p-4 space-y-6 border-t">
                                        {/* Company Information */}
                                        <div>
                                            <h5 className="text-md font-medium text-gray-900 mb-3">🏢 Company Information</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                                    <input
                                                        type="text"
                                                        name="company_name"
                                                        value={formData.company_name}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Company legal name"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
                                                    <input
                                                        type="text"
                                                        name="tax_id"
                                                        value={formData.tax_id}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Tax identification number"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                                                    <input
                                                        type="text"
                                                        name="registration_number"
                                                        value={formData.registration_number}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Business registration number"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact Person */}
                                        <div>
                                            <h5 className="text-md font-medium text-gray-900 mb-3">👤 Contact Person</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                                                    <input
                                                        type="text"
                                                        name="contact_person"
                                                        value={formData.contact_person}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Full name of contact person"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Position</label>
                                                    <input
                                                        type="text"
                                                        name="contact_position"
                                                        value={formData.contact_position}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Job title/position"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bank Information */}
                                        <div>
                                            <h5 className="text-md font-medium text-gray-900 mb-3">💳 Bank Information</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                                    <input
                                                        type="text"
                                                        name="bank_name"
                                                        value={formData.bank_name}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Bank name"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                                    <input
                                                        type="text"
                                                        name="account_number"
                                                        value={formData.account_number}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Account number"
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                                                    <input
                                                        type="text"
                                                        name="account_name"
                                                        value={formData.account_name}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Account holder name"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        <div>
                                            <h5 className="text-md font-medium text-gray-900 mb-3">📝 Additional Notes</h5>
                                            <textarea
                                                name="notes"
                                                value={formData.notes}
                                                onChange={handleInputChange}
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Any additional notes or comments about this supplier..."
                                            />
                                        </div>
                                    </div>
                                </details>
                            </div>

                            <div className="flex gap-3 p-6 border-t border-gray-200 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    {editingSupplier ? 'Update Supplier' : 'Create Supplier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;