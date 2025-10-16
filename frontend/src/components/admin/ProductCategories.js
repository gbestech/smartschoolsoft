import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const ProductCategories = () => {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'active'
    });

    // Mock data - replace with actual API calls
    const mockCategories = [
        { id: 1, name: 'Electronics', description: 'Electronic devices and accessories', productCount: 45, status: 'active', createdAt: '2024-01-15' },
        { id: 2, name: 'Clothing', description: 'Apparel and fashion items', productCount: 120, status: 'active', createdAt: '2024-01-10' },
        { id: 3, name: 'Books', description: 'Books and educational materials', productCount: 89, status: 'active', createdAt: '2024-01-08' },
        { id: 4, name: 'Home & Garden', description: 'Home improvement and garden supplies', productCount: 67, status: 'inactive', createdAt: '2024-01-05' },
        { id: 5, name: 'Sports', description: 'Sports equipment and accessories', productCount: 34, status: 'active', createdAt: '2024-01-03' },
        { id: 6, name: 'Beauty & Personal Care', description: 'Cosmetics and personal care products', productCount: 78, status: 'active', createdAt: '2024-01-02' },
        { id: 7, name: 'Toys & Games', description: 'Children toys and entertainment', productCount: 56, status: 'active', createdAt: '2024-01-01' },
        { id: 8, name: 'Automotive', description: 'Vehicle parts and accessories', productCount: 23, status: 'inactive', createdAt: '2023-12-28' },
    ];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setCategories(mockCategories);
            setLoading(false);
        }, 1000);
    }, []);

    // Filter categories based on search and status
    const filteredCategories = categories.filter(category => {
        const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || category.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingCategory) {
            // Update existing category
            setCategories(prev => prev.map(cat =>
                cat.id === editingCategory.id
                    ? { ...cat, ...formData }
                    : cat
            ));
        } else {
            // Add new category
            const newCategory = {
                id: Math.max(...categories.map(c => c.id)) + 1,
                ...formData,
                productCount: 0,
                createdAt: new Date().toISOString().split('T')[0]
            };
            setCategories(prev => [...prev, newCategory]);
        }

        resetForm();
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            status: 'active'
        });
        setEditingCategory(null);
        setShowAddForm(false);
    };

    const handleEdit = (category) => {
        setFormData({
            name: category.name,
            description: category.description,
            status: category.status
        });
        setEditingCategory(category);
        setShowAddForm(true);
    };

    const handleDelete = (categoryId) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        }
    };

    const toggleStatus = (categoryId) => {
        setCategories(prev => prev.map(cat =>
            cat.id === categoryId
                ? { ...cat, status: cat.status === 'active' ? 'inactive' : 'active' }
                : cat
        ));
    };

    const handleBulkAction = (action) => {
        if (action === 'activate') {
            setCategories(prev => prev.map(cat => ({ ...cat, status: 'active' })));
        } else if (action === 'deactivate') {
            setCategories(prev => prev.map(cat => ({ ...cat, status: 'inactive' })));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg text-gray-600">Loading categories...</div>
            </div>
        );
    }

    return (
        <div className="p-6 w-full">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Product Categories</h1>
                        <p className="text-gray-600 mt-2">Manage your product categories and organization system</p>
                    </div>
                    <button
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                        onClick={() => setShowAddForm(true)}
                    >
                        <span className="text-lg mr-2">+</span>
                        Add New Category
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center">
                        <div className="text-xl mr-4">📊</div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Total Categories</h3>
                            <p className="text-2xl font-bold text-gray-800">{categories.length}</p>
                            <span className="text-xs text-gray-500">All categories in system</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center">
                        <div className="text-xl mr-4">✅</div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Active Categories</h3>
                            <p className="text-2xl font-bold text-gray-800">{categories.filter(cat => cat.status === 'active').length}</p>
                            <span className="text-xs text-gray-500">Currently active</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center">
                        <div className="text-xl mr-4">📦</div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
                            <p className="text-2xl font-bold text-gray-800">{categories.reduce((sum, cat) => sum + cat.productCount, 0)}</p>
                            <span className="text-xs text-gray-500">Across all categories</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center">
                        <div className="text-xl mr-4">📈</div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Avg Products</h3>
                            <p className="text-2xl font-bold text-gray-800">
                                {categories.length > 0
                                    ? Math.round(categories.reduce((sum, cat) => sum + cat.productCount, 0) / categories.length)
                                    : 0
                                }
                            </p>
                            <span className="text-xs text-gray-500">Per category</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="flex-1">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400 text-sm">🔍</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search categories by name or description..."
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>
                    <div className="flex gap-4">
                        <select
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            onChange={(e) => handleBulkAction(e.target.value)}
                            defaultValue=""
                        >
                            <option value="" disabled>Bulk Actions</option>
                            <option value="activate">Activate All</option>
                            <option value="deactivate">Deactivate All</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-800">
                            {editingCategory ? 'Edit Category' : 'Create New Category'}
                        </h3>
                        <div className="flex gap-3">
                            <button
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="categoryForm"
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                {editingCategory ? 'Update Category' : 'Create Category'}
                            </button>
                        </div>
                    </div>
                    <form id="categoryForm" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter category name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="4"
                                placeholder="Enter detailed category description..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </form>
                </div>
            )}

            {/* Categories Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-800">
                            Categories ({filteredCategories.length})
                        </h3>
                        <div className="text-sm text-gray-500">
                            Showing {filteredCategories.length} of {categories.length} categories
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCategories.map(category => (
                                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="text-lg mr-3">📁</span>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                                <div className="text-sm text-gray-500">ID: {category.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate">{category.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-gray-900">{category.productCount}</div>
                                            <div className="text-xs text-gray-500">products</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${category.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}
                                            onClick={() => toggleStatus(category.id)}
                                        >
                                            <span className={`w-2 h-2 rounded-full mr-2 ${category.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                                                }`}></span>
                                            {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {category.createdAt}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors flex items-center"
                                                onClick={() => handleEdit(category)}
                                            >
                                                <span className="text-sm mr-1">✏️</span>
                                                Edit
                                            </button>
                                            <button
                                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors flex items-center"
                                                onClick={() => handleDelete(category.id)}
                                            >
                                                <span className="text-sm mr-1">🗑️</span>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredCategories.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-4">📁</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Categories Found</h3>
                            <p className="text-gray-500 mb-6">
                                {searchTerm || filterStatus !== 'all'
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'Get started by creating your first product category.'
                                }
                            </p>
                            {!searchTerm && filterStatus === 'all' && (
                                <button
                                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center mx-auto"
                                    onClick={() => setShowAddForm(true)}
                                >
                                    <span className="text-lg mr-2">+</span>
                                    Create Your First Category
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCategories; 

