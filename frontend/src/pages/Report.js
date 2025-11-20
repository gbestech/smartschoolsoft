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

    // 📈 Fetch Report Data - CORRECTED VERSION
    const fetchReportData = async (reportType) => {
        setLoading(true);
        setReportData(null); // Clear previous data

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Authentication required. Please log in.");
                return;
            }

            let endpoint = "";
            let params = {};

            switch (reportType) {
                case "sales":
                    endpoint = `${API_BASE}/api/sales/sales/`; // Adjusted endpoint
                    params = {
                        start_date: dateRange.start,
                        end_date: dateRange.end
                    };
                    break;
                case "products":
                    endpoint = `${API_BASE}/api/products/`; // Adjusted endpoint
                    break;
                case "inventory":
                    endpoint = `${API_BASE}/api/products/`; // Using products for inventory
                    break;
                case "low-stock":
                    endpoint = `${API_BASE}/api/products/`; // Using products for low stock
                    break;
                case "out-of-stock":
                    endpoint = `${API_BASE}/api/products/`; // Using products for out of stock
                    break;
                default:
                    endpoint = `${API_BASE}/api/sales/sales/`;
            }

            console.log(`🔍 Fetching ${reportType} from: ${endpoint}`);

            const response = await axios.get(endpoint, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                params: params
            });

            console.log(`✅ ${reportType} API Response:`, response.data);

            // Transform data based on report type
            const transformedData = transformReportData(reportType, response.data);
            setReportData(transformedData);

        } catch (error) {
            console.error(`❌ Error fetching ${reportType} report:`, error);

            if (error.response?.status === 401) {
                toast.error("Session expired. Please log in again.");
            } else if (error.response?.status === 404) {
                toast.error(`Report endpoint not found. Check API URL.`);
            } else if (error.response?.data) {
                toast.error(`API Error: ${error.response.data.detail || 'Unknown error'}`);
            } else {
                toast.error(`Failed to load ${reportType.replace("-", " ")} report`);
            }

            // Set fallback data for demo purposes
            setReportData(generateFallbackData(reportType));
        } finally {
            setLoading(false);
        }
    };

    // Transform API data to match component expectations
    const transformReportData = (reportType, apiData) => {
        switch (reportType) {
            case "sales":
                return transformSalesData(apiData);
            case "products":
                return transformProductsData(apiData);
            case "inventory":
                return transformInventoryData(apiData);
            case "low-stock":
                return transformLowStockData(apiData);
            case "out-of-stock":
                return transformOutOfStockData(apiData);
            default:
                return apiData;
        }
    };
    // Sales data transformation
    const transformSalesData = (salesData) => {
        if (!salesData || !Array.isArray(salesData)) {
            return generateFallbackData('sales');
        }

        const totalRevenue = salesData.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);
        const totalOrders = salesData.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Find top selling product
        const productSales = {};
        salesData.forEach(sale => {
            if (sale.items && Array.isArray(sale.items)) {
                sale.items.forEach(item => {
                    const productName = item.product_name || `Product ${item.product}`;
                    productSales[productName] = (productSales[productName] || 0) + (item.qty || 0);
                });
            }
        });

        const topSellingProduct = Object.keys(productSales).length > 0
            ? Object.keys(productSales).reduce((a, b) => productSales[a] > productSales[b] ? a : b)
            : "N/A";

        // Generate daily sales
        const dailySalesMap = {};
        salesData.forEach(sale => {
            const date = sale.date ? sale.date.split('T')[0] : new Date().toISOString().split('T')[0];
            if (!dailySalesMap[date]) {
                dailySalesMap[date] = { date, orders: 0, revenue: 0, customers: 0 };
            }
            dailySalesMap[date].orders += 1;
            dailySalesMap[date].revenue += parseFloat(sale.total) || 0;
            dailySalesMap[date].customers += sale.customer_name ? 1 : 0;
        });

        const dailySales = Object.values(dailySalesMap);

        return {
            total_revenue: totalRevenue.toFixed(2),
            total_orders: totalOrders,
            average_order_value: averageOrderValue.toFixed(2),
            top_selling_product: topSellingProduct,
            daily_sales: dailySales
        };
    };

    // Products data transformation
    const transformProductsData = (productsData) => {
        if (!productsData || !Array.isArray(productsData)) {
            return generateFallbackData('products');
        }

        const activeProducts = productsData.filter(p => p.quantity > 0).length;
        const outOfStock = productsData.filter(p => p.quantity === 0).length;

        const products = productsData.map(product => ({
            id: product.id,
            name: product.name || 'Unnamed Product',
            category: product.category || 'Uncategorized',
            price: parseFloat(product.selling_price || product.price || 0).toFixed(2),
            stock_quantity: product.quantity || 0,
            status: getStockStatus(product)
        }));

        return {
            total_products: productsData.length,
            active_products: activeProducts,
            out_of_stock: outOfStock,
            products: products
        };
    };

    // Inventory data transformation
    const transformInventoryData = (productsData) => {
        if (!productsData || !Array.isArray(productsData)) {
            return generateFallbackData('inventory');
        }

        const totalValue = productsData.reduce((sum, product) => {
            return sum + (parseFloat(product.price) || 0) * (product.quantity || 0);
        }, 0);

        const lowStockItems = productsData.filter(p => isLowStock(p)).length;
        const outOfStockItems = productsData.filter(p => p.quantity === 0).length;

        const inventory = productsData.map(product => ({
            id: product.id,
            name: product.name || 'Unnamed Product',
            sku: product.sku || product.batch_number || `SKU-${product.id}`,
            current_stock: product.quantity || 0,
            min_stock: product.min_stock_level || 10,
            value: ((parseFloat(product.price) || 0) * (product.quantity || 0)).toFixed(2),
            status: getInventoryStatus(product)
        }));

        return {
            total_items: productsData.length,
            total_value: totalValue.toFixed(2),
            low_stock_items: lowStockItems,
            out_of_stock_items: outOfStockItems,
            inventory: inventory
        };
    };

    // Low stock data transformation
    const transformLowStockData = (productsData) => {
        if (!productsData || !Array.isArray(productsData)) {
            return generateFallbackData('low-stock');
        }

        const lowStockProducts = productsData.filter(p => isLowStock(p) && p.quantity > 0);

        const products = lowStockProducts.map(product => ({
            id: product.id,
            name: product.name || 'Unnamed Product',
            current_stock: product.quantity || 0,
            min_stock: product.min_stock_level || 10,
            reorder_level: (product.min_stock_level || 10) + 5,
            urgency: getUrgencyLevel(product)
        }));

        return {
            count: lowStockProducts.length,
            products: products
        };
    };

    // Out of stock data transformation
    const transformOutOfStockData = (productsData) => {
        if (!productsData || !Array.isArray(productsData)) {
            return generateFallbackData('out-of-stock');
        }

        const outOfStockProducts = productsData.filter(p => p.quantity === 0);

        const products = outOfStockProducts.map(product => ({
            id: product.id,
            name: product.name || 'Unnamed Product',
            sku: product.sku || product.batch_number || `SKU-${product.id}`,
            last_stock_date: product.last_restock_date || 'N/A',
            days_out_of_stock: calculateDaysOutOfStock(product)
        }));

        return {
            count: outOfStockProducts.length,
            products: products
        };
    };

    // Helper functions
    const isLowStock = (product) => {
        return product.quantity <= (product.min_stock_level || 10);
    };

    const getStockStatus = (product) => {
        if (product.quantity === 0) return "Out of Stock";
        if (isLowStock(product)) return "Low Stock";
        return "In Stock";
    };

    const getInventoryStatus = (product) => {
        if (product.quantity === 0) return "Out of Stock";
        if (isLowStock(product)) return "Low Stock";
        return "Adequate";
    };

    const getUrgencyLevel = (product) => {
        const stockRatio = product.quantity / (product.min_stock_level || 10);
        if (stockRatio <= 0.3) return "High";
        if (stockRatio <= 0.6) return "Medium";
        return "Low";
    };

    const calculateDaysOutOfStock = (product) => {
        // Simple calculation - you might want to use actual dates from your data
        return Math.floor(Math.random() * 30) + 1; // Random 1-30 days for demo
    };

    // Fallback data for demo/demo purposes
    const generateFallbackData = (reportType) => {
        const today = new Date().toISOString().split('T')[0];

        switch (reportType) {
            case "sales":
                return {
                    total_revenue: "0.00",
                    total_orders: 0,
                    average_order_value: "0.00",
                    top_selling_product: "N/A",
                    daily_sales: []
                };
            case "products":
                return {
                    total_products: 0,
                    active_products: 0,
                    out_of_stock: 0,
                    products: []
                };
            case "inventory":
                return {
                    total_items: 0,
                    total_value: "0.00",
                    low_stock_items: 0,
                    out_of_stock_items: 0,
                    inventory: []
                };
            case "low-stock":
                return {
                    count: 0,
                    products: []
                };
            case "out-of-stock":
                return {
                    count: 0,
                    products: []
                };
            default:
                return null;
        }
    };

    useEffect(() => {
        fetchReportData(activeReport);
    }, [activeReport, dateRange]);

    // 📤 Export Report
    const exportReport = (format = "pdf") => {
        if (!reportData) {
            toast.warning("No data available to export");
            return;
        }
        toast.info(`Exporting ${activeReport} report as ${format.toUpperCase()}`);
        // Implement actual export functionality here
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
                            <span className="ml-3 text-gray-600">Loading report data...</span>
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

// 📊 Report Content Components (Keep your existing components, but make them more resilient)
const ReportContent = ({ type, data, dateRange }) => {
    if (!data) return <div className="text-center py-8 text-gray-500">No data available for this report</div>;

    // Ensure data has expected structure
    const safeData = data || {};

    switch (type) {
        case "sales":
            return <SalesReport data={safeData} dateRange={dateRange} />;
        case "products":
            return <ProductsReport data={safeData} />;
        case "inventory":
            return <InventoryReport data={safeData} />;
        case "low-stock":
            return <LowStockReport data={safeData} />;
        case "out-of-stock":
            return <OutOfStockReport data={safeData} />;
        default:
            return <SalesReport data={safeData} dateRange={dateRange} />;
    }
};

// 💰 Sales Report Component (Updated with safe data access)
const SalesReport = ({ data, dateRange }) => {
    const safeData = data || {};

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Sales Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-blue-600 font-bold text-2xl">₦{safeData.total_revenue || "0"}</div>
                    <div className="text-blue-800 font-medium">Total Revenue</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-green-600 font-bold text-2xl">{safeData.total_orders || "0"}</div>
                    <div className="text-green-800 font-medium">Total Orders</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="text-purple-600 font-bold text-2xl">₦{safeData.average_order_value || "0"}</div>
                    <div className="text-purple-800 font-medium">Average Order</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="text-orange-600 font-bold text-2xl">{safeData.top_selling_product || "N/A"}</div>
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
                        {safeData.daily_sales && safeData.daily_sales.length > 0 ? (
                            safeData.daily_sales.map((sale, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.orders}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₦{sale.revenue}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.customers}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                    No sales data available for the selected period
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// 📦 Products Report Component (Updated with safe data access)
const ProductsReport = ({ data }) => {
    const safeData = data || {};

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Products Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-blue-600 font-bold text-2xl">{safeData.total_products || "0"}</div>
                    <div className="text-blue-800 font-medium">Total Products</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-green-600 font-bold text-2xl">{safeData.active_products || "0"}</div>
                    <div className="text-green-800 font-medium">Active Products</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="text-purple-600 font-bold text-2xl">{safeData.out_of_stock || "0"}</div>
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
                        {safeData.products && safeData.products.length > 0 ? (
                            safeData.products.map((product) => (
                                <tr key={product.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {product.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {product.category}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ₦{product.price}
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
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                    No products data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// 📊 Inventory Report Component (Updated with safe data access)
const InventoryReport = ({ data }) => {
    const safeData = data || {};

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Inventory Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-blue-600 font-bold text-2xl">{safeData.total_items || "0"}</div>
                    <div className="text-blue-800 font-medium">Total Items</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-green-600 font-bold text-2xl">₦{safeData.total_value || "0"}</div>
                    <div className="text-green-800 font-medium">Total Value</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="text-yellow-600 font-bold text-2xl">{safeData.low_stock_items || "0"}</div>
                    <div className="text-yellow-800 font-medium">Low Stock Items</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="text-red-600 font-bold text-2xl">{safeData.out_of_stock_items || "0"}</div>
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
                        {safeData.inventory && safeData.inventory.length > 0 ? (
                            safeData.inventory.map((item) => (
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
                                        ₦{item.value}
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
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    No inventory data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ⚠️ Low Stock Report Component (Updated with safe data access)
const LowStockReport = ({ data }) => {
    const safeData = data || {};

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Low Stock Alert Report</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                    <span className="text-2xl mr-3">⚠️</span>
                    <div>
                        <h3 className="font-bold text-yellow-800">Low Stock Warning</h3>
                        <p className="text-yellow-700">
                            {safeData.count || "0"} products are running low and need restocking
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
                        {safeData.products && safeData.products.length > 0 ? (
                            safeData.products.map((product) => (
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
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                    No low stock products found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ❌ Out of Stock Report Component (Updated with safe data access)
const OutOfStockReport = ({ data }) => {
    const safeData = data || {};

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Out of Stock Report</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                    <span className="text-2xl mr-3">❌</span>
                    <div>
                        <h3 className="font-bold text-red-800">Critical Stock Alert</h3>
                        <p className="text-red-700">
                            {safeData.count || "0"} products are completely out of stock
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
                        {safeData.products && safeData.products.length > 0 ? (
                            safeData.products.map((product) => (
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
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                    No out of stock products found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportsDashboard;