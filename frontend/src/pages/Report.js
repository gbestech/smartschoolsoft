import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
        const lowStock = products.filter(p => p.quantity < 5);
        const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);

        return {
            summary: {
                totalProducts: products.length,
                totalInventoryValue,
                outOfStock: products.filter(p => p.quantity === 0).length,
                lowStock: lowStock.length,
            },
            lowStock
        };
    };

    const generateDailySalesReport = (sales, date) => {
        return sales.filter(sale => sale.date === date);
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

    // ===== Placeholder components for now =====
    const SalesReport = ({ data }) => (
        <div>
            <h3 className="text-lg font-semibold mb-4">Sales Report</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );

    const ProfitReport = ({ data }) => (
        <div>
            <h3 className="text-lg font-semibold mb-4">Profit Report</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );

    const CategoryReport = ({ data }) => (
        <div>
            <h3 className="text-lg font-semibold mb-4">Category Report</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );

    const RevenueReport = ({ data }) => (
        <div>
            <h3 className="text-lg font-semibold mb-4">Revenue Report</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );

    const CustomerReport = ({ data }) => (
        <div>
            <h3 className="text-lg font-semibold mb-4">Customer Report</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );

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

        switch (selectedReport) {
            case 'stock':
                data = generateStockReport(products);
                break;
            case 'sales':
                data = generateDailySalesReport(sales, dateRange.start);
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
                break;
        }

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

// Helper component to render different report types
const ReportRenderer = ({ reportType, data }) => {
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

// Individual report components would go here...
const StockReport = ({ data }) => (
    <div>
        <h3 className="text-lg font-semibold mb-4">Stock Level Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{data.summary.totalProducts}</div>
                <div className="text-sm text-blue-800">Total Products</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">₦{data.summary.totalInventoryValue.toLocaleString()}</div>
                <div className="text-sm text-green-800">Inventory Value</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{data.summary.outOfStock}</div>
                <div className="text-sm text-red-800">Out of Stock</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{data.summary.lowStock}</div>
                <div className="text-sm text-orange-800">Low Stock</div>
            </div>
        </div>

        {/* Low stock products table */}
        {data.lowStock.length > 0 && (
            <div className="mt-6">
                <h4 className="font-semibold mb-3">Low Stock Products ({data.lowStock.length})</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">Product</th>
                                <th className="px-4 py-2 text-left">Category</th>
                                <th className="px-4 py-2 text-left">Current Stock</th>
                                <th className="px-4 py-2 text-left">Cost Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.lowStock.map(product => (
                                <tr key={product.id} className="border-b">
                                    <td className="px-4 py-2">{product.name}</td>
                                    <td className="px-4 py-2">{product.category}</td>
                                    <td className="px-4 py-2 text-red-600 font-semibold">{product.quantity}</td>
                                    <td className="px-4 py-2">₦{parseFloat(product.price).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
    </div>
);

export default Reports;