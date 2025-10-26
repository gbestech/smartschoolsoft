// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const ReportsDashboard = () => {
//     const [activeTab, setActiveTab] = useState('sales');
//     const [loading, setLoading] = useState(false);
//     const [dateRange, setDateRange] = useState({
//         start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
//         end: new Date().toISOString().split('T')[0]
//     });
//     const [reportType, setReportType] = useState('daily');
//     const [apiStatus, setApiStatus] = useState({});

//     // Sales Report State
//     const [salesData, setSalesData] = useState([]);
//     const [salesSummary, setSalesSummary] = useState({
//         totalSales: 0,
//         totalRevenue: 0,
//         totalOrders: 0,
//         averageOrderValue: 0
//     });

//     // Stock Report State
//     const [stockData, setStockData] = useState([]);
//     const [lowStockThreshold, setLowStockThreshold] = useState(10);

//     // Customer Report State
//     const [customerData, setCustomerData] = useState([]);

//     // Try different API base URLs
//     const API_BASES = [
//         'http://localhost:8000/api',
//         'http://127.0.0.1:8000/api',
//         'http://localhost:8000',
//         'http://127.0.0.1:8000'
//     ];

//     // Test API endpoints
//     const testApiEndpoints = async () => {
//         const status = {};

//         for (const base of API_BASES) {
//             try {
//                 console.log(`Testing API base: ${base}`);
//                 const response = await axios.get(`${base}/`, {
//                     timeout: 5000,
//                     headers: {
//                         'Authorization': `Token ${localStorage.getItem('token')}`
//                     }
//                 });
//                 status[base] = { success: true, data: response.data };
//                 console.log(`✅ ${base} is accessible`);
//             } catch (error) {
//                 status[base] = { success: false, error: error.message };
//                 console.log(`❌ ${base} failed:`, error.message);
//             }
//         }

//         setApiStatus(status);
//         return status;
//     };

//     // Get working API base
//     const getWorkingApiBase = () => {
//         for (const base of API_BASES) {
//             if (apiStatus[base]?.success) {
//                 return base;
//             }
//         }
//         return API_BASES[0]; // Return first one as fallback
//     };

//     // Enhanced API call with retries
//     const apiCall = async (endpoint, options = {}) => {
//         const base = getWorkingApiBase();
//         const url = `${base}${endpoint}`;

//         console.log(`Making API call to: ${url}`);

//         try {
//             const response = await axios({
//                 url,
//                 timeout: 10000,
//                 headers: {
//                     'Authorization': `Token ${localStorage.getItem('token')}`,
//                     'Content-Type': 'application/json',
//                     ...options.headers
//                 },
//                 ...options
//             });

//             console.log(`✅ API call successful:`, response.data);
//             return response;
//         } catch (error) {
//             console.error(`❌ API call failed:`, error);

//             if (error.response) {
//                 // Server responded with error status
//                 console.error('Error response:', error.response.status, error.response.data);
//             } else if (error.request) {
//                 // No response received
//                 console.error('No response received:', error.request);
//             } else {
//                 // Other errors
//                 console.error('Error:', error.message);
//             }

//             throw error;
//         }
//     };

//     // Fetch Sales Report
//     const fetchSalesReport = async () => {
//         setLoading(true);
//         try {
//             // First, test which endpoints are available
//             await testApiEndpoints();

//             // Try different sales endpoints
//             const salesEndpoints = [
//                 '/sales/',
//                 '/reports/sales/',
//                 '/orders/',
//                 '/api/sales/'
//             ];

//             let salesResponse = null;

//             for (const endpoint of salesEndpoints) {
//                 try {
//                     console.log(`Trying sales endpoint: ${endpoint}`);
//                     salesResponse = await apiCall(endpoint, {
//                         params: {
//                             start_date: dateRange.start,
//                             end_date: dateRange.end,
//                             report_type: reportType
//                         }
//                     });

//                     if (salesResponse.data) {
//                         console.log(`✅ Found sales data at ${endpoint}`);
//                         break;
//                     }
//                 } catch (error) {
//                     console.log(`❌ Failed at ${endpoint}:`, error.message);
//                     continue;
//                 }
//             }

//             if (salesResponse && salesResponse.data) {
//                 processSalesData(salesResponse.data);
//             } else {
//                 // Use mock data for demonstration
//                 console.log('Using mock sales data for demonstration');
//                 useMockSalesData();
//             }
//         } catch (error) {
//             console.error('Error fetching sales report:', error);
//             // Use mock data as fallback
//             useMockSalesData();
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Mock data for demonstration
//     const useMockSalesData = () => {
//         const mockSales = [
//             {
//                 id: 1,
//                 product: { name: 'Laptop', selling_price: 999 },
//                 quantity: 2,
//                 total_amount: 1998,
//                 date: new Date().toISOString().split('T')[0],
//                 customer_name: 'John Doe'
//             },
//             {
//                 id: 2,
//                 product: { name: 'Mouse', selling_price: 25 },
//                 quantity: 5,
//                 total_amount: 125,
//                 date: new Date().toISOString().split('T')[0],
//                 customer_name: 'Jane Smith'
//             },
//             {
//                 id: 3,
//                 product: { name: 'Keyboard', selling_price: 75 },
//                 quantity: 3,
//                 total_amount: 225,
//                 date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
//                 customer_name: 'Bob Johnson'
//             }
//         ];

//         processSalesData(mockSales);
//     };

//     // Process sales data
//     const processSalesData = (sales) => {
//         let totalRevenue = 0;
//         let totalProductsSold = 0;
//         const salesByProduct = {};
//         const uniqueOrders = new Set();

//         sales.forEach(sale => {
//             const productName = sale.product?.name || `Product ${sale.product}` || 'Unknown Product';
//             const quantity = sale.quantity || 1;
//             const price = sale.price || sale.total_amount || sale.product?.selling_price || 0;
//             const revenue = quantity * price;
//             const orderId = sale.order_id || sale.id;

//             if (!salesByProduct[productName]) {
//                 salesByProduct[productName] = {
//                     product_name: productName,
//                     quantity_sold: 0,
//                     total_revenue: 0,
//                     date: sale.date || sale.created_at
//                 };
//             }

//             salesByProduct[productName].quantity_sold += quantity;
//             salesByProduct[productName].total_revenue += revenue;

//             totalProductsSold += quantity;
//             totalRevenue += revenue;
//             uniqueOrders.add(orderId);
//         });

//         const salesArray = Object.values(salesByProduct);
//         setSalesData(salesArray);

//         setSalesSummary({
//             totalSales: totalProductsSold,
//             totalRevenue: totalRevenue,
//             totalOrders: uniqueOrders.size,
//             averageOrderValue: uniqueOrders.size > 0 ? totalRevenue / uniqueOrders.size : 0
//         });
//     };

//     // Fetch Stock Report
//     const fetchStockReport = async () => {
//         setLoading(true);
//         try {
//             const stockEndpoints = [
//                 '/products/',
//                 '/inventory/',
//                 '/stock/',
//                 '/api/products/'
//             ];

//             let stockResponse = null;

//             for (const endpoint of stockEndpoints) {
//                 try {
//                     console.log(`Trying stock endpoint: ${endpoint}`);
//                     stockResponse = await apiCall(endpoint);

//                     if (stockResponse.data) {
//                         console.log(`✅ Found stock data at ${endpoint}`);
//                         break;
//                     }
//                 } catch (error) {
//                     console.log(`❌ Failed at ${endpoint}:`, error.message);
//                     continue;
//                 }
//             }

//             if (stockResponse && stockResponse.data) {
//                 const stockStatus = Array.isArray(stockResponse.data)
//                     ? stockResponse.data
//                     : stockResponse.data.results || [stockResponse.data];

//                 const processedStock = stockStatus.map(product => ({
//                     id: product.id || Math.random(),
//                     name: product.name || product.product_name || 'Unknown Product',
//                     quantity: product.quantity || product.stock_quantity || product.stock || 0,
//                     min_stock: product.min_stock || product.minimum_stock || 5,
//                     price: product.price || product.selling_price || product.unit_price || 0,
//                     category: product.category || 'Uncategorized',
//                     stock_status: (product.quantity || 0) === 0 ? 'out_of_stock' :
//                         (product.quantity || 0) <= lowStockThreshold ? 'low_stock' : 'healthy'
//                 }));

//                 setStockData(processedStock);
//             } else {
//                 // Use mock stock data
//                 useMockStockData();
//             }
//         } catch (error) {
//             console.error('Error fetching stock report:', error);
//             useMockStockData();
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Mock stock data
//     const useMockStockData = () => {
//         const mockStock = [
//             { id: 1, name: 'Laptop', quantity: 15, min_stock: 5, price: 999, category: 'Electronics' },
//             { id: 2, name: 'Mouse', quantity: 3, min_stock: 10, price: 25, category: 'Electronics' },
//             { id: 3, name: 'Keyboard', quantity: 0, min_stock: 5, price: 75, category: 'Electronics' },
//             { id: 4, name: 'Monitor', quantity: 8, min_stock: 3, price: 299, category: 'Electronics' },
//             { id: 5, name: 'Desk', quantity: 12, min_stock: 2, price: 199, category: 'Furniture' }
//         ];

//         const processedStock = mockStock.map(product => ({
//             ...product,
//             stock_status: product.quantity === 0 ? 'out_of_stock' :
//                 product.quantity <= lowStockThreshold ? 'low_stock' : 'healthy'
//         }));

//         setStockData(processedStock);
//     };

//     // Fetch Customer Report
//     const fetchCustomerReport = async () => {
//         setLoading(true);
//         try {
//             const customerEndpoints = [
//                 '/customers/',
//                 '/users/',
//                 '/api/customers/'
//             ];

//             let customerResponse = null;

//             for (const endpoint of customerEndpoints) {
//                 try {
//                     console.log(`Trying customer endpoint: ${endpoint}`);
//                     customerResponse = await apiCall(endpoint);

//                     if (customerResponse.data) {
//                         console.log(`✅ Found customer data at ${endpoint}`);
//                         break;
//                     }
//                 } catch (error) {
//                     console.log(`❌ Failed at ${endpoint}:`, error.message);
//                     continue;
//                 }
//             }

//             if (customerResponse && customerResponse.data) {
//                 const customers = Array.isArray(customerResponse.data)
//                     ? customerResponse.data
//                     : customerResponse.data.results || [customerResponse.data];

//                 // Try to get sales data for customer analytics
//                 try {
//                     const salesResponse = await apiCall('/sales/');
//                     if (salesResponse.data) {
//                         processCustomerData(customers, salesResponse.data);
//                     } else {
//                         processCustomerData(customers, []);
//                     }
//                 } catch (error) {
//                     processCustomerData(customers, []);
//                 }
//             } else {
//                 // Use mock customer data
//                 useMockCustomerData();
//             }
//         } catch (error) {
//             console.error('Error fetching customer report:', error);
//             useMockCustomerData();
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Mock customer data
//     const useMockCustomerData = () => {
//         const mockCustomers = [
//             {
//                 id: 1,
//                 name: 'John Doe',
//                 email: 'john@example.com',
//                 phone: '+1234567890',
//                 total_orders: 5,
//                 total_spent: 2547,
//                 last_order: new Date().toISOString().split('T')[0]
//             },
//             {
//                 id: 2,
//                 name: 'Jane Smith',
//                 email: 'jane@example.com',
//                 phone: '+1234567891',
//                 total_orders: 3,
//                 total_spent: 897,
//                 last_order: new Date(Date.now() - 86400000).toISOString().split('T')[0]
//             },
//             {
//                 id: 3,
//                 name: 'Bob Johnson',
//                 email: 'bob@example.com',
//                 phone: '+1234567892',
//                 total_orders: 8,
//                 total_spent: 4215,
//                 last_order: new Date().toISOString().split('T')[0]
//             }
//         ];

//         setCustomerData(mockCustomers);
//     };

//     // Process customer data
//     const processCustomerData = (customers, sales) => {
//         const customerAnalytics = customers.map(customer => {
//             const customerSales = sales.filter(sale =>
//                 sale.customer === customer.id ||
//                 sale.customer_id === customer.id ||
//                 sale.customer_name === customer.name
//             );

//             const totalOrders = customer.total_orders || customerSales.length;
//             const totalSpent = customer.total_spent || customerSales.reduce((sum, sale) =>
//                 sum + (sale.total_amount || sale.quantity * sale.price || 0), 0
//             );

//             return {
//                 customer_id: customer.id,
//                 customer_name: customer.name || customer.customer_name || `Customer ${customer.id}`,
//                 email: customer.email || 'N/A',
//                 phone: customer.phone || 'N/A',
//                 total_orders: totalOrders,
//                 total_spent: totalSpent,
//                 last_order: customer.last_order || (customerSales.length > 0
//                     ? new Date(Math.max(...customerSales.map(s => new Date(s.date || s.created_at)))).toISOString().split('T')[0]
//                     : 'No orders'),
//                 average_order_value: totalOrders > 0 ? totalSpent / totalOrders : 0
//             };
//         });

//         customerAnalytics.sort((a, b) => b.total_spent - a.total_spent);
//         setCustomerData(customerAnalytics);
//     };

//     useEffect(() => {
//         // Test API endpoints on component mount
//         testApiEndpoints();
//     }, []);

//     useEffect(() => {
//         if (Object.keys(apiStatus).length > 0) {
//             switch (activeTab) {
//                 case 'sales':
//                     fetchSalesReport();
//                     break;
//                 case 'stock':
//                     fetchStockReport();
//                     break;
//                 case 'customers':
//                     fetchCustomerReport();
//                     break;
//                 default:
//                     fetchSalesReport();
//             }
//         }
//     }, [activeTab, dateRange, reportType, lowStockThreshold, apiStatus]);

//     // Rest of your component JSX remains the same...
//     // (Keep all the JSX from the previous version)

//     return (
//         <div className="min-h-screen bg-gray-50 p-6">
//             <div className="max-w-7xl mx-auto">
//                 {/* Debug Info */}
//                 <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                     <h3 className="text-sm font-medium text-yellow-800">API Status</h3>
//                     <div className="mt-2 text-xs text-yellow-700">
//                         {Object.entries(apiStatus).map(([base, status]) => (
//                             <div key={base}>
//                                 {base}: {status.success ? '✅ Connected' : '❌ Failed'}
//                             </div>
//                         ))}
//                     </div>
//                     <button
//                         onClick={testApiEndpoints}
//                         className="mt-2 px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
//                     >
//                         Test APIs Again
//                     </button>
//                 </div>

//                 {/* Your existing JSX content */}
//                 {/* ... */}
//             </div>
//         </div>
//     );
// };

// export default ReportsDashboard;
import React from 'react';

const ActivityLogs = () => {
  return (
    <div>
      activeTab
    </div>
  );
}

export default ActivityLogs;
