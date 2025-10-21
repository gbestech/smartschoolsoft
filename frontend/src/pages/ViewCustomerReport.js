import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/reports/api';

const ViewCustomerReport = () => {
    const [reports, setReports] = useState([]);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedReport, setExpandedReport] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredReports, setFilteredReports] = useState([]);
    const stripHtmlTags = (html) => {
        if (!html) return '';
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };
    // Fetch products separately to get their names
    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_BASE}/products/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    };

    const fetchReports = async () => {
        try {
            setIsLoading(true);

            // Fetch both reports and products in parallel
            const [reportsResponse, productsData] = await Promise.all([
                axios.get(`${API_BASE}/reports/`),
                fetchProducts()
            ]);

            const reportsData = reportsResponse.data.results || reportsResponse.data;

            // Create a product map for easy lookup
            const productMap = {};
            productsData.forEach(product => {
                productMap[product.id] = product;
            });

            // Format reports with proper product names
            const formattedReports = Array.isArray(reportsData) ? reportsData.map(report => ({
                ...report,
                // Convert product IDs to product objects with names
                products: Array.isArray(report.products)
                    ? report.products.map(productId =>
                        productMap[productId] || { id: productId, name: `Product ${productId}` }
                    )
                    : []
            })) : [];

            setReports(formattedReports);
            setFilteredReports(formattedReports);
            setProducts(productsData);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to load reports. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    // Filter reports based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredReports(reports);
        } else {
            const filtered = reports.filter(report =>
                report.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.products.some(product =>
                    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
            setFilteredReports(filtered);
        }
        setCurrentPage(1); // Reset to first page when searching
    }, [searchTerm, reports]);

    const formatDate = (dateString) => {
        if (!dateString) return 'No date';

        try {
            // Handle different date formats
            let date;

            // If it's already a Date object
            if (dateString instanceof Date) {
                date = dateString;
            }
            // If it's a string that might be in ISO format or other formats
            else if (typeof dateString === 'string') {
                // Try parsing as ISO string first
                date = new Date(dateString);

                // If that fails, try parsing as other common formats
                if (isNaN(date.getTime())) {
                    // Try removing timezone info and parse
                    const dateWithoutTimezone = dateString.split('T')[0];
                    date = new Date(dateWithoutTimezone);

                    // If still invalid, try another approach
                    if (isNaN(date.getTime())) {
                        // Split by common separators and create date
                        const parts = dateString.split(/[-/]/);
                        if (parts.length === 3) {
                            date = new Date(parts[0], parts[1] - 1, parts[2]);
                        }
                    }
                }
            }

            if (!date || isNaN(date.getTime())) {
                console.warn('Invalid date:', dateString);
                return 'Invalid Date';
            }

            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', dateString, error);
            return 'Invalid Date';
        }
    };

    const toggleExpand = (id) => {
        setExpandedReport(expandedReport === id ? null : id);
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReports = filteredReports.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    const getProductNames = (products) => {
        if (!Array.isArray(products) || products.length === 0) {
            return 'No products selected';
        }

        const productNames = products.map(product => product.name || `Product ${product.id}`);

        // Return first 2-3 product names, show count if more
        if (productNames.length <= 3) {
            return productNames.join(', ');
        } else {
            return `${productNames.slice(0, 2).join(', ')} +${productNames.length - 2} more`;
        }
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pageNumbers = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                    <button
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                            <span className="font-medium">
                                {Math.min(indexOfLastItem, filteredReports.length)}
                            </span>{' '}
                            of <span className="font-medium">{filteredReports.length}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                            <button
                                onClick={() => paginate(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="sr-only">Previous</span>
                                &larr;
                            </button>

                            {startPage > 1 && (
                                <>
                                    <button
                                        onClick={() => paginate(1)}
                                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                    >
                                        1
                                    </button>
                                    {startPage > 2 && (
                                        <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                                            ...
                                        </span>
                                    )}
                                </>
                            )}

                            {pageNumbers.map(number => (
                                <button
                                    key={number}
                                    onClick={() => paginate(number)}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === number
                                        ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                        }`}
                                >
                                    {number}
                                </button>
                            ))}

                            {endPage < totalPages && (
                                <>
                                    {endPage < totalPages - 1 && (
                                        <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                                            ...
                                        </span>
                                    )}
                                    <button
                                        onClick={() => paginate(totalPages)}
                                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}

                            <button
                                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="sr-only">Next</span>
                                &rarr;
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow rounded-lg">
                    {/* Header with Search */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="mb-4 sm:mb-0">
                                <h1 className="text-2xl font-semibold text-gray-900">Customer Reports</h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Total: {filteredReports.length} reports
                                    {searchTerm && (
                                        <span className="ml-2 text-indigo-600">
                                            (filtered from {reports.length})
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="relative flex-1 sm:max-w-xs">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by customer, message, or product..."
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400">🔍</span>
                                    </div>
                                    {searchTerm && (
                                        <button
                                            onClick={clearSearch}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            <span className="text-gray-400 hover:text-gray-600">✕</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {filteredReports.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-4">📋</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {searchTerm ? 'No matching reports found' : 'No reports found'}
                            </h3>
                            <p className="text-gray-500">
                                {searchTerm
                                    ? 'Try adjusting your search terms'
                                    : 'No customer reports have been created yet.'
                                }
                            </p>
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Customer Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Report Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Message
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Products
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentReports.map((report) => (
                                            <React.Fragment key={report.id}>
                                                <tr className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {report.customer_name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {formatDate(report.report_date)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        
                                                        <div className="text-sm text-gray-900 max-w-md">
                                                            {report.message ? (
                                                                <>
                                                                    {stripHtmlTags(report.message).length > 100 ? (
                                                                        <>
                                                                            {stripHtmlTags(report.message).slice(0, 100)}...
                                                                            <button
                                                                                onClick={() => toggleExpand(report.id)}
                                                                                className="ml-1 text-indigo-600 hover:text-indigo-900 text-xs"
                                                                            >
                                                                                {expandedReport === report.id ? 'Show less' : 'Show more'}
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        stripHtmlTags(report.message)
                                                                    )}
                                                                </>
                                                            ) : (
                                                                'No message'
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 max-w-xs">
                                                            {report.product_names ? report.product_names.join(', ') : 'No products'}
                                                        </div>
                                                    </td>
                                                    
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">
                                                            {formatDate(report.report_date || report.created_at)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                                                        <button
                                                            onClick={() => toggleExpand(report.id)}
                                                            className="hover:text-indigo-900 font-medium"
                                                        >
                                                            {expandedReport === report.id ? 'Hide ▲' : 'View ▼'}
                                                        </button>
                                                    </td>
                                                </tr>

                                                {expandedReport === report.id && (
                                                    <tr className="bg-gray-50">
                                                        <td colSpan="6" className="px-6 py-4">
                                                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                                                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                                                                    Report Details - {report.customer_name}
                                                                </h4>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                                                    <div className="space-y-3">
                                                                        <h5 className="font-medium text-gray-700 border-b pb-2">Customer Information</h5>
                                                                        <p><strong className="text-gray-600">Name:</strong> {report.customer_name}</p>
                                                                        <p><strong className="text-gray-600">Report Date:</strong> {formatDate(report.report_date)}</p>
                                                                        <p><strong className="text-gray-600">Created:</strong> {formatDate(report.created_at)}</p>
                                                                    </div>
                                                                    {report.message ? (
                                                                        <>
                                                                            {stripHtmlTags(report.message).length > 100 ? (
                                                                                <>
                                                                                    {stripHtmlTags(report.message).slice(0, 100)}...
                                                                                    <button
                                                                                        onClick={() => toggleExpand(report.id)}
                                                                                        className="ml-1 text-indigo-600 hover:text-indigo-900 text-xs"
                                                                                    >
                                                                                        {expandedReport === report.id ? 'Show less' : 'Show more'}
                                                                                    </button>
                                                                                </>
                                                                            ) : (
                                                                                stripHtmlTags(report.message)
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        'No message'
                                                                    )}
                                                                </div>
                                                            

                                                                {report.products && report.products.length > 0 && (
                                                                    <div>
                                                                        <h5 className="font-medium text-gray-700 border-b pb-2 mb-3">Selected Products ({report.products.length})</h5>
                                                                        <div className="bg-gray-50 rounded-lg p-4">
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                                {report.products.map((product, index) => (
                                                                                    <div key={product.id || index} className="flex items-center space-x-3 bg-white p-3 rounded border">
                                                                                        <span className="w-3 h-3 bg-indigo-500 rounded-full flex-shrink-0"></span>
                                                                                        <span className="text-sm font-medium text-gray-900">
                                                                                            {report.product_names ? report.product_names.join(', ') : 'No products'}
                                                                                        </span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {renderPagination()}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewCustomerReport;