import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const API_BASE = "http://localhost:8000";

const ReportsDashboard = () => {
    const [activeReport, setActiveReport] = useState("sales");
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
        end: new Date().toISOString().split("T")[0]
    });

    // 📈 Fetch Report Data
    const fetchReportData = async (reportType) => {
        setLoading(true);
        try {
            let endpoint = "";

            switch (reportType) {
                case "sales":
                    endpoint = `${API_BASE}/reports/api/sales-report/?start_date=${dateRange.start}&end_date=${dateRange.end}`;
                    break;
                case "products":
                    endpoint = `${API_BASE}/reports/api/products-report/`;
                    break;
                case "inventory":
                    endpoint = `${API_BASE}/reports/api/inventory-report/`;
                    break;
                case "low-stock":
                    endpoint = `${API_BASE}/reports/api/low-stock-report/`;
                    break;
                case "out-of-stock":
                    endpoint = `${API_BASE}/reports/api/out-of-stock-report/`;
                    break;
                default:
                    endpoint = `${API_BASE}/reports/api/sales-report/`;
            }

            const response = await axios.get(endpoint);
            setReportData(response.data);
        } catch (error) {
            console.error(`Error fetching ${reportType} report:`, error);
            toast.error(`Failed to load ${reportType.replace("-", " ")} report`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData(activeReport);
    }, [activeReport, dateRange]);

    // 📤 Export Report
    const exportReport = (format = "pdf") => {
        toast.info(`Exporting ${activeReport} report as ${format.toUpperCase()}`);
        // Implement export functionality here
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Reports</h1>
                    <p className="text-gray-600">Comprehensive business intelligence dashboard</p>
                </div>

                {/* Report Type Selector */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    {[
                        { id: "sales", name: "Sales Report", icon: "💰" },
                        { id: "products", name: "Products", icon: "📦" },
                        { id: "inventory", name: "Inventory", icon: "📊" },
                        { id: "low-stock", name: "Low Stock", icon: "⚠️" },
                        { id: "out-of-stock", name: "Out of Stock", icon: "❌" }
                    ].map((report) => (
                        <button
                            key={report.id}
                            onClick={() => setActiveReport(report.id)}
                            className={`p-4 rounded-lg border-2 transition-all ${activeReport === report.id
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            <div className="text-2xl mb-2">{report.icon}</div>
                            <div className="font-medium text-sm">{report.name}</div>
                        </button>
                    ))}
                </div>

                {/* Date Range Filter */}
                <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <span className="font-medium text-gray-700">Date Range:</span>
                        <div className="flex gap-4">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="px-3 py-2 border rounded-lg"
                            />
                            <span className="self-center">to</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div className="flex gap-2 ml-auto">
                            <button
                                onClick={() => exportReport("pdf")}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                📄 Export PDF
                            </button>
                            <button
                                onClick={() => exportReport("excel")}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                                📊 Export Excel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Report Content */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <ReportContent
                            type={activeReport}
                            data={reportData}
                            dateRange={dateRange}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// 📊 Report Content Components
const ReportContent = ({ type, data, dateRange }) => {
    if (!data) return <div className="text-center py-8 text-gray-500">No data available</div>;

    switch (type) {
        case "sales":
            return <SalesReport data={data} dateRange={dateRange} />;
        case "products":
            return <ProductsReport data={data} />;
        case "inventory":
            return <InventoryReport data={data} />;
        case "low-stock":
            return <LowStockReport data={data} />;
        case "out-of-stock":
            return <OutOfStockReport data={data} />;
        default:
            return <SalesReport data={data} dateRange={dateRange} />;
    }
};

// 💰 Sales Report Component
const SalesReport = ({ data, dateRange }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Sales Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-blue-600 font-bold text-2xl">${data?.total_revenue || "0"}</div>
                    <div className="text-blue-800 font-medium">Total Revenue</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-green-600 font-bold text-2xl">{data?.total_orders || "0"}</div>
                    <div className="text-green-800 font-medium">Total Orders</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="text-purple-600 font-bold text-2xl">${data?.average_order_value || "0"}</div>
                    <div className="text-purple-800 font-medium">Average Order</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="text-orange-600 font-bold text-2xl">{data?.top_selling_product || "N/A"}</div>
                    <div className="text-orange-800 font-medium">Top Product</div>
                </div>
            </div>

            {/* Sales Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customers</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data?.daily_sales?.map((sale, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.orders}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sale.revenue}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.customers}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// 📦 Products Report Component
const ProductsReport = ({ data }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Products Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-blue-600 font-bold text-2xl">{data?.total_products || "0"}</div>
                    <div className="text-blue-800 font-medium">Total Products</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-green-600 font-bold text-2xl">{data?.active_products || "0"}</div>
                    <div className="text-green-800 font-medium">Active Products</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="text-purple-600 font-bold text-2xl">{data?.out_of_stock || "0"}</div>
                    <div className="text-purple-800 font-medium">Out of Stock</div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data?.products?.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {product.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {product.category}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${product.price}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {product.stock_quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.status === "In Stock"
                                            ? "bg-green-100 text-green-800"
                                            : product.status === "Low Stock"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-red-100 text-red-800"
                                        }`}>
                                        {product.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// 📊 Inventory Report Component
const InventoryReport = ({ data }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Inventory Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-blue-600 font-bold text-2xl">{data?.total_items || "0"}</div>
                    <div className="text-blue-800 font-medium">Total Items</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-green-600 font-bold text-2xl">${data?.total_value || "0"}</div>
                    <div className="text-green-800 font-medium">Total Value</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="text-yellow-600 font-bold text-2xl">{data?.low_stock_items || "0"}</div>
                    <div className="text-yellow-800 font-medium">Low Stock Items</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="text-red-600 font-bold text-2xl">{data?.out_of_stock_items || "0"}</div>
                    <div className="text-red-800 font-medium">Out of Stock</div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data?.inventory?.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.sku}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.current_stock}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.min_stock}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${item.value}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.status === "Adequate"
                                            ? "bg-green-100 text-green-800"
                                            : item.status === "Low Stock"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-red-100 text-red-800"
                                        }`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ⚠️ Low Stock Report Component
const LowStockReport = ({ data }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Low Stock Alert Report</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                    <span className="text-2xl mr-3">⚠️</span>
                    <div>
                        <h3 className="font-bold text-yellow-800">Low Stock Warning</h3>
                        <p className="text-yellow-700">
                            {data?.count || "0"} products are running low and need restocking
                        </p>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urgency</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data?.products?.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {product.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {product.current_stock}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {product.min_stock}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {product.reorder_level}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.urgency === "High"
                                            ? "bg-red-100 text-red-800"
                                            : product.urgency === "Medium"
                                                ? "bg-orange-100 text-orange-800"
                                                : "bg-yellow-100 text-yellow-800"
                                        }`}>
                                        {product.urgency} Priority
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ❌ Out of Stock Report Component
const OutOfStockReport = ({ data }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Out of Stock Report</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                    <span className="text-2xl mr-3">❌</span>
                    <div>
                        <h3 className="font-bold text-red-800">Critical Stock Alert</h3>
                        <p className="text-red-700">
                            {data?.count || "0"} products are completely out of stock
                        </p>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Stock Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Out of Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data?.products?.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {product.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {product.sku}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {product.last_stock_date || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {product.days_out_of_stock || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                                        Reorder
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportsDashboard;