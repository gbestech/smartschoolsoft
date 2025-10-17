import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ===== Individual Report Components =====
const SalesReport = ({ data }) => {
    // Debug: Check what data actually contains
    console.log('SalesReport data:', data);

    // Handle cases where data might not be an array
    if (!data) {
        return (
            <div className="text-center py-8 text-gray-500">
                No data available
            </div>
        );
    }

    if (!Array.isArray(data)) {
        return (
            <div className="text-center py-8 text-yellow-600">
                Invalid data format. Expected array but got: {typeof data}
                <pre className="text-xs mt-2 text-left">{JSON.stringify(data, null, 2)}</pre>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No sales data found for the selected date range
            </div>
        );
    }

    const totalSales = data.reduce((sum, sale) => sum + parseFloat(sale.total || 0), 0);
    const totalAmountPaid = data.reduce((sum, sale) => sum + parseFloat(sale.amount_paid || 0), 0);
    const totalBalance = data.reduce((sum, sale) => sum + parseFloat(sale.balance || 0), 0);
    const totalItems = data.reduce((sum, sale) => {
        const items = sale.items || [];
        return sum + items.reduce((itemSum, item) => itemSum + (item.qty || 0), 0);
    }, 0);

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{data.length}</div>
                    <div className="text-sm text-blue-800">Total Transactions</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">₦{totalSales.toLocaleString()}</div>
                    <div className="text-sm text-green-800">Total Sales</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">₦{totalAmountPaid.toLocaleString()}</div>
                    <div className="text-sm text-purple-800">Amount Paid</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{totalItems}</div>
                    <div className="text-sm text-orange-800">Items Sold</div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left">Customer</th>
                            <th className="px-4 py-2 text-left">Phone</th>
                            <th className="px-4 py-2 text-left">Items</th>
                            <th className="px-4 py-2 text-left">Total</th>
                            <th className="px-4 py-2 text-left">Paid</th>
                            <th className="px-4 py-2 text-left">Balance</th>
                            <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(sale => (
                            <tr key={sale.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2">
                                    <div className="font-medium">{sale.customer_name || 'N/A'}</div>
                                    <div className="text-xs text-gray-500">{sale.gender || 'N/A'}</div>
                                </td>
                                <td className="px-4 py-2">{sale.phone || 'N/A'}</td>
                                <td className="px-4 py-2">
                                    {(sale.items || []).map((item, index) => (
                                        <div key={index} className="text-xs">
                                            Item #{item.product} (Qty: {item.qty})
                                        </div>
                                    ))}
                                </td>
                                <td className="px-4 py-2 font-semibold">₦{parseFloat(sale.total || 0).toLocaleString()}</td>
                                <td className="px-4 py-2 text-green-600">₦{parseFloat(sale.amount_paid || 0).toLocaleString()}</td>
                                <td className="px-4 py-2">
                                    <span className={parseFloat(sale.balance || 0) > 0 ? "text-red-600 font-semibold" : "text-green-600"}>
                                        ₦{parseFloat(sale.balance || 0).toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-4 py-2">
                                    <span className={`px-2 py-1 rounded-full text-xs ${parseFloat(sale.balance || 0) === 0
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                        }`}>
                                        {parseFloat(sale.balance || 0) === 0 ? 'Paid' : 'Pending'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-semibold">
                        <tr>
                            <td colSpan="3" className="px-4 py-2 text-right">Totals:</td>
                            <td className="px-4 py-2">₦{totalSales.toLocaleString()}</td>
                            <td className="px-4 py-2">₦{totalAmountPaid.toLocaleString()}</td>
                            <td className="px-4 py-2">₦{totalBalance.toLocaleString()}</td>
                            <td className="px-4 py-2"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

const ProfitReport = ({ data }) => (
    <div>
        <h3 className="text-lg font-semibold mb-4">Profit Report</h3>
        <div className="text-center py-8 text-gray-500">
            {data?.message || "Profit report not implemented yet"}
        </div>
    </div>
);

const CategoryReport = ({ data }) => (
    <div>
        <h3 className="text-lg font-semibold mb-4">Category Report</h3>
        <div className="text-center py-8 text-gray-500">
            {data?.message || "Category report not implemented yet"}
        </div>
    </div>
);

const RevenueReport = ({ data }) => (
    <div>
        <h3 className="text-lg font-semibold mb-4">Revenue Report</h3>
        <div className="text-center py-8 text-gray-500">
            {data?.message || "Revenue report not implemented yet"}
        </div>
    </div>
);

const CustomerReport = ({ data }) => (
    <div>
        <h3 className="text-lg font-semibold mb-4">Customer Report</h3>
        <div className="text-center py-8 text-gray-500">
            {data?.message || "Customer report not implemented yet"}
        </div>
    </div>
);

const StockReport = ({ data }) => {
    // Debug: Check what data actually contains
    console.log('StockReport data:', data);

    if (!data) {
        return (
            <div className="text-center py-8 text-gray-500">
                No stock data available
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">Stock Level Summary</h3>

            {/* Check if summary exists */}
            {data.summary ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{data.summary.totalProducts || 0}</div>
                        <div className="text-sm text-blue-800">Total Products</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">₦{(data.summary.totalInventoryValue || 0).toLocaleString()}</div>
                        <div className="text-sm text-green-800">Inventory Value</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{data.summary.outOfStock || 0}</div>
                        <div className="text-sm text-red-800">Out of Stock</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{data.summary.lowStock || 0}</div>
                        <div className="text-sm text-orange-800">Low Stock</div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-4 text-yellow-600">
                    Summary data not available
                </div>
            )}

            {/* Low stock products table */}
            {data.lowStock && data.lowStock.length > 0 ? (
                <div className="mt-6">
                    <h4 className="font-semibold mb-3 text-red-600">Low Stock Alert - Products ({data.lowStock.length})</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left">Product</th>
                                    <th className="px-4 py-2 text-left">Category</th>
                                    <th className="px-4 py-2 text-left">Current Stock</th>
                                    <th className="px-4 py-2 text-left">Price</th>
                                    <th className="px-4 py-2 text-left">Stock Value</th>
                                    <th className="px-4 py-2 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.lowStock.map(product => (
                                    <tr key={product.id} className="border-b hover:bg-red-50">
                                        <td className="px-4 py-2 font-medium">{product.name}</td>
                                        <td className="px-4 py-2">{product.category}</td>
                                        <td className="px-4 py-2">
                                            <span className={`font-semibold ${product.quantity === 0 ? 'text-red-600' : 'text-orange-600'
                                                }`}>
                                                {product.quantity}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">₦{parseFloat(product.price || 0).toLocaleString()}</td>
                                        <td className="px-4 py-2">₦{(parseFloat(product.price || 0) * product.quantity).toLocaleString()}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${product.quantity === 0
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-orange-100 text-orange-800'
                                                }`}>
                                                {product.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-4 text-green-600">
                    No low stock products found
                </div>
            )}

            {/* All products inventory */}
            {data.allProducts && data.allProducts.length > 0 && (
                <div className="mt-8">
                    <h4 className="font-semibold mb-3">Complete Inventory</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left">Product</th>
                                    <th className="px-4 py-2 text-left">Category</th>
                                    <th className="px-4 py-2 text-left">Stock</th>
                                    <th className="px-4 py-2 text-left">Price</th>
                                    <th className="px-4 py-2 text-left">Stock Value</th>
                                    <th className="px-4 py-2 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.allProducts.map(product => (
                                    <tr key={product.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-2 font-medium">{product.name}</td>
                                        <td className="px-4 py-2">{product.category}</td>
                                        <td className="px-4 py-2">
                                            <span className={`font-semibold ${product.quantity === 0
                                                    ? 'text-red-600'
                                                    : product.quantity < 5
                                                        ? 'text-orange-600'
                                                        : 'text-green-600'
                                                }`}>
                                                {product.quantity}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">₦{parseFloat(product.price || 0).toLocaleString()}</td>
                                        <td className="px-4 py-2">₦{(parseFloat(product.price || 0) * product.quantity).toLocaleString()}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${product.quantity === 0
                                                    ? 'bg-red-100 text-red-800'
                                                    : product.quantity < 5
                                                        ? 'bg-orange-100 text-orange-800'
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                                                {product.quantity === 0
                                                    ? 'Out of Stock'
                                                    : product.quantity < 5
                                                        ? 'Low Stock'
                                                        : 'In Stock'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper component to render different report types
const ReportRenderer = ({ reportType, data }) => {
    console.log(`ReportRenderer: ${reportType}`, data);

    switch (reportType) {
        case 'stock':
            return <StockReport data={data} />;
        case 'sales':
            return <SalesReport data={data} />;
        case 'profit':
            return <ProfitReport data={data} />;
        case 'category':
            return <CategoryReport data={data} />;
        case 'revenue':
            return <RevenueReport data={data} />;
        case 'customer':
            return <CustomerReport data={data} />;
        default:
            return <div>Select a report type</div>;
    }
};

const Reports = () => {
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState('stock');
    const [reportData, setReportData] = useState(null);
    const [dateRange, setDateRange] = useState({
        start: new Date().toISOString().slice(0, 10),
        end: new Date().toISOString().slice(0, 10)
    });

    // ===== Helper report generators =====
    const generateStockReport = (products) => {
        if (!Array.isArray(products)) {
            console.error('generateStockReport: products is not an array', products);
            return {
                summary: { totalProducts: 0, totalInventoryValue: 0, outOfStock: 0, lowStock: 0 },
                lowStock: [],
                allProducts: []
            };
        }

        const lowStock = products.filter(p => p.quantity < 5);
        const totalInventoryValue = products.reduce((acc, p) => acc + (parseFloat(p.price || 0) * (p.quantity || 0)), 0);

        return {
            summary: {
                totalProducts: products.length,
                totalInventoryValue,
                outOfStock: products.filter(p => p.quantity === 0).length,
                lowStock: lowStock.length,
            },
            lowStock,
            allProducts: products.sort((a, b) => (a.quantity || 0) - (b.quantity || 0))
        };
    };

    const generateDailySalesReport = (sales, startDate, endDate) => {
        if (!Array.isArray(sales)) {
            console.error('generateDailySalesReport: sales is not an array', sales);
            return [];
        }

        return sales.filter(sale => {
            const saleDate = sale.date;
            return saleDate >= startDate && saleDate <= endDate;
        });
    };

    const generateProfitReport = (products, sales) => {
        return { profit: 0, message: "Profit report not implemented yet" };
    };

    const generateCategorySalesReport = (sales, products) => {
        return { categories: [], message: "Category report not implemented yet" };
    };

    const generateRevenueReport = (sales, period) => {
        return { revenue: 0, message: "Revenue report not implemented yet" };
    };

    const generateCustomerReport = (sales) => {
        return { customers: [], message: "Customer report not implemented yet" };
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [salesRes, productsRes] = await Promise.all([
                axios.get('http://127.0.0.1:8000/api/sales/sales/', {
                    headers: { 'Authorization': `Token ${token}` }
                }),
                axios.get('http://127.0.0.1:8000/api/products/', {
                    headers: { 'Authorization': `Token ${token}` }
                })
            ]);

            console.log('Sales API response:', salesRes.data);
            console.log('Products API response:', productsRes.data);

            setSales(salesRes.data);
            setProducts(productsRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const generateReport = () => {
        let data = null;

        console.log('Generating report:', selectedReport);
        console.log('Available sales:', sales);
        console.log('Available products:', products);

        switch (selectedReport) {
            case 'stock':
                data = generateStockReport(products);
                break;
            case 'sales':
                data = generateDailySalesReport(sales, dateRange.start, dateRange.end);
                break;
            case 'profit':
                data = generateProfitReport(products, sales);
                break;
            case 'category':
                data = generateCategorySalesReport(sales, products);
                break;
            case 'revenue':
                data = generateRevenueReport(sales, 'monthly');
                break;
            case 'customer':
                data = generateCustomerReport(sales);
                break;
            default:
                data = { error: 'Unknown report type' };
                break;
        }

        console.log('Generated report data:', data);
        setReportData(data);
    };

    const exportToCSV = (data, filename) => {
        // CSV export implementation
        console.log('Exporting to CSV:', filename, data);
    };

    if (loading) {
        return <div className="p-6">Loading reports...</div>;
    }

    return (
        <div className="p-6 w-full">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Business Reports</h1>

            {/* Report Controls */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                        value={selectedReport}
                        onChange={(e) => setSelectedReport(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                    >
                        <option value="stock">Stock Level Report</option>
                        <option value="sales">Daily Sales Report</option>
                        <option value="profit">Profit Analysis</option>
                        <option value="category">Sales by Category</option>
                        <option value="revenue">Revenue Report</option>
                        <option value="customer">Customer Report</option>
                    </select>

                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                    />

                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                    />

                    <button
                        onClick={generateReport}
                        className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
                    >
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Report Display */}
            {reportData && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                            {selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Report
                            {selectedReport === 'sales' && (
                                <span className="text-sm font-normal text-gray-600 ml-2">
                                    ({dateRange.start} to {dateRange.end})
                                </span>
                            )}
                        </h2>
                        <button
                            onClick={() => exportToCSV(reportData, `${selectedReport}_report`)}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                            Export CSV
                        </button>
                    </div>

                    {/* Render different report types */}
                    <ReportRenderer reportType={selectedReport} data={reportData} />
                </div>
            )}
        </div>
    );
};

export default Reports;