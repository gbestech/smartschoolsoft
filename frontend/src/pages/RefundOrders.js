// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { toast, ToastContainer } from 'react-toastify';
// import RefundRequestForm from './RefundRequestForm';
// import RefundRequestList from './RefundRequestList';
// import 'react-toastify/dist/ReactToastify.css';

// const RefundOrders = () => {
//     // Existing states from your original Orders component
//     const [products, setProducts] = useState([]);
//     const [sales, setSales] = useState([]);
//     const [selectedId, setSelectedId] = useState("");
//     const [cart, setCart] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [salesLoading, setSalesLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [salesError, setSalesError] = useState(null);
//     const [showModal, setShowModal] = useState(false);
//     const [viewModal, setViewModal] = useState(null);
//     const [updateBalanceModal, setUpdateBalanceModal] = useState(null);
//     const [newPayment, setNewPayment] = useState("");

//     // Customer Info states
//     const [customerName, setCustomerName] = useState("");
//     const [address, setAddress] = useState("");
//     const [phone, setPhone] = useState("");
//     const [gender, setGender] = useState("");
//     const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));

//     // Payment Info states
//     const [amountPaid, setAmountPaid] = useState("");
//     const [paymentMethod, setPaymentMethod] = useState("cash");
//     const [receiptFile, setReceiptFile] = useState(null);
//     const [receiptPreview, setReceiptPreview] = useState(null);
//     const [page, setPage] = useState(1);
//     const perPage = 10;

//     // Refund states (NEW)
//     const [selectedSaleForRefund, setSelectedSaleForRefund] = useState(null);
//     const [showRefundRequests, setShowRefundRequests] = useState(false);
//     const [refundType, setRefundType] = useState('full'); // 'full' or 'partial'
//     const [refundItems, setRefundItems] = useState([]);
//     const [selectedRefundItems, setSelectedRefundItems] = useState([]);
//     const [refundPage, setRefundPage] = useState(1);
//     const refundPerPage = 10;

//     // Fetch functions
//     const fetchProducts = async () => {
//         try {
//             setLoading(true);
//             const token = localStorage.getItem('token');
//             const response = await axios.get("http://127.0.0.1:8000/api/products/", {
//                 headers: {
//                     'Authorization': `Token ${token}`
//                 }
//             });
//             setProducts(response.data);
//         } catch (err) {
//             console.error("Error fetching products:", err);
//             setError(`Failed to load products. ${err.response?.data?.detail || err.message}`);
//             toast.error(`Failed to load products. ${err.response?.data?.detail || err.message}`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchSales = async () => {
//         try {
//             setSalesLoading(true);
//             const token = localStorage.getItem('token');
//             const response = await axios.get("http://127.0.0.1:8000/api/sales/sales/", {
//                 headers: {
//                     'Authorization': `Token ${token}`
//                 }
//             });
//             setSales(response.data);
//         } catch (err) {
//             console.error("Error fetching sales:", err);
//             setSalesError(`Failed to load sales list. ${err.response?.data?.detail || err.message}`);
//             toast.error(`Failed to load sales list. ${err.response?.data?.detail || err.message}`);
//         } finally {
//             setSalesLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchProducts();
//         fetchSales();
//     }, []);

//     // Delete sale function
//     const handleDelete = async (id) => {
//         if (!window.confirm("Are you sure you want to delete this sale? This action cannot be undone.")) return;

//         try {
//             const token = localStorage.getItem('token');
//             await axios.delete(`http://127.0.0.1:8000/api/sales/sales/${id}/`, {
//                 headers: {
//                     'Authorization': `Token ${token}`
//                 }
//             });

//             toast.success("Sale deleted successfully!");
//             fetchSales(); // Refresh the sales list
//         } catch (err) {
//             console.error("Delete error:", err);
//             toast.error(`❌ Failed to delete sale: ${err.response?.data?.detail || err.message}`);
//         }
//     };

//     // Update balance function
//     const handleUpdateBalance = async () => {
//         if (!newPayment || Number(newPayment) <= 0) {
//             toast.error("Please enter a valid payment amount.");
//             return;
//         }

//         if (Number(newPayment) > Number(updateBalanceModal.balance)) {
//             toast.error(`❌ Payment (₦${Number(newPayment).toLocaleString()}) exceeds balance (₦${Number(updateBalanceModal.balance).toLocaleString()})`);
//             return;
//         }

//         try {
//             const token = localStorage.getItem('token');
//             const updatedAmountPaid = Number(updateBalanceModal.amount_paid) + Number(newPayment);
//             const updatedBalance = Math.max(Number(updateBalanceModal.total) - updatedAmountPaid, 0);

//             await axios.patch(
//                 `http://127.0.0.1:8000/api/sales/sales/${updateBalanceModal.id}/`,
//                 {
//                     amount_paid: updatedAmountPaid,
//                     balance: updatedBalance
//                 },
//                 {
//                     headers: {
//                         'Authorization': `Token ${token}`,
//                         'Content-Type': 'application/json'
//                     }
//                 }
//             );

//             let successMessage = "";
//             if (updatedBalance === 0) {
//                 successMessage = `💰 ${updateBalanceModal.customer_name} paid ₦${Number(newPayment).toLocaleString()}. Balance fully settled! 🎉`;
//             } else {
//                 successMessage = `💰 ${updateBalanceModal.customer_name} paid ₦${Number(newPayment).toLocaleString()}. New balance: ₦${updatedBalance.toLocaleString()}`;
//             }

//             toast.success(successMessage);
//             setUpdateBalanceModal(null);
//             setNewPayment("");
//             await fetchSales();

//         } catch (err) {
//             console.error("Update balance error:", err);
//             toast.error(`❌ Failed to update balance: ${err.response?.data?.detail || err.message}`);
//         }
//     };

//     // Refund handler functions (NEW)
//     const handleRequestRefund = (sale) => {
//         // Check if sale is eligible for refund
//         if (sale.is_refunded) {
//             toast.error("This sale has already been fully refunded.");
//             return;
//         }

//         if (sale.amount_paid <= 0) {
//             toast.error("This sale has no payment to refund.");
//             return;
//         }

//         setSelectedSaleForRefund(sale);
//         setRefundType('full');
//         setRefundItems(sale.items || []);
//         setSelectedRefundItems([]);
//     };

//     const handleRefundTypeChange = (type) => {
//         setRefundType(type);
//         if (type === 'full') {
//             setSelectedRefundItems([]);
//         }
//     };

//     const handleRefundItemSelect = (item, isSelected) => {
//         if (isSelected) {
//             setSelectedRefundItems(prev => [...prev, item]);
//         } else {
//             setSelectedRefundItems(prev => prev.filter(i =>
//                 i.product !== item.product && i.quantity !== item.quantity
//             ));
//         }
//     };

//     const calculateRefundAmount = () => {
//         if (refundType === 'full') {
//             return selectedSaleForRefund?.amount_paid || 0;
//         } else {
//             return selectedRefundItems.reduce((total, item) => {
//                 const price = item.negotiated_price || item.price;
//                 const quantity = item.qty || item.quantity || 1;
//                 return total + (price * quantity);
//             }, 0)
//         }
//     };

//     const handleRefundSuccess = () => {
//         setSelectedSaleForRefund(null);
//         setRefundType('full');
//         setRefundItems([]);
//         setSelectedRefundItems([]);
//         toast.success("Refund request submitted successfully!");
//         fetchSales();
//     };

//     // View modal handler
//     const handleViewModal = (sale) => {
//         setViewModal(sale);
//     };

//     const totalPages = Math.ceil(sales.length / perPage);
//     const currentSales = sales.slice((page - 1) * perPage, page * perPage);

//     const refundAmount = calculateRefundAmount();

//     if (loading) {
//         return (
//             <div className="p-6 w-full">
//                 <div className="flex justify-center items-center h-64">
//                     <div className="text-lg text-gray-600">Loading products...</div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="p-6 w-full">
//             <ToastContainer
//                 position="top-right"
//                 autoClose={3000}
//                 hideProgressBar={false}
//                 newestOnTop={false}
//                 closeOnClick
//                 rtl={false}
//                 pauseOnFocusLoss
//                 draggable
//                 pauseOnHover
//                 theme="light"
//             />

//             <div className="mb-8">
//                 <h1 className="text-3xl font-bold text-gray-800">Sales Management</h1>

//                 <p className="text-gray-600 mt-2">Process sales and manage customer orders</p>
//             </div>

//             {/* Your existing Sales Form Section */}
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
//                 <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Sale</h2>

//                 {/* Your existing sales form JSX goes here */}
//                 <div className="text-center py-8 text-gray-500">
//                     <p>Sales form component would go here</p>
//                 </div>
//             </div>

//             {/* Your existing Sales History Section */}
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
//                 <div className="flex justify-between items-center mb-6">
//                     <h2 className="text-2xl font-bold text-gray-800">Sales History</h2>
//                     <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
//                         {sales.length} total sales
//                     </span>
//                 </div>

//                 {salesError && (
//                     <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
//                         <div className="flex items-center">
//                             <span className="text-red-500 mr-3">⚠️</span>
//                             <span className="text-red-700">{salesError}</span>
//                         </div>
//                     </div>
//                 )}

//                 {salesLoading ? (
//                     <div className="flex justify-center items-center h-32">
//                         <div className="text-gray-600">Loading sales history...</div>
//                     </div>
//                 ) : (
//                     <>
//                         <div className="overflow-x-auto">
//                             <table className="w-full">
//                                 <thead className="bg-gray-50">
//                                     <tr>
//                                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                             Customer
//                                         </th>
//                                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                             Date
//                                         </th>
//                                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                             Total
//                                         </th>
//                                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                             Paid
//                                         </th>
//                                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                             Balance
//                                         </th>
//                                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                             Status
//                                         </th>
//                                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                             Actions
//                                         </th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-gray-200">
//                                     {currentSales.map((sale) => (
//                                         <tr key={sale.id} className={`hover:bg-gray-50 ${sale.is_refunded ? 'bg-red-50' : sale.is_partially_refunded ? 'bg-orange-50' : ''}`}>
//                                             <td className="px-4 py-3">
//                                                 <div className="font-medium text-gray-900">{sale.customer_name}</div>
//                                                 <div className="text-sm text-gray-500">{sale.phone}</div>
//                                             </td>
//                                             <td className="px-4 py-3 text-gray-900">
//                                                 {new Date(sale.date).toLocaleDateString()}
//                                             </td>
//                                             <td className="px-4 py-3 font-medium text-gray-900">
//                                                 ₦{Number(sale.total).toLocaleString()}
//                                             </td>
//                                             <td className="px-4 py-3">
//                                                 <span className="text-green-600 font-medium">
//                                                     ₦{Number(sale.amount_paid).toLocaleString()}
//                                                 </span>
//                                             </td>
//                                             <td className="px-4 py-3">
//                                                 <span className={`font-medium ${sale.balance > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
//                                                     ₦{Number(sale.balance).toLocaleString()}
//                                                 </span>
//                                             </td>
//                                             <td className="px-4 py-3">
//                                                 {sale.is_refunded ? (
//                                                     <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
//                                                         Refunded
//                                                     </span>
//                                                 ) : sale.is_partially_refunded ? (
//                                                     <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
//                                                         Partially Refunded
//                                                     </span>
//                                                 ) : (
//                                                     <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
//                                                         Completed
//                                                     </span>
//                                                 )}
//                                             </td>
//                                             <td className="px-4 py-3">
//                                                 <div className="flex flex-col space-y-1">
//                                                     <button
//                                                         onClick={() => handleViewModal(sale)}
//                                                         className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors text-xs"
//                                                     >
//                                                         View
//                                                     </button>
//                                                     {sale.balance > 0 && !sale.is_refunded && (
//                                                         <button
//                                                             onClick={() => setUpdateBalanceModal(sale)}
//                                                             className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded transition-colors text-xs"
//                                                         >
//                                                             Update Balance
//                                                         </button>
//                                                     )}
//                                                     {/* NEW: Refund Request Button */}
//                                                     {!sale.is_refunded && sale.amount_paid > 0 && (
//                                                         <button
//                                                             onClick={() => handleRequestRefund(sale)}
//                                                             className="text-purple-600 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded transition-colors text-xs"
//                                                         >
//                                                             Request Refund
//                                                         </button>
//                                                     )}

//                                                     <button
//                                                         onClick={() => handleDelete(sale.id)}
//                                                         className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded transition-colors text-xs"
//                                                     >
//                                                         Delete
//                                                     </button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>

//                         {/* Pagination for Sales */}
//                         {totalPages > 1 && (
//                             <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
//                                 <div className="text-sm text-gray-500">
//                                     Showing {Math.min(currentSales.length, perPage)} of {sales.length} sales
//                                 </div>
//                                 <div className="flex gap-2">
//                                     <button
//                                         disabled={page === 1}
//                                         onClick={() => setPage(page - 1)}
//                                         className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                                     >
//                                         Previous
//                                     </button>
//                                     <span className="px-3 py-1 bg-blue-500 text-white rounded-lg">
//                                         {page}
//                                     </span>
//                                     <button
//                                         disabled={page === totalPages}
//                                         onClick={() => setPage(page + 1)}
//                                         className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                                     >
//                                         Next
//                                     </button>
//                                 </div>
//                             </div>
//                         )}

//                         {sales.length === 0 && !salesLoading && (
//                             <div className="text-center py-8">
//                                 <div className="text-4xl mb-4">📊</div>
//                                 <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sales Yet</h3>
//                                 <p className="text-gray-500">Start by creating your first sale using the form above.</p>
//                             </div>
//                         )}
//                     </>
//                 )}
//             </div>

//             {/* NEW: Refund Management Section */}
//             <div className="mt-8">
//                 <div className="flex justify-between items-center mb-6">
//                     <h2 className="text-2xl font-bold text-gray-800">Refund Management</h2>
//                     <button
//                         onClick={() => setShowRefundRequests(!showRefundRequests)}
//                         className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
//                     >
//                         {showRefundRequests ? 'Hide Refund Requests' : 'View Refund Requests'}
//                     </button>
//                 </div>

//                 {selectedSaleForRefund && (
//                     <div className="mb-8">
//                         <div className="bg-white rounded-lg border border-gray-200 p-6">
//                             <h2 className="text-2xl font-bold text-gray-800 mb-6">Request Refund</h2>

//                             {/* Sale Information */}
//                             <div className="mb-6 p-4 bg-gray-50 rounded-lg">
//                                 <h3 className="font-semibold text-gray-700 mb-3">Sale Information</h3>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                                     <div>
//                                         <span className="text-gray-600">Customer:</span>
//                                         <p className="font-medium">{selectedSaleForRefund.customer_name}</p>
//                                     </div>
//                                     <div>
//                                         <span className="text-gray-600">Sale Date:</span>
//                                         <p className="font-medium">{new Date(selectedSaleForRefund.date).toLocaleDateString()}</p>
//                                     </div>
//                                     <div>
//                                         <span className="text-gray-600">Total Amount:</span>
//                                         <p className="font-medium">₦{Number(selectedSaleForRefund.total).toLocaleString()}</p>
//                                     </div>
//                                     <div>
//                                         <span className="text-gray-600">Amount Paid:</span>
//                                         <p className="font-medium text-green-600">₦{Number(selectedSaleForRefund.amount_paid).toLocaleString()}</p>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Refund Type Selection */}
//                             <div className="mb-6">
//                                 <label className="block text-sm font-medium text-gray-700 mb-3">
//                                     Refund Type
//                                 </label>
//                                 <div className="flex space-x-4">
//                                     <label className="flex items-center">
//                                         <input
//                                             type="radio"
//                                             name="refundType"
//                                             value="full"
//                                             checked={refundType === 'full'}
//                                             onChange={(e) => handleRefundTypeChange(e.target.value)}
//                                             className="mr-2"
//                                         />
//                                         <span>Full Refund (₦{Number(selectedSaleForRefund.amount_paid).toLocaleString()})</span>
//                                     </label>
//                                     <label className="flex items-center">
//                                         <input
//                                             type="radio"
//                                             name="refundType"
//                                             value="partial"
//                                             checked={refundType === 'partial'}
//                                             onChange={(e) => handleRefundTypeChange(e.target.value)}
//                                             className="mr-2"
//                                         />
//                                         <span>Partial Refund</span>
//                                     </label>
//                                 </div>
//                             </div>

//                             {/* Partial Refund Item Selection */}
//                             {refundType === 'partial' && refundItems.length > 0 && (
//                                 <div className="mb-6">
//                                     <label className="block text-sm font-medium text-gray-700 mb-3">
//                                         Select Items to Refund
//                                     </label>
//                                     <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
//                                         {refundItems.map((item, index) => {
//                                             const productName = products.find(p => p.id === item.product)?.name || `Product ${item.product}`;
//                                             const quantity = item.qty || item.quantity || 1;
//                                             const price = item.negotiated_price || item.price;
//                                             const totalPrice = price * quantity;
//                                             const isSelected = selectedRefundItems.some(selected =>
//                                                 selected.product === item.product && selected.quantity === quantity
//                                             );

//                                             return (
//                                                 <label key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
//                                                     <div className="flex items-center space-x-3">
//                                                         <input
//                                                             type="checkbox"
//                                                             checked={isSelected}
//                                                             onChange={(e) => handleRefundItemSelect(item, e.target.checked)}
//                                                             className="rounded"
//                                                         />
//                                                         <div>
//                                                             <div className="font-medium text-sm">{productName}</div>
//                                                             <div className="text-xs text-gray-500">
//                                                                 {quantity} × ₦{Number(price).toLocaleString()} = ₦{Number(totalPrice).toLocaleString()}
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                     <div className="text-sm font-medium">
//                                                         ₦{Number(totalPrice).toLocaleString()}
//                                                     </div>
//                                                 </label>
//                                             );
//                                         })}
//                                     </div>
//                                     {selectedRefundItems.length > 0 && (
//                                         <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
//                                             <div className="flex justify-between text-sm">
//                                                 <span>Selected Items Total:</span>
//                                                 <span className="font-bold">₦{Number(refundAmount).toLocaleString()}</span>
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}

//                             {/* Refund Amount Summary */}
//                             <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                                 <div className="flex justify-between items-center">
//                                     <span className="text-lg font-semibold text-gray-800">Refund Amount:</span>
//                                     <span className="text-2xl font-bold text-green-600">
//                                         ₦{Number(refundAmount).toLocaleString()}
//                                     </span>
//                                 </div>
//                                 {refundType === 'partial' && selectedRefundItems.length === 0 && (
//                                     <p className="text-sm text-yellow-700 mt-2">
//                                         Please select at least one item for partial refund
//                                     </p>
//                                 )}
//                             </div>

//                             {/* Action Buttons */}
//                             <div className="flex justify-end space-x-3">
//                                 <button
//                                     onClick={() => {
//                                         setSelectedSaleForRefund(null);
//                                         setRefundType('full');
//                                         setRefundItems([]);
//                                         setSelectedRefundItems([]);
//                                     }}
//                                     className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={() => {
//                                         if (refundType === 'partial' && selectedRefundItems.length === 0) {
//                                             toast.error("Please select items for partial refund");
//                                             return;
//                                         }
//                                         handleRefundSuccess();
//                                     }}
//                                     className="px-6 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
//                                 >
//                                     Submit Refund Request
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {showRefundRequests && (
//                     <RefundRequestList
//                         page={refundPage}
//                         perPage={refundPerPage}
//                         onPageChange={setRefundPage}
//                     />
//                 )}
//             </div>

//             {/* Update Balance Modal */}
//             {updateBalanceModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
//                         <div className="p-6 border-b border-gray-200">
//                             <h3 className="text-xl font-semibold text-gray-800">Update Balance</h3>
//                         </div>
//                         <div className="p-6 space-y-4">
//                             <div className="bg-gray-50 p-4 rounded-lg">
//                                 <div className="flex justify-between mb-2">
//                                     <span className="text-gray-600">Customer:</span>
//                                     <span className="font-medium">{updateBalanceModal.customer_name}</span>
//                                 </div>
//                                 <div className="flex justify-between mb-2">
//                                     <span className="text-gray-600">Total Amount:</span>
//                                     <span className="font-medium">₦{Number(updateBalanceModal.total).toLocaleString()}</span>
//                                 </div>
//                                 <div className="flex justify-between mb-2">
//                                     <span className="text-gray-600">Already Paid:</span>
//                                     <span className="text-green-600 font-medium">₦{Number(updateBalanceModal.amount_paid).toLocaleString()}</span>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <span className="text-gray-600">Current Balance:</span>
//                                     <span className="text-orange-600 font-bold">₦{Number(updateBalanceModal.balance).toLocaleString()}</span>
//                                 </div>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Additional Payment Amount
//                                 </label>
//                                 <input
//                                     type="number"
//                                     value={newPayment}
//                                     onChange={(e) => setNewPayment(e.target.value)}
//                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                                     placeholder="Enter payment amount"
//                                     min="0"
//                                     max={updateBalanceModal.balance}
//                                 />
//                             </div>
//                             {newPayment && (
//                                 <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                                     <div className="flex justify-between">
//                                         <span className="text-green-800 font-medium">New Balance:</span>
//                                         <span className="text-green-800 font-bold">
//                                             ₦{Math.max(Number(updateBalanceModal.balance) - Number(newPayment), 0).toLocaleString()}
//                                         </span>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                         <div className="flex gap-3 p-6 border-t border-gray-200">
//                             <button
//                                 onClick={() => {
//                                     setUpdateBalanceModal(null);
//                                     setNewPayment("");
//                                 }}
//                                 className="flex-1 bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleUpdateBalance}
//                                 className="flex-1 bg-green-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
//                             >
//                                 Update Balance
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* View Modal */}
//             {viewModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl">
//                         <div className="p-6 border-b border-gray-200">
//                             <h3 className="text-xl font-semibold text-gray-800">Sale Details</h3>
//                         </div>
//                         <div className="p-6">
//                             <div className="grid grid-cols-2 gap-4 mb-4">
//                                 <div>
//                                     <span className="text-sm text-gray-600">Customer:</span>
//                                     <p className="font-medium">{viewModal.customer_name}</p>
//                                 </div>
//                                 <div>
//                                     <span className="text-sm text-gray-600">Date:</span>
//                                     <p className="font-medium">{viewModal.date}</p>
//                                 </div>
//                                 <div>
//                                     <span className="text-sm text-gray-600">Phone:</span>
//                                     <p className="font-medium">{viewModal.phone}</p>
//                                 </div>
//                                 <div>
//                                     <span className="text-sm text-gray-600">Payment Method:</span>
//                                     <p className="font-medium">{viewModal.payment_method || 'Cash'}</p>
//                                 </div>
//                             </div>
//                             <div className="border-t pt-4">
//                                 <div className="flex justify-between mb-2">
//                                     <span>Total Amount:</span>
//                                     <span className="font-semibold">₦{Number(viewModal.total).toLocaleString()}</span>
//                                 </div>
//                                 <div className="flex justify-between mb-2">
//                                     <span>Amount Paid:</span>
//                                     <span className="text-green-600 font-semibold">₦{Number(viewModal.amount_paid).toLocaleString()}</span>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <span>Balance:</span>
//                                     <span className={`font-semibold ${viewModal.balance > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
//                                         ₦{Number(viewModal.balance).toLocaleString()}
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="flex gap-3 p-6 border-t border-gray-200">
//                             <button
//                                 onClick={() => setViewModal(null)}
//                                 className="flex-1 bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
//                             >
//                                 Close
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default RefundOrders;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import RefundRequestList from './RefundRequestList';
import 'react-toastify/dist/ReactToastify.css';

const RefundOrders = () => {
    // Existing states from your original Orders component
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [selectedId, setSelectedId] = useState("");
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [salesLoading, setSalesLoading] = useState(true);
    const [error, setError] = useState(null);
    const [salesError, setSalesError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [viewModal, setViewModal] = useState(null);
    const [updateBalanceModal, setUpdateBalanceModal] = useState(null);
    const [newPayment, setNewPayment] = useState("");

    // Customer Info states
    const [customerName, setCustomerName] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("");
    const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));

    // Payment Info states
    const [amountPaid, setAmountPaid] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState(null);
    const [page, setPage] = useState(1);
    const perPage = 10;

    // Refund states (NEW)
    const [selectedSaleForRefund, setSelectedSaleForRefund] = useState(null);
    const [showRefundRequests, setShowRefundRequests] = useState(false);
    const [refundType, setRefundType] = useState('full'); // 'full' or 'partial'
    const [refundItems, setRefundItems] = useState([]);
    const [selectedRefundItems, setSelectedRefundItems] = useState([]);
    const [refundPage, setRefundPage] = useState(1);
    const [refundReason, setRefundReason] = useState('');
    const [submittingRefund, setSubmittingRefund] = useState(false);
    const refundPerPage = 10;

    // Refund reasons
    const refundReasons = [
        { value: 'defective', label: 'Defective Product' },
        { value: 'wrong_item', label: 'Wrong Item Received' },
        { value: 'not_as_described', label: 'Not as Described' },
        { value: 'customer_change_mind', label: 'Changed Mind' },
        { value: 'late_delivery', label: 'Late Delivery' },
        { value: 'damaged', label: 'Damaged During Delivery' },
        { value: 'other', label: 'Other' },
    ];

    // Fetch functions
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get("http://127.0.0.1:8000/api/products/", {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            setProducts(response.data);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError(`Failed to load products. ${err.response?.data?.detail || err.message}`);
            toast.error(`Failed to load products. ${err.response?.data?.detail || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchSales = async () => {
        try {
            setSalesLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get("http://127.0.0.1:8000/api/sales/sales/", {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            setSales(response.data);
        } catch (err) {
            console.error("Error fetching sales:", err);
            setSalesError(`Failed to load sales list. ${err.response?.data?.detail || err.message}`);
            toast.error(`Failed to load sales list. ${err.response?.data?.detail || err.message}`);
        } finally {
            setSalesLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchSales();
    }, []);

    // Delete sale function
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this sale? This action cannot be undone.")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://127.0.0.1:8000/api/sales/sales/${id}/`, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            toast.success("Sale deleted successfully!");
            fetchSales(); // Refresh the sales list
        } catch (err) {
            console.error("Delete error:", err);
            toast.error(`❌ Failed to delete sale: ${err.response?.data?.detail || err.message}`);
        }
    };

    // Update balance function
    const handleUpdateBalance = async () => {
        if (!newPayment || Number(newPayment) <= 0) {
            toast.error("Please enter a valid payment amount.");
            return;
        }

        if (Number(newPayment) > Number(updateBalanceModal.balance)) {
            toast.error(`❌ Payment (₦${Number(newPayment).toLocaleString()}) exceeds balance (₦${Number(updateBalanceModal.balance).toLocaleString()})`);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const updatedAmountPaid = Number(updateBalanceModal.amount_paid) + Number(newPayment);
            const updatedBalance = Math.max(Number(updateBalanceModal.total) - updatedAmountPaid, 0);

            await axios.patch(
                `http://127.0.0.1:8000/api/sales/sales/${updateBalanceModal.id}/`,
                {
                    amount_paid: updatedAmountPaid,
                    balance: updatedBalance
                },
                {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            let successMessage = "";
            if (updatedBalance === 0) {
                successMessage = `💰 ${updateBalanceModal.customer_name} paid ₦${Number(newPayment).toLocaleString()}. Balance fully settled! 🎉`;
            } else {
                successMessage = `💰 ${updateBalanceModal.customer_name} paid ₦${Number(newPayment).toLocaleString()}. New balance: ₦${updatedBalance.toLocaleString()}`;
            }

            toast.success(successMessage);
            setUpdateBalanceModal(null);
            setNewPayment("");
            await fetchSales();

        } catch (err) {
            console.error("Update balance error:", err);
            toast.error(`❌ Failed to update balance: ${err.response?.data?.detail || err.message}`);
        }
    };

    // Refund handler functions (NEW)
    const handleRequestRefund = (sale) => {
        // Check if sale is eligible for refund
        if (sale.is_refunded) {
            toast.error("This sale has already been fully refunded.");
            return;
        }

        if (sale.amount_paid <= 0) {
            toast.error("This sale has no payment to refund.");
            return;
        }

        setSelectedSaleForRefund(sale);
        setRefundType('full');
        setRefundItems(sale.items || []);
        setSelectedRefundItems([]);
        setRefundReason('');
    };

    const handleRefundTypeChange = (type) => {
        setRefundType(type);
        if (type === 'full') {
            setSelectedRefundItems([]);
        }
    };

    const handleRefundItemSelect = (item, isSelected) => {
        if (isSelected) {
            setSelectedRefundItems(prev => [...prev, item]);
        } else {
            setSelectedRefundItems(prev => prev.filter(i =>
                i.product !== item.product && i.quantity !== item.quantity
            ));
        }
    };

    const calculateRefundAmount = () => {
        if (refundType === 'full') {
            return selectedSaleForRefund?.amount_paid || 0;
        } else {
            return selectedRefundItems.reduce((total, item) => {
                const price = item.negotiated_price || item.price;
                const quantity = item.qty || item.quantity || 1;
                return total + (price * quantity);
            }, 0);
        }
    };

    const handleRefundSuccess = async () => {
        if (!selectedSaleForRefund) return;

        // Validation
        if (!refundReason) {
            toast.error("Please select a refund reason.");
            return;
        }

        if (refundType === 'partial' && selectedRefundItems.length === 0) {
            toast.error("Please select items for partial refund");
            return;
        }

        setSubmittingRefund(true);

        try {
            const token = localStorage.getItem('token');

            // Prepare refund data
            const refundData = {
                sale: selectedSaleForRefund.id,
                reason: refundReason,
                requested_amount: parseFloat(calculateRefundAmount()),
                is_partial: refundType === 'partial',
            };

            // Add refund items for partial refunds
            if (refundType === 'partial' && selectedRefundItems.length > 0) {
                refundData.refunded_items = selectedRefundItems.map(item => ({
                    sale_item: item.id,
                    quantity: item.qty || item.quantity || 1
                }));
            }

            console.log('Submitting refund data:', refundData);

            // Make API call to create refund
            const response = await axios.post('http://127.0.0.1:8000/api/refund-requests/', refundData, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Refund created successfully:', response.data);

            // Reset form
            setSelectedSaleForRefund(null);
            setRefundType('full');
            setRefundItems([]);
            setSelectedRefundItems([]);
            setRefundReason('');

            toast.success("Refund request submitted successfully!");
            fetchSales(); // Refresh sales data

        } catch (error) {
            console.error("Refund submission error:", error);
            console.error("Error response:", error.response);

            let errorMessage = "Failed to submit refund request";
            if (error.response?.data) {
                if (typeof error.response.data === 'object') {
                    const errors = [];
                    for (const [key, value] of Object.entries(error.response.data)) {
                        if (Array.isArray(value)) {
                            errors.push(...value);
                        } else {
                            errors.push(value);
                        }
                    }
                    errorMessage = errors.join(', ');
                } else {
                    errorMessage = error.response.data;
                }
            }
            toast.error(errorMessage);
        } finally {
            setSubmittingRefund(false);
        }
    };

    // View modal handler
    const handleViewModal = (sale) => {
        setViewModal(sale);
    };

    const totalPages = Math.ceil(sales.length / perPage);
    const currentSales = sales.slice((page - 1) * perPage, page * perPage);

    const refundAmount = calculateRefundAmount();

    if (loading) {
        return (
            <div className="p-6 w-full">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-gray-600">Loading products...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 w-full">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Sales Management</h1>
                <p className="text-gray-600 mt-2">Process sales and manage customer orders</p>
            </div>

            {/* Your existing Sales Form Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Sale</h2>
                {/* Your existing sales form JSX goes here */}
                <div className="text-center py-8 text-gray-500">
                    <p>Sales form component would go here</p>
                </div>
            </div>

            {/* Your existing Sales History Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Sales History</h2>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                        {sales.length} total sales
                    </span>
                </div>

                {salesError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                            <span className="text-red-500 mr-3">⚠️</span>
                            <span className="text-red-700">{salesError}</span>
                        </div>
                    </div>
                )}

                {salesLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="text-gray-600">Loading sales history...</div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Paid
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Balance
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentSales.map((sale) => (
                                        <tr key={sale.id} className={`hover:bg-gray-50 ${sale.is_refunded ? 'bg-red-50' : sale.is_partially_refunded ? 'bg-orange-50' : ''}`}>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900">{sale.customer_name}</div>
                                                <div className="text-sm text-gray-500">{sale.phone}</div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-900">
                                                {new Date(sale.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                ₦{Number(sale.total).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-green-600 font-medium">
                                                    ₦{Number(sale.amount_paid).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`font-medium ${sale.balance > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                                                    ₦{Number(sale.balance).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {sale.is_refunded ? (
                                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                                                        Refunded
                                                    </span>
                                                ) : sale.is_partially_refunded ? (
                                                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                                                        Partially Refunded
                                                    </span>
                                                ) : (
                                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                                        Completed
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col space-y-1">
                                                    <button
                                                        onClick={() => handleViewModal(sale)}
                                                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors text-xs"
                                                    >
                                                        View
                                                    </button>
                                                    {sale.balance > 0 && !sale.is_refunded && (
                                                        <button
                                                            onClick={() => setUpdateBalanceModal(sale)}
                                                            className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded transition-colors text-xs"
                                                        >
                                                            Update Balance
                                                        </button>
                                                    )}
                                                    {/* NEW: Refund Request Button */}
                                                    {!sale.is_refunded && sale.amount_paid > 0 && (
                                                        <button
                                                            onClick={() => handleRequestRefund(sale)}
                                                            className="text-purple-600 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded transition-colors text-xs"
                                                        >
                                                            Request Refund
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(sale.id)}
                                                        className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded transition-colors text-xs"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination for Sales */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                                <div className="text-sm text-gray-500">
                                    Showing {Math.min(currentSales.length, perPage)} of {sales.length} sales
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage(page - 1)}
                                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-3 py-1 bg-blue-500 text-white rounded-lg">
                                        {page}
                                    </span>
                                    <button
                                        disabled={page === totalPages}
                                        onClick={() => setPage(page + 1)}
                                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                        {sales.length === 0 && !salesLoading && (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-4">📊</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sales Yet</h3>
                                <p className="text-gray-500">Start by creating your first sale using the form above.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* NEW: Refund Management Section */}
            <div className="mt-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Refund Management</h2>
                    <button
                        onClick={() => setShowRefundRequests(!showRefundRequests)}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                        {showRefundRequests ? 'Hide Refund Requests' : 'View Refund Requests'}
                    </button>
                </div>

                {selectedSaleForRefund && (
                    <div className="mb-8">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Request Refund</h2>

                            {/* Sale Information */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold text-gray-700 mb-3">Sale Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Customer:</span>
                                        <p className="font-medium">{selectedSaleForRefund.customer_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Sale Date:</span>
                                        <p className="font-medium">{new Date(selectedSaleForRefund.date).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Total Amount:</span>
                                        <p className="font-medium">₦{Number(selectedSaleForRefund.total).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Amount Paid:</span>
                                        <p className="font-medium text-green-600">₦{Number(selectedSaleForRefund.amount_paid).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Refund Reason Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Refund Reason *
                                </label>
                                <select
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select a reason for refund</option>
                                    {refundReasons.map(reason => (
                                        <option key={reason.value} value={reason.value}>
                                            {reason.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Refund Type Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Refund Type
                                </label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="refundType"
                                            value="full"
                                            checked={refundType === 'full'}
                                            onChange={(e) => handleRefundTypeChange(e.target.value)}
                                            className="mr-2"
                                        />
                                        <span>Full Refund (₦{Number(selectedSaleForRefund.amount_paid).toLocaleString()})</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="refundType"
                                            value="partial"
                                            checked={refundType === 'partial'}
                                            onChange={(e) => handleRefundTypeChange(e.target.value)}
                                            className="mr-2"
                                        />
                                        <span>Partial Refund</span>
                                    </label>
                                </div>
                            </div>

                            {/* Partial Refund Item Selection */}
                            {refundType === 'partial' && refundItems.length > 0 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Select Items to Refund
                                    </label>
                                    <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                        {refundItems.map((item, index) => {
                                            const productName = products.find(p => p.id === item.product)?.name || `Product ${item.product}`;
                                            const quantity = item.qty || item.quantity || 1;
                                            const price = item.negotiated_price || item.price;
                                            const totalPrice = price * quantity;
                                            const isSelected = selectedRefundItems.some(selected =>
                                                selected.product === item.product && selected.quantity === quantity
                                            );

                                            return (
                                                <label key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                                    <div className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={(e) => handleRefundItemSelect(item, e.target.checked)}
                                                            className="rounded"
                                                        />
                                                        <div>
                                                            <div className="font-medium text-sm">{productName}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {quantity} × ₦{Number(price).toLocaleString()} = ₦{Number(totalPrice).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm font-medium">
                                                        ₦{Number(totalPrice).toLocaleString()}
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {selectedRefundItems.length > 0 && (
                                        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <div className="flex justify-between text-sm">
                                                <span>Selected Items Total:</span>
                                                <span className="font-bold">₦{Number(refundAmount).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Refund Amount Summary */}
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-gray-800">Refund Amount:</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        ₦{Number(refundAmount).toLocaleString()}
                                    </span>
                                </div>
                                {refundType === 'partial' && selectedRefundItems.length === 0 && (
                                    <p className="text-sm text-yellow-700 mt-2">
                                        Please select at least one item for partial refund
                                    </p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setSelectedSaleForRefund(null);
                                        setRefundType('full');
                                        setRefundItems([]);
                                        setSelectedRefundItems([]);
                                        setRefundReason('');
                                    }}
                                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRefundSuccess}
                                    disabled={submittingRefund || !refundReason}
                                    className="px-6 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submittingRefund ? 'Submitting...' : 'Submit Refund Request'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showRefundRequests && (
                    <RefundRequestList
                        page={refundPage}
                        perPage={refundPerPage}
                        onPageChange={setRefundPage}
                    />
                )}
            </div>

            {/* Update Balance Modal */}
            {updateBalanceModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-800">Update Balance</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Customer:</span>
                                    <span className="font-medium">{updateBalanceModal.customer_name}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Total Amount:</span>
                                    <span className="font-medium">₦{Number(updateBalanceModal.total).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Already Paid:</span>
                                    <span className="text-green-600 font-medium">₦{Number(updateBalanceModal.amount_paid).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Current Balance:</span>
                                    <span className="text-orange-600 font-bold">₦{Number(updateBalanceModal.balance).toLocaleString()}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Payment Amount
                                </label>
                                <input
                                    type="number"
                                    value={newPayment}
                                    onChange={(e) => setNewPayment(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    placeholder="Enter payment amount"
                                    min="0"
                                    max={updateBalanceModal.balance}
                                />
                            </div>
                            {newPayment && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex justify-between">
                                        <span className="text-green-800 font-medium">New Balance:</span>
                                        <span className="text-green-800 font-bold">
                                            ₦{Math.max(Number(updateBalanceModal.balance) - Number(newPayment), 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    setUpdateBalanceModal(null);
                                    setNewPayment("");
                                }}
                                className="flex-1 bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateBalance}
                                className="flex-1 bg-green-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Update Balance
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-800">Sale Details</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <span className="text-sm text-gray-600">Customer:</span>
                                    <p className="font-medium">{viewModal.customer_name}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Date:</span>
                                    <p className="font-medium">{viewModal.date}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Phone:</span>
                                    <p className="font-medium">{viewModal.phone}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Payment Method:</span>
                                    <p className="font-medium">{viewModal.payment_method || 'Cash'}</p>
                                </div>
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex justify-between mb-2">
                                    <span>Total Amount:</span>
                                    <span className="font-semibold">₦{Number(viewModal.total).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span>Amount Paid:</span>
                                    <span className="text-green-600 font-semibold">₦{Number(viewModal.amount_paid).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Balance:</span>
                                    <span className={`font-semibold ${viewModal.balance > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                                        ₦{Number(viewModal.balance).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => setViewModal(null)}
                                className="flex-1 bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RefundOrders;