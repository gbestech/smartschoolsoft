// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { toWords } from "number-to-words";
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const Orders = () => {
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

//     // Customer Info
//     const [customerName, setCustomerName] = useState("");
//     const [address, setAddress] = useState("");
//     const [phone, setPhone] = useState("");
//     const [gender, setGender] = useState("");
//     const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));

//     // Payment Info
//     const [amountPaid, setAmountPaid] = useState("");
//     const [paymentMethod, setPaymentMethod] = useState("cash");
//     const [receiptFile, setReceiptFile] = useState(null);
//     const [receiptPreview, setReceiptPreview] = useState(null);
//     const [page, setPage] = useState(1);
//     const perPage = 10;

//     const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
//     const balance = amountPaid ? Math.max(total - Number(amountPaid), 0) : total;
//     const totalInWords = total > 0 ? `${toWords(total)} Naira Only` : "";
//     const isOverpayment = Number(amountPaid) > total;

//     // Create product map for easy lookup
//     const productMap = {};
//     products.forEach(product => {
//         productMap[product.id] = product.name;
//     });

//     const getProductName = (productId) => {
//         return productMap[productId] || `Product ${productId}`;
//     };

//     // Fetch products
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

//     // Fetch sales list
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

//     // Handle receipt file upload
//     const handleReceiptUpload = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
//             if (!validTypes.includes(file.type)) {
//                 toast.error('Please upload a valid image (JPEG, PNG, GIF) or PDF file');
//                 return;
//             }

//             if (file.size > 5 * 1024 * 1024) {
//                 toast.error('File size should be less than 5MB');
//                 return;
//             }

//             setReceiptFile(file);

//             if (file.type.startsWith('image/')) {
//                 const reader = new FileReader();
//                 reader.onload = (e) => {
//                     setReceiptPreview(e.target.result);
//                 };
//                 reader.readAsDataURL(file);
//             } else {
//                 setReceiptPreview(null);
//             }
//         }
//     };

//     // Remove receipt
//     const handleRemoveReceipt = () => {
//         setReceiptFile(null);
//         setReceiptPreview(null);
//     };

//     // Add to cart
//     const handleAdd = () => {
//         if (!selectedId) {
//             toast.warning("Please select a product first.");
//             return;
//         }
//         const product = products.find((p) => p.id === parseInt(selectedId));
//         if (!product) {
//             toast.error("Product not found.");
//             return;
//         }

//         const existing = cart.find((item) => item.id === product.id);
//         if (existing) {
//             if (existing.qty >= product.quantity) {
//                 toast.warning(`You cannot add more than ${product.quantity} of ${product.name}`);
//                 return;
//             }
//             setCart(
//                 cart.map((item) =>
//                     item.id === product.id ? { ...item, qty: item.qty + 1 } : item
//                 )
//             );
//             toast.success(`Updated ${product.name} quantity`);
//         } else {
//             if (product.quantity <= 0) {
//                 toast.error(`${product.name} is out of stock.`);
//                 return;
//             }
//             setCart([...cart, {
//                 ...product,
//                 qty: 1,
//                 price: product.selling_price || product.price
//             }]);
//             toast.success(`${product.name} added to cart`);
//         }
//         setSelectedId("");
//     };

//     // Change quantity
//     const handleQtyChange = (id, newQty) => {
//         if (newQty < 1) return;

//         setCart(
//             cart.map((item) => {
//                 if (item.id === id) {
//                     if (newQty > item.quantity) {
//                         toast.warning(`Only ${item.quantity} available for ${item.name}`);
//                         return item;
//                     }
//                     return { ...item, qty: newQty };
//                 }
//                 return item;
//             })
//         );
//     };

//     // Remove product
//     const handleRemove = (id) => {
//         const product = cart.find(item => item.id === id);
//         setCart(cart.filter((item) => item.id !== id));
//         toast.info(`${product?.name} removed from cart`);
//     };

//     // Submit sale
//     const handleSubmit = () => {
//         if (!customerName.trim()) {
//             toast.error("Please enter customer name.");
//             return;
//         }
//         if (!phone.trim()) {
//             toast.error("Please enter phone number.");
//             return;
//         }
//         if (cart.length === 0) {
//             toast.error("Cart is empty!");
//             return;
//         }
//         setShowModal(true);
//     };

//     // Handle amount paid change with optimized validation
//     const [lastToastId, setLastToastId] = useState(null);

//     const handleAmountPaidChange = (e) => {
//         const value = e.target.value;
//         setAmountPaid(value);

//         const paidAmount = Number(value) || 0;

//         // Clear previous toast if exists
//         if (lastToastId) {
//             toast.dismiss(lastToastId);
//         }

//         // Show payment confirmation message when customer pays any amount
//         // if (paidAmount > 0) {
//         //     const toastMessage = `💰 ${customerName || 'Customer'} paid ₦${paidAmount.toLocaleString()}`;
//         //     const newToastId = toast.success(toastMessage, {
//         //         position: "top-center",
//         //         autoClose: 3000,
//         //         toastId: `payment-${paidAmount}`
//         //     });
//         //     setLastToastId(newToastId);
//         // }
//     };

//     // Confirm sale
//     const confirmSale = async () => {
//         try {
//             // Validate required fields
//             if (!customerName.trim()) {
//                 toast.error("Please enter customer name.");
//                 return;
//             }
//             if (!phone.trim()) {
//                 toast.error("Please enter phone number.");
//                 return;
//             }
//             if (cart.length === 0) {
//                 toast.error("Cart is empty!");
//                 return;
//             }
//             if (paymentMethod === 'receipt_upload' && !receiptFile) {
//                 toast.error("Please upload a receipt for receipt payment method.");
//                 return;
//             }

//             // Check for overpayment
//             const actualAmountPaid = Number(amountPaid) || 0;
//             if (actualAmountPaid > total) {
//                 toast.error(`❌ Cannot process sale! Amount paid (₦${actualAmountPaid.toLocaleString()}) exceeds total (₦${total.toLocaleString()})`);
//                 return;
//             }

//             const token = localStorage.getItem('token');

//             // Calculate the actual balance based on amount paid
//             const calculatedBalance = Math.max(total - actualAmountPaid, 0);

//             // Show payment summary with customer confirmation
//             let paymentConfirmation = "";
//             if (actualAmountPaid === total) {
//                 paymentConfirmation = `💵 Full payment of ₦${actualAmountPaid.toLocaleString()} received from ${customerName}!`;
//             } else if (actualAmountPaid > 0) {
//                 paymentConfirmation = `💳 ${customerName} paid ₦${actualAmountPaid.toLocaleString()}. Balance: ₦${calculatedBalance.toLocaleString()}`;
//             } else {
//                 paymentConfirmation = `⚠️ ${customerName} - No payment received. Recording as unpaid sale.`;
//             }

//             toast.info(paymentConfirmation, {
//                 position: "top-center",
//                 autoClose: 3000,
//             });

//             // Create FormData for file upload
//             const formData = new FormData();
//             formData.append('customer_name', customerName);
//             formData.append('address', address || "Not provided");
//             formData.append('phone', phone);
//             formData.append('gender', gender || "");
//             formData.append('date', saleDate);
//             formData.append('amount_paid', actualAmountPaid);
//             formData.append('payment_method', paymentMethod);
//             formData.append('balance', calculatedBalance);
//             formData.append('total', total);

//             // Append receipt file if exists
//             if (receiptFile) {
//                 formData.append('receipt', receiptFile);
//             }

//             // Append items individually
//             cart.forEach((item, index) => {
//                 formData.append(`items[${index}]product`, item.id);
//                 formData.append(`items[${index}]qty`, item.qty);
//                 formData.append(`items[${index}]price`, parseFloat(item.price));
//             });

//             const response = await axios.post(
//                 "http://127.0.0.1:8000/api/sales/sales/",
//                 formData,
//                 {
//                     headers: {
//                         'Authorization': `Token ${token}`,
//                         'Content-Type': 'multipart/form-data'
//                     }
//                 }
//             );
//             console.log("Sale created successfully:", response.data);
//             setShowModal(false);


//             // Show success message with customer payment details
//             let successMessage = "";
//             if (actualAmountPaid === total) {
//                 successMessage = `🎉 Sale to ${customerName} completed! Full payment of ₦${actualAmountPaid.toLocaleString()} received.`;
//             } else if (actualAmountPaid > 0) {
//                 successMessage = `🎉 Sale to ${customerName} recorded! Payment: ₦${actualAmountPaid.toLocaleString()}, Balance: ₦${calculatedBalance.toLocaleString()}`;
//             } else {
//                 successMessage = `🎉 Sale to ${customerName} recorded as unpaid. Total: ₦${total.toLocaleString()}`;
//             }

//             toast.success(successMessage, {
//                 position: "top-center",
//                 autoClose: 4000,
//             });

//             // Reset form
//             setCart([]);
//             setCustomerName("");
//             setAddress("");
//             setPhone("");
//             setGender("");
//             setAmountPaid("");
//             setPaymentMethod("cash");
//             setReceiptFile(null);
//             setReceiptPreview(null);
//             setSaleDate(new Date().toISOString().slice(0, 10));

//             await fetchSales();
//             await fetchProducts();

//         } catch (err) {
//             console.error("Sale creation error:", err);

//             if (err.response) {
//                 console.error("Response data:", err.response.data);

//                 let errorMessage = "Failed to create sale: ";
//                 if (err.response.data) {
//                     if (typeof err.response.data === 'object') {
//                         if (err.response.data.non_field_errors) {
//                             errorMessage += err.response.data.non_field_errors.join(', ');
//                         } else {
//                             Object.keys(err.response.data).forEach(key => {
//                                 errorMessage += `${key}: ${Array.isArray(err.response.data[key]) ? err.response.data[key].join(', ') : err.response.data[key]} `;
//                             });
//                         }
//                     } else {
//                         errorMessage += err.response.data;
//                     }
//                 } else {
//                     errorMessage += err.message || 'Unknown error';
//                 }
//                 toast.error(`❌ ${errorMessage}`);
//             } else if (err.request) {
//                 toast.error('❌ No response received from server');
//             } else {
//                 toast.error(`❌ Error: ${err.message}`);
//             }
//         }
//     };

//     // Update balance
//     // Update balance
//     const handleUpdateBalance = async () => {
//         if (!newPayment || Number(newPayment) <= 0) {
//             toast.error("Please enter a valid payment amount.");
//             return;
//         }

//         // 🚫 ADDED: Check if payment exceeds balance
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

//             // 🎉 ADDED: Enhanced success message for balance update
//             let successMessage = "";
//             if (updatedBalance === 0) {
//                 successMessage = `💰 ${updateBalanceModal.customer_name} paid ₦${Number(newPayment).toLocaleString()}. Balance fully settled! 🎉`;
//             } else {
//                 successMessage = `💰 ${updateBalanceModal.customer_name} paid ₦${Number(newPayment).toLocaleString()}. New balance: ₦${updatedBalance.toLocaleString()}`;
//             }

//             toast.success(successMessage, {
//                 position: "top-center",
//                 autoClose: 4000,
//             });

//             setUpdateBalanceModal(null);
//             setNewPayment("");
//             await fetchSales();

//         } catch (err) {
//             console.error("Update balance error:", err);
//             toast.error(`❌ Failed to update balance: ${err.response?.data?.detail || err.message}`);
//         }
//     };
//     // Delete sale
//     const handleDelete = async (id) => {
//         if (!window.confirm("Are you sure you want to delete this sale?")) return;

//         try {
//             const token = localStorage.getItem('token');
//             await axios.delete(`http://127.0.0.1:8000/api/sales/sales/${id}/`, {
//                 headers: {
//                     'Authorization': `Token ${token}`
//                 }
//             });

//             toast.success("🗑️ Sale deleted successfully!");
//             setSales(prevSales => prevSales.filter((s) => s.id !== id));
//             await fetchSales();

//         } catch (err) {
//             console.error("Delete error:", err);
//             toast.error(`❌ Failed to delete sale: ${err.response?.data?.detail || err.message}`);
//         }
//     };

//     // Print receipt
//     const handlePrint = (sale) => {
//         const printWindow = window.open('', '', 'height=600,width=800');

//         printWindow.document.write(`
//             <html>
//                 <head>
//                     <title>Receipt - ${sale.customer_name}</title>
//                     <style>
//                         body {
//                             font-family: Arial, sans-serif;
//                             padding: 20px;
//                             max-width: 800px;
//                             margin: 0 auto;
//                         }
//                         .header {
//                             text-align: center;
//                             border-bottom: 2px solid #333;
//                             padding-bottom: 20px;
//                             margin-bottom: 20px;
//                         }
//                         .header h1 {
//                             margin: 0;
//                             color: #333;
//                         }
//                         .info-section {
//                             display: grid;
//                             grid-template-columns: 1fr 1fr;
//                             gap: 10px;
//                             margin-bottom: 30px;
//                         }
//                         .info-item {
//                             padding: 10px;
//                             background: #f5f5f5;
//                             border-radius: 5px;
//                         }
//                         .info-label {
//                             font-weight: bold;
//                             color: #666;
//                             font-size: 12px;
//                         }
//                         .info-value {
//                             font-size: 16px;
//                             color: #333;
//                             margin-top: 5px;
//                         }
//                         table {
//                             width: 100%;
//                             border-collapse: collapse;
//                             margin-bottom: 20px;
//                         }
//                         th, td {
//                             padding: 12px;
//                             text-align: left;
//                             border-bottom: 1px solid #ddd;
//                         }
//                         th {
//                             background-color: #333;
//                             color: white;
//                             font-weight: bold;
//                         }
//                         .totals {
//                             float: right;
//                             width: 300px;
//                         }
//                         .total-row {
//                             display: flex;
//                             justify-content: space-between;
//                             padding: 10px;
//                             font-size: 18px;
//                         }
//                         .total-row.grand {
//                             background: #333;
//                             color: white;
//                             font-weight: bold;
//                             font-size: 20px;
//                         }
//                         .total-row.paid {
//                             background: #4CAF50;
//                             color: white;
//                             font-weight: bold;
//                         }
//                         .total-row.balance {
//                             background: #FF9800;
//                             color: white;
//                             font-weight: bold;
//                         }
//                         .footer {
//                             margin-top: 50px;
//                             text-align: center;
//                             border-top: 2px solid #333;
//                             padding-top: 20px;
//                             color: #666;
//                         }
//                         @media print {
//                             .no-print {
//                                 display: none;
//                             }
//                         }
//                     </style>
//                 </head>
//                 <body>
//                     <div class="header">
//                         <h1>SALES RECEIPT</h1>
//                         <p>Receipt #${sale.id}</p>
//                         <p>Date: ${new Date(sale.date).toLocaleDateString()}</p>
//                     </div>

//                     <div class="info-section">
//                         <div class="info-item">
//                             <div class="info-label">Customer Name</div>
//                             <div class="info-value">${sale.customer_name}</div>
//                         </div>
//                         <div class="info-item">
//                             <div class="info-label">Phone Number</div>
//                             <div class="info-value">${sale.phone}</div>
//                         </div>
//                         <div class="info-item">
//                             <div class="info-label">Address</div>
//                             <div class="info-value">${sale.address || 'N/A'}</div>
//                         </div>
//                         <div class="info-item">
//                             <div class="info-label">Gender</div>
//                             <div class="info-value">${sale.gender || 'N/A'}</div>
//                         </div>
//                         <div class="info-item">
//                             <div class="info-label">Payment Method</div>
//                             <div class="info-value">${sale.payment_method || 'Cash'}</div>
//                         </div>
//                     </div>

//                     ${sale.items && sale.items.length > 0 ? `
//                         <h3>Items Purchased</h3>
//                         <table>
//                             <thead>
//                                 <tr>
//                                     <th>Product</th>
//                                     <th>Quantity</th>
//                                     <th>Price</th>
//                                     <th>Total</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 ${sale.items.map(item => {
//             const productName = getProductName(item.product);
//             return `
//                                         <tr>
//                                             <td>${productName}</td>
//                                             <td>${item.qty}</td>
//                                             <td>₦${Number(item.price).toLocaleString()}</td>
//                                             <td>₦${Number(item.qty * item.price).toLocaleString()}</td>
//                                         </tr>
//                                     `;
//         }).join('')}
//                             </tbody>
//                         </table>
//                     ` : ''}

//                     <div class="totals">
//                         <div class="total-row grand">
//                             <span>Total Amount:</span>
//                             <span>₦${Number(sale.total).toLocaleString()}</span>
//                         </div>
//                         <div class="total-row paid">
//                             <span>Amount Paid:</span>
//                             <span>₦${Number(sale.amount_paid).toLocaleString()}</span>
//                         </div>
//                         <div class="total-row balance">
//                             <span>Balance:</span>
//                             <span>₦${Number(sale.balance).toLocaleString()}</span>
//                         </div>
//                     </div>

//                     <div style="clear: both;"></div>

//                     <div class="footer">
//                         <p><strong>Thank you for your business!</strong></p>
//                         <p>This is a computer-generated receipt.</p>
//                     </div>

//                     <div class="no-print" style="text-align: center; margin-top: 30px;">
//                         <button onclick="window.print()" style="padding: 10px 30px; font-size: 16px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Receipt</button>
//                         <button onclick="window.close()" style="padding: 10px 30px; font-size: 16px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
//                     </div>
//                 </body>
//             </html>
//         `);
//         printWindow.document.close();
//     };

//     const totalPages = Math.ceil(sales.length / perPage);
//     const currentSales = sales.slice((page - 1) * perPage, page * perPage);

//     if (loading) {
//         return (
//             <div className="p-6 w-full">
//                 <div className="flex justify-center items-center h-64">
//                     <div className="text-lg text-gray-600">Loading products...</div>
//                 </div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="p-6 w-full">
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
//                     <div className="flex items-center">
//                         <span className="text-red-500 mr-3">⚠️</span>
//                         <span className="text-red-700">{error}</span>
//                     </div>
//                     <button
//                         onClick={() => window.location.reload()}
//                         className="mt-3 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
//                     >
//                         Try Again
//                     </button>
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

//             {/* Sales Form Section */}
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
//                 <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Sale</h2>

//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                     {/* Left Column - Customer Info */}
//                     <div className="space-y-6">
//                         <div className="bg-gray-50 rounded-lg p-6">
//                             <h3 className="text-xl font-semibold text-gray-800 mb-4">Customer Information</h3>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Customer Name *
//                                     </label>
//                                     <input
//                                         type="text"
//                                         placeholder="Enter customer name"
//                                         value={customerName}
//                                         onChange={(e) => setCustomerName(e.target.value)}
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                         required
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Phone Number *
//                                     </label>
//                                     <input
//                                         type="text"
//                                         placeholder="Enter phone number"
//                                         value={phone}
//                                         onChange={(e) => setPhone(e.target.value)}
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                         required
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Address
//                                     </label>
//                                     <input
//                                         type="text"
//                                         placeholder="Enter address"
//                                         value={address}
//                                         onChange={(e) => setAddress(e.target.value)}
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Gender
//                                     </label>
//                                     <select
//                                         value={gender}
//                                         onChange={(e) => setGender(e.target.value)}
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                     >
//                                         <option value="">Select Gender</option>
//                                         <option value="Male">Male</option>
//                                         <option value="Female">Female</option>
//                                     </select>
//                                 </div>
//                                 <div className="md:col-span-2">
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Sale Date
//                                     </label>
//                                     <input
//                                         type="date"
//                                         value={saleDate}
//                                         onChange={(e) => setSaleDate(e.target.value)}
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="bg-gray-50 rounded-lg p-6">
//                             <h3 className="text-xl font-semibold text-gray-800 mb-4">Add Products</h3>
//                             <div className="flex gap-3">
//                                 <select
//                                     className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                     value={selectedId}
//                                     onChange={(e) => setSelectedId(e.target.value)}
//                                 >
//                                     <option value="">Select Product</option>
//                                     {products.map((product) => (
//                                         <option key={product.id} value={product.id}>
//                                             {product.name} - ₦{Number(product.selling_price || product.price).toLocaleString()}
//                                             (Stock: {product.quantity})
//                                         </option>
//                                     ))}
//                                 </select>
//                                 <button
//                                     onClick={handleAdd}
//                                     className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
//                                 >
//                                     Add
//                                 </button>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Right Column - Cart */}
//                     <div className="space-y-6">
//                         {cart.length > 0 ? (
//                             <div className="bg-gray-50 rounded-lg p-6">
//                                 <div className="flex justify-between items-center mb-4">
//                                     <h3 className="text-xl font-semibold text-gray-800">Shopping Cart</h3>
//                                     <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
//                                         {cart.length} items
//                                     </span>
//                                 </div>

//                                 <div className="overflow-x-auto">
//                                     <table className="w-full">
//                                         <thead className="bg-blue-500">
//                                             <tr>
//                                                 <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
//                                                     Product
//                                                 </th>
//                                                 <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
//                                                     Price
//                                                 </th>
//                                                 <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
//                                                     Quantity
//                                                 </th>
//                                                 <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
//                                                     Total
//                                                 </th>
//                                                 <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
//                                                     Action
//                                                 </th>
//                                             </tr>
//                                         </thead>
//                                         <tbody className="divide-y divide-gray-200">
//                                             {cart.map((item) => (
//                                                 <tr key={item.id} className="hover:bg-gray-50">
//                                                     <td className="px-4 py-3">
//                                                         <div className="font-medium text-gray-900">{item.name}</div>
//                                                     </td>
//                                                     <td className="px-4 py-3 text-gray-900">
//                                                         ₦{Number(item.price).toLocaleString()}
//                                                     </td>
//                                                     <td className="px-4 py-3">
//                                                         <div className="flex items-center gap-2">
//                                                             <input
//                                                                 type="number"
//                                                                 min="1"
//                                                                 max={item.quantity}
//                                                                 value={item.qty}
//                                                                 onChange={(e) =>
//                                                                     handleQtyChange(item.id, parseInt(e.target.value) || 1)
//                                                                 }
//                                                                 className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
//                                                             />
//                                                             <span className="text-sm text-gray-500">
//                                                                 of {item.quantity}
//                                                             </span>
//                                                         </div>
//                                                     </td>
//                                                     <td className="px-4 py-3 font-medium text-gray-900">
//                                                         ₦{Number(item.price * item.qty).toLocaleString()}
//                                                     </td>
//                                                     <td className="px-4 py-3">
//                                                         <button
//                                                             onClick={() => handleRemove(item.id)}
//                                                             className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors text-sm"
//                                                         >
//                                                             Remove
//                                                         </button>
//                                                     </td>
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                     </table>
//                                 </div>

//                                 <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
//                                     <div className="flex justify-between items-center mb-2">
//                                         <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
//                                         <span className="text-2xl font-bold text-green-600">
//                                             ₦{Number(total).toLocaleString()}
//                                         </span>
//                                     </div>
//                                     <div className="text-sm text-gray-600 italic">
//                                         {totalInWords}
//                                     </div>
//                                     <button
//                                         onClick={handleSubmit}
//                                         className="w-full mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg"
//                                     >
//                                         Process Sale
//                                     </button>
//                                 </div>
//                             </div>
//                         ) : (
//                             <div className="bg-gray-50 rounded-lg p-8 text-center">
//                                 <div className="text-4xl mb-4">🛒</div>
//                                 <h3 className="text-lg font-semibold text-gray-900 ">Your Cart is Empty</h3>
//                                 <p className="text-gray-500">Add products to the cart to start a sale.</p>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Sales History Section - Separated and placed below */}
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
//                                             Actions
//                                         </th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-gray-200">
//                                     {currentSales.map((sale) => (
//                                         <tr key={sale.id} className="hover:bg-gray-50">
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
//                                                 <div className="flex flex-col space-y-1">
//                                                     <button
//                                                         onClick={() => setViewModal(sale)}
//                                                         className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors text-xs"
//                                                     >
//                                                         View
//                                                     </button>
//                                                     {sale.balance > 0 && (
//                                                         <button
//                                                             onClick={() => setUpdateBalanceModal(sale)}
//                                                             className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded transition-colors text-xs"
//                                                         >
//                                                             Update Balance
//                                                         </button>
//                                                     )}
//                                                     <button
//                                                         onClick={() => handleDelete(sale.id)}
//                                                         className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors text-xs"
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

//             {/* All modals remain exactly the same */}
//             {/* Confirm Sale Modal */}
//             {showModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
//                         <div className="p-6 border-b border-gray-200">
//                             <h3 className="text-xl font-semibold text-gray-800">Confirm Sale</h3>
//                         </div>
//                         <div className="p-6 space-y-4">
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <span className="text-sm text-gray-600">Customer:</span>
//                                     <p className="font-medium">{customerName}</p>
//                                 </div>
//                                 <div>
//                                     <span className="text-sm text-gray-600">Phone:</span>
//                                     <p className="font-medium">{phone}</p>
//                                 </div>
//                             </div>
//                             <div className="border-t pt-4">
//                                 <div className="flex justify-between items-center mb-2">
//                                     <span className="text-lg font-semibold">Total Amount:</span>
//                                     <span className="text-xl font-bold text-green-600">
//                                         ₦{Number(total).toLocaleString()}
//                                     </span>
//                                 </div>
//                             </div>

//                             {/* Payment Information - Three Lines */}
//                             <div className="grid grid-cols-3 gap-3">
//                                 {/* Payment Method */}
//                                 <div className="col-span-3 sm:col-span-1">
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Payment Method *
//                                     </label>
//                                     <select
//                                         value={paymentMethod}
//                                         onChange={(e) => setPaymentMethod(e.target.value)}
//                                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                         required
//                                     >
//                                         <option value="cash">Cash</option>
//                                         <option value="receipt_upload">Receipt</option>
//                                         <option value="bank_transfer">Transfer</option>
//                                         <option value="pos">POS</option>
//                                         <option value="other">Other</option>
//                                     </select>
//                                 </div>

//                                 {/* Amount Paid */}
//                                 <div className="col-span-3 sm:col-span-1">
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Amount Paid
//                                     </label>
//                                     <input
//                                         type="number"
//                                         value={amountPaid}
//                                         onChange={handleAmountPaidChange}
//                                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                         placeholder="Amount"
//                                         min="0"
//                                         max={total}
//                                     />
//                                 </div>

//                                 {/* Balance Display */}
//                                 <div className="col-span-3 sm:col-span-1">
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Balance
//                                     </label>
//                                     <div className={`w-full px-3 py-2 text-sm border rounded-lg font-semibold ${balance > 0
//                                         ? 'bg-orange-50 border-orange-200 text-orange-800'
//                                         : isOverpayment
//                                             ? 'bg-red-50 border-red-200 text-red-800'
//                                             : 'bg-green-50 border-green-200 text-green-800'
//                                         }`}>
//                                         {isOverpayment
//                                             ? `-₦${(Number(amountPaid) - total).toLocaleString()}`
//                                             : `₦${Number(balance).toLocaleString()}`
//                                         }
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Overpayment Warning */}
//                             {isOverpayment && (
//                                 <div className="col-span-3">
//                                     <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//                                         <div className="flex items-center">
//                                             <span className="text-red-500 mr-2">⚠️</span>
//                                             <span className="text-red-700 text-sm font-medium">
//                                                 Overpayment: ₦{(Number(amountPaid) - total).toLocaleString()}
//                                             </span>
//                                         </div>
//                                         <p className="text-red-600 text-xs mt-1">
//                                             Amount paid exceeds total amount. Please adjust the payment.
//                                         </p>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Receipt Upload - Only show when payment method is receipt_upload */}
//                             {paymentMethod === 'receipt_upload' && (
//                                 <div className="col-span-3">
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Upload Receipt *
//                                     </label>
//                                     <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
//                                         {!receiptFile ? (
//                                             <div>
//                                                 <input
//                                                     type="file"
//                                                     accept=".jpg,.jpeg,.png,.gif,.pdf"
//                                                     onChange={handleReceiptUpload}
//                                                     className="hidden"
//                                                     id="receipt-upload"
//                                                 />
//                                                 <label
//                                                     htmlFor="receipt-upload"
//                                                     className="cursor-pointer bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors inline-block text-sm"
//                                                 >
//                                                     📎 Choose File
//                                                 </label>
//                                                 <p className="text-xs text-gray-500 mt-1">
//                                                     JPG, PNG, GIF, PDF (Max 5MB)
//                                                 </p>
//                                             </div>
//                                         ) : (
//                                             <div className="flex items-center justify-between">
//                                                 <div className="flex items-center space-x-2">
//                                                     {receiptPreview ? (
//                                                         <img
//                                                             src={receiptPreview}
//                                                             alt="Receipt preview"
//                                                             className="w-10 h-10 object-cover rounded"
//                                                         />
//                                                     ) : (
//                                                         <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
//                                                             📄
//                                                         </div>
//                                                     )}
//                                                     <div className="text-left">
//                                                         <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
//                                                             {receiptFile.name}
//                                                         </p>
//                                                         <p className="text-xs text-gray-500">
//                                                             {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
//                                                         </p>
//                                                     </div>
//                                                 </div>
//                                                 <button
//                                                     type="button"
//                                                     onClick={handleRemoveReceipt}
//                                                     className="text-red-500 hover:text-red-700 text-sm"
//                                                 >
//                                                     ✕
//                                                 </button>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                         <div className="flex gap-3 p-6 border-t border-gray-200">
//                             <button
//                                 onClick={() => setShowModal(false)}
//                                 className="flex-1 bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={confirmSale}
//                                 disabled={isOverpayment || (paymentMethod === 'receipt_upload' && !receiptFile)}
//                                 className="flex-1 bg-green-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 text-sm"
//                             >
//                                 Confirm Sale
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

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

//             {/* View Sale Details Modal */}
//             {viewModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
//                         <div className="p-6 border-b border-gray-200">
//                             <h3 className="text-xl font-semibold text-gray-800">Sale Details</h3>
//                         </div>
//                         <div className="p-6 space-y-4">
//                             <div className="grid grid-cols-2 gap-4">
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
//                                     <span className="text-sm text-gray-600">Gender:</span>
//                                     <p className="font-medium">{viewModal.gender || 'N/A'}</p>
//                                 </div>
//                                 <div>
//                                     <span className="text-sm text-gray-600">Payment Method:</span>
//                                     <p className="font-medium">{viewModal.payment_method || 'Cash'}</p>
//                                 </div>
//                                 {viewModal.receipt && (
//                                     <div className="md:col-span-2">
//                                         <span className="text-sm text-gray-600">Receipt:</span>
//                                         <div className="mt-1">
//                                             <a
//                                                 href={viewModal.receipt}
//                                                 target="_blank"
//                                                 rel="noopener noreferrer"
//                                                 className="text-blue-600 hover:text-blue-800 underline flex items-center space-x-1"
//                                             >
//                                                 <span>📎 View Uploaded Receipt</span>
//                                             </a>
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                             <div className="border-t pt-4">
//                                 <div className="space-y-2">
//                                     <div className="flex justify-between">
//                                         <span>Total Amount:</span>
//                                         <span className="font-semibold">₦{Number(viewModal.total).toLocaleString()}</span>
//                                     </div>
//                                     <div className="flex justify-between">
//                                         <span>Amount Paid:</span>
//                                         <span className="text-green-600 font-semibold">₦{Number(viewModal.amount_paid).toLocaleString()}</span>
//                                     </div>
//                                     <div className="flex justify-between">
//                                         <span>Balance:</span>
//                                         <span className={`font-semibold ${viewModal.balance > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
//                                             ₦{Number(viewModal.balance).toLocaleString()}
//                                         </span>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="border-t pt-4">
//                                 <h4 className="font-semibold mb-2">Items Sold:</h4>
//                                 <div className="space-y-2 max-h-40 overflow-y-auto">
//                                     {viewModal.items && viewModal.items.length > 0 ? (
//                                         viewModal.items.map((item, index) => {
//                                             const productName = getProductName(item.product);
//                                             const quantity = item.qty || item.quantity || 1;
//                                             const price = item.price || item.unit_price || 0;

//                                             return (
//                                                 <div key={index} className="flex justify-between text-sm">
//                                                     <span className="flex-1">{productName}</span>
//                                                     <span className="ml-2">{quantity} × ₦{Number(price).toLocaleString()}</span>
//                                                 </div>
//                                             );
//                                         })
//                                     ) : (
//                                         <p className="text-gray-500 text-sm">No items found</p>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="flex gap-3 p-6 border-t border-gray-200">
//                             <button
//                                 onClick={() => handlePrint(viewModal)}
//                                 className="flex-1 bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
//                             >
//                                 🖨️ Print Receipt
//                             </button>
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

// export default Orders;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toWords } from "number-to-words";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Orders = () => {
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

    // Customer Info
    const [customerName, setCustomerName] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("");
    const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));

    // Payment Info
    const [amountPaid, setAmountPaid] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState(null);
    const [page, setPage] = useState(1);
    const perPage = 10;

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const balance = amountPaid ? Math.max(total - Number(amountPaid), 0) : total;
    const totalInWords = total > 0 ? `${toWords(total)} Naira Only` : "";
    const isOverpayment = Number(amountPaid) > total;

    // Create product map for easy lookup
    const productMap = {};
    products.forEach(product => {
        productMap[product.id] = product.name;
    });

    const getProductName = (productId) => {
        return productMap[productId] || `Product ${productId}`;
    };

    // Fetch products
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

    // Fetch sales list
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

    // Handle receipt file upload
    const handleReceiptUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                toast.error('Please upload a valid image (JPEG, PNG, GIF) or PDF file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size should be less than 5MB');
                return;
            }

            setReceiptFile(file);

            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setReceiptPreview(e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                setReceiptPreview(null);
            }
        }
    };

    // Remove receipt
    const handleRemoveReceipt = () => {
        setReceiptFile(null);
        setReceiptPreview(null);
    };

    // Add to cart
    const handleAdd = () => {
        if (!selectedId) {
            toast.warning("Please select a product first.");
            return;
        }
        const product = products.find((p) => p.id === parseInt(selectedId));
        if (!product) {
            toast.error("Product not found.");
            return;
        }

        const existing = cart.find((item) => item.id === product.id);
        if (existing) {
            if (existing.qty >= product.quantity) {
                toast.warning(`You cannot add more than ${product.quantity} of ${product.name}`);
                return;
            }
            setCart(
                cart.map((item) =>
                    item.id === product.id ? { ...item, qty: item.qty + 1 } : item
                )
            );
            toast.success(`Updated ${product.name} quantity`);
        } else {
            if (product.quantity <= 0) {
                toast.error(`${product.name} is out of stock.`);
                return;
            }
            setCart([...cart, {
                ...product,
                qty: 1,
                price: product.selling_price || product.price
            }]);
            toast.success(`${product.name} added to cart`);
        }
        setSelectedId("");
    };

    // Change quantity
    const handleQtyChange = (id, newQty) => {
        if (newQty < 1) return;

        setCart(
            cart.map((item) => {
                if (item.id === id) {
                    if (newQty > item.quantity) {
                        toast.warning(`Only ${item.quantity} available for ${item.name}`);
                        return item;
                    }
                    return { ...item, qty: newQty };
                }
                return item;
            })
        );
    };

    // Remove product
    const handleRemove = (id) => {
        const product = cart.find(item => item.id === id);
        setCart(cart.filter((item) => item.id !== id));
        toast.info(`${product?.name} removed from cart`);
    };

    // Submit sale
    const handleSubmit = () => {
        if (!customerName.trim()) {
            toast.error("Please enter customer name.");
            return;
        }
        if (!phone.trim()) {
            toast.error("Please enter phone number.");
            return;
        }
        if (cart.length === 0) {
            toast.error("Cart is empty!");
            return;
        }
        setShowModal(true);
    };

    // Handle amount paid change
    const [lastToastId, setLastToastId] = useState(null);

    const handleAmountPaidChange = (e) => {
        const value = e.target.value;
        setAmountPaid(value);

        const paidAmount = Number(value) || 0;

        if (lastToastId) {
            toast.dismiss(lastToastId);
        }
    };

    // Confirm sale
    const confirmSale = async () => {
        try {
            if (!customerName.trim()) {
                toast.error("Please enter customer name.");
                return;
            }
            if (!phone.trim()) {
                toast.error("Please enter phone number.");
                return;
            }
            if (cart.length === 0) {
                toast.error("Cart is empty!");
                return;
            }
            if (paymentMethod === 'receipt_upload' && !receiptFile) {
                toast.error("Please upload a receipt for receipt payment method.");
                return;
            }

            const actualAmountPaid = Number(amountPaid) || 0;
            if (actualAmountPaid > total) {
                toast.error(`❌ Cannot process sale! Amount paid (₦${actualAmountPaid.toLocaleString()}) exceeds total (₦${total.toLocaleString()})`);
                return;
            }

            const token = localStorage.getItem('token');
            const calculatedBalance = Math.max(total - actualAmountPaid, 0);

            let paymentConfirmation = "";
            if (actualAmountPaid === total) {
                paymentConfirmation = `💵 Full payment of ₦${actualAmountPaid.toLocaleString()} received from ${customerName}!`;
            } else if (actualAmountPaid > 0) {
                paymentConfirmation = `💳 ${customerName} paid ₦${actualAmountPaid.toLocaleString()}. Balance: ₦${calculatedBalance.toLocaleString()}`;
            } else {
                paymentConfirmation = `⚠️ ${customerName} - No payment received. Recording as unpaid sale.`;
            }

            toast.info(paymentConfirmation, {
                position: "top-center",
                autoClose: 3000,
            });

            const formData = new FormData();
            formData.append('customer_name', customerName);
            formData.append('address', address || "Not provided");
            formData.append('phone', phone);
            formData.append('gender', gender || "");
            formData.append('date', saleDate);
            formData.append('amount_paid', actualAmountPaid);
            formData.append('payment_method', paymentMethod);
            formData.append('balance', calculatedBalance);
            formData.append('total', total);

            if (receiptFile) {
                formData.append('receipt', receiptFile);
            }

            cart.forEach((item, index) => {
                formData.append(`items[${index}]product`, item.id);
                formData.append(`items[${index}]qty`, item.qty);
                formData.append(`items[${index}]price`, parseFloat(item.price));
            });

            const response = await axios.post(
                "http://127.0.0.1:8000/api/sales/sales/",
                formData,
                {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            console.log("Sale created successfully:", response.data);
            setShowModal(false);

            let successMessage = "";
            if (actualAmountPaid === total) {
                successMessage = `🎉 Sale to ${customerName} completed! Full payment of ₦${actualAmountPaid.toLocaleString()} received.`;
            } else if (actualAmountPaid > 0) {
                successMessage = `🎉 Sale to ${customerName} recorded! Payment: ₦${actualAmountPaid.toLocaleString()}, Balance: ₦${calculatedBalance.toLocaleString()}`;
            } else {
                successMessage = `🎉 Sale to ${customerName} recorded as unpaid. Total: ₦${total.toLocaleString()}`;
            }

            toast.success(successMessage, {
                position: "top-center",
                autoClose: 4000,
            });

            // Reset form
            setCart([]);
            setCustomerName("");
            setAddress("");
            setPhone("");
            setGender("");
            setAmountPaid("");
            setPaymentMethod("cash");
            setReceiptFile(null);
            setReceiptPreview(null);
            setSaleDate(new Date().toISOString().slice(0, 10));

            await fetchSales();
            await fetchProducts();

        } catch (err) {
            console.error("Sale creation error:", err);
            if (err.response) {
                console.error("Response data:", err.response.data);
                let errorMessage = "Failed to create sale: ";
                if (err.response.data) {
                    if (typeof err.response.data === 'object') {
                        if (err.response.data.non_field_errors) {
                            errorMessage += err.response.data.non_field_errors.join(', ');
                        } else {
                            Object.keys(err.response.data).forEach(key => {
                                errorMessage += `${key}: ${Array.isArray(err.response.data[key]) ? err.response.data[key].join(', ') : err.response.data[key]} `;
                            });
                        }
                    } else {
                        errorMessage += err.response.data;
                    }
                } else {
                    errorMessage += err.message || 'Unknown error';
                }
                toast.error(`❌ ${errorMessage}`);
            } else if (err.request) {
                toast.error('❌ No response received from server');
            } else {
                toast.error(`❌ Error: ${err.message}`);
            }
        }
    };

    // Update balance
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

            toast.success(successMessage, {
                position: "top-center",
                autoClose: 4000,
            });

            setUpdateBalanceModal(null);
            setNewPayment("");
            await fetchSales();

        } catch (err) {
            console.error("Update balance error:", err);
            toast.error(`❌ Failed to update balance: ${err.response?.data?.detail || err.message}`);
        }
    };

    // Delete sale
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this sale?")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://127.0.0.1:8000/api/sales/sales/${id}/`, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            toast.success("🗑️ Sale deleted successfully!");
            setSales(prevSales => prevSales.filter((s) => s.id !== id));
            await fetchSales();

        } catch (err) {
            console.error("Delete error:", err);
            toast.error(`❌ Failed to delete sale: ${err.response?.data?.detail || err.message}`);
        }
    };

    // Print receipt (keep the same implementation)
    const handlePrint = (sale) => {
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Receipt - ${sale.customer_name}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
                        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                        .header h1 { margin: 0; color: #333; }
                        .info-section { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 30px; }
                        .info-item { padding: 10px; background: #f5f5f5; border-radius: 5px; }
                        .info-label { font-weight: bold; color: #666; font-size: 12px; }
                        .info-value { font-size: 16px; color: #333; margin-top: 5px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                        th { background-color: #333; color: white; font-weight: bold; }
                        .totals { float: right; width: 300px; }
                        .total-row { display: flex; justify-content: space-between; padding: 10px; font-size: 18px; }
                        .total-row.grand { background: #333; color: white; font-weight: bold; font-size: 20px; }
                        .total-row.paid { background: #4CAF50; color: white; font-weight: bold; }
                        .total-row.balance { background: #FF9800; color: white; font-weight: bold; }
                        .footer { margin-top: 50px; text-align: center; border-top: 2px solid #333; padding-top: 20px; color: #666; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>SALES RECEIPT</h1>
                        <p>Receipt #${sale.id}</p>
                        <p>Date: ${new Date(sale.date).toLocaleDateString()}</p>
                    </div>
                    <div class="info-section">
                        <div class="info-item">
                            <div class="info-label">Customer Name</div>
                            <div class="info-value">${sale.customer_name}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Phone Number</div>
                            <div class="info-value">${sale.phone}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Address</div>
                            <div class="info-value">${sale.address || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Gender</div>
                            <div class="info-value">${sale.gender || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Payment Method</div>
                            <div class="info-value">${sale.payment_method || 'Cash'}</div>
                        </div>
                    </div>
                    ${sale.items && sale.items.length > 0 ? `
                        <h3>Items Purchased</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sale.items.map(item => {
            const productName = getProductName(item.product);
            return `
                                        <tr>
                                            <td>${productName}</td>
                                            <td>${item.qty}</td>
                                            <td>₦${Number(item.price).toLocaleString()}</td>
                                            <td>₦${Number(item.qty * item.price).toLocaleString()}</td>
                                        </tr>
                                    `;
        }).join('')}
                            </tbody>
                        </table>
                    ` : ''}
                    <div class="totals">
                        <div class="total-row grand">
                            <span>Total Amount:</span>
                            <span>₦${Number(sale.total).toLocaleString()}</span>
                        </div>
                        <div class="total-row paid">
                            <span>Amount Paid:</span>
                            <span>₦${Number(sale.amount_paid).toLocaleString()}</span>
                        </div>
                        <div class="total-row balance">
                            <span>Balance:</span>
                            <span>₦${Number(sale.balance).toLocaleString()}</span>
                        </div>
                    </div>
                    <div style="clear: both;"></div>
                    <div class="footer">
                        <p><strong>Thank you for your business!</strong></p>
                        <p>This is a computer-generated receipt.</p>
                    </div>
                    <div class="no-print" style="text-align: center; margin-top: 30px;">
                        <button onclick="window.print()" style="padding: 10px 30px; font-size: 16px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Receipt</button>
                        <button onclick="window.close()" style="padding: 10px 30px; font-size: 16px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const totalPages = Math.ceil(sales.length / perPage);
    const currentSales = sales.slice((page - 1) * perPage, page * perPage);

    if (loading) {
        return (
            <div className="p-6 w-full">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-gray-600">Loading products...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 w-full">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <span className="text-red-500 mr-3">⚠️</span>
                        <span className="text-red-700">{error}</span>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-3 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                        Try Again
                    </button>
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

            {/* Sales Form Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Sale</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Customer Info */}
                    <div className="space-y-6">
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Customer Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Customer Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter customer name"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter phone number"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gender
                                    </label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sale Date
                                    </label>
                                    <input
                                        type="date"
                                        value={saleDate}
                                        onChange={(e) => setSaleDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Add Products</h3>
                            <div className="flex gap-3 mb-4">
                                <select
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={selectedId}
                                    onChange={(e) => setSelectedId(e.target.value)}
                                >
                                    <option value="">Select Product</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} - ₦{Number(product.selling_price || product.price).toLocaleString()}
                                            (Stock: {product.quantity})
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleAdd}
                                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                >
                                    Add
                                </button>
                            </div>

                            {/* Selected Items Display - Individual Text Fields */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Selected Items ({cart.length})
                                </label>

                                {cart.length === 0 ? (
                                    <div className="text-center py-4 text-gray-500">
                                        No items selected yet
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-60 overflow-y-auto p-2">
                                        {cart.map((item) => (
                                            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3">
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                                    {/* Product Name */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                                            Product Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={item.name}
                                                            readOnly
                                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                                                        />
                                                    </div>

                                                    {/* Price */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                                            Price
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={`₦${Number(item.price).toLocaleString()}`}
                                                            readOnly
                                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                                                        />
                                                    </div>

                                                    {/* Quantity - Editable */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                                            Quantity
                                                        </label>
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => handleQtyChange(item.id, item.qty - 1)}
                                                                disabled={item.qty <= 1}
                                                                className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                -
                                                            </button>
                                                            <input
                                                                type="number"
                                                                value={item.qty}
                                                                onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 1)}
                                                                min="1"
                                                                max={item.quantity}
                                                                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                                                            />
                                                            <button
                                                                onClick={() => handleQtyChange(item.id, item.qty + 1)}
                                                                disabled={item.qty >= item.quantity}
                                                                className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Total & Remove */}
                                                    <div className="flex flex-col gap-1">
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                                            Total
                                                        </label>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={`₦${Number(item.price * item.qty).toLocaleString()}`}
                                                                readOnly
                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                                                            />
                                                            <button
                                                                onClick={() => handleRemove(item.id)}
                                                                className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Stock Information */}
                                                <div className="mt-2 text-xs text-gray-500">
                                                    Available stock: {item.quantity} units
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="space-y-6">
                        {cart.length > 0 ? (
                            <div className="bg-gray-50 rounded-lg p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold text-gray-800">Order Summary</h3>
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                        {cart.length} items
                                    </span>
                                </div>

                                <div className="space-y-3 mb-4">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900">{item.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    ₦{Number(item.price).toLocaleString()} × {item.qty}
                                                </div>
                                            </div>
                                            <div className="font-medium text-gray-900">
                                                ₦{Number(item.price * item.qty).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
                                        <span className="text-2xl font-bold text-green-600">
                                            ₦{Number(total).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 italic">
                                        {totalInWords}
                                    </div>
                                    <button
                                        onClick={handleSubmit}
                                        className="w-full mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg"
                                    >
                                        Process Sale
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-8 text-center">
                                <div className="text-4xl mb-4">🛒</div>
                                <h3 className="text-lg font-semibold text-gray-900">Your Cart is Empty</h3>
                                <p className="text-gray-500">Select products to start a sale.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sales History Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentSales.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-gray-50">
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
                                                <div className="flex flex-col space-y-1">
                                                    <button
                                                        onClick={() => setViewModal(sale)}
                                                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors text-xs"
                                                    >
                                                        View
                                                    </button>
                                                    {sale.balance > 0 && (
                                                        <button
                                                            onClick={() => setUpdateBalanceModal(sale)}
                                                            className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded transition-colors text-xs"
                                                        >
                                                            Update Balance
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(sale.id)}
                                                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors text-xs"
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

            {/* All modals remain exactly the same */}
            {/* Confirm Sale Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-800">Confirm Sale</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-600">Customer:</span>
                                    <p className="font-medium">{customerName}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Phone:</span>
                                    <p className="font-medium">{phone}</p>
                                </div>
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-lg font-semibold">Total Amount:</span>
                                    <span className="text-xl font-bold text-green-600">
                                        ₦{Number(total).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-3 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Payment Method *
                                    </label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="receipt_upload">Receipt</option>
                                        <option value="bank_transfer">Transfer</option>
                                        <option value="pos">POS</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="col-span-3 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Amount Paid
                                    </label>
                                    <input
                                        type="number"
                                        value={amountPaid}
                                        onChange={handleAmountPaidChange}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Amount"
                                        min="0"
                                        max={total}
                                    />
                                </div>

                                <div className="col-span-3 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Balance
                                    </label>
                                    <div className={`w-full px-3 py-2 text-sm border rounded-lg font-semibold ${balance > 0
                                        ? 'bg-orange-50 border-orange-200 text-orange-800'
                                        : isOverpayment
                                            ? 'bg-red-50 border-red-200 text-red-800'
                                            : 'bg-green-50 border-green-200 text-green-800'
                                        }`}>
                                        {isOverpayment
                                            ? `-₦${(Number(amountPaid) - total).toLocaleString()}`
                                            : `₦${Number(balance).toLocaleString()}`
                                        }
                                    </div>
                                </div>
                            </div>

                            {isOverpayment && (
                                <div className="col-span-3">
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <div className="flex items-center">
                                            <span className="text-red-500 mr-2">⚠️</span>
                                            <span className="text-red-700 text-sm font-medium">
                                                Overpayment: ₦{(Number(amountPaid) - total).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-red-600 text-xs mt-1">
                                            Amount paid exceeds total amount. Please adjust the payment.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'receipt_upload' && (
                                <div className="col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Upload Receipt *
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                                        {!receiptFile ? (
                                            <div>
                                                <input
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.gif,.pdf"
                                                    onChange={handleReceiptUpload}
                                                    className="hidden"
                                                    id="receipt-upload"
                                                />
                                                <label
                                                    htmlFor="receipt-upload"
                                                    className="cursor-pointer bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors inline-block text-sm"
                                                >
                                                    📎 Choose File
                                                </label>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    JPG, PNG, GIF, PDF (Max 5MB)
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    {receiptPreview ? (
                                                        <img
                                                            src={receiptPreview}
                                                            alt="Receipt preview"
                                                            className="w-10 h-10 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                                            📄
                                                        </div>
                                                    )}
                                                    <div className="text-left">
                                                        <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                                            {receiptFile.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveReceipt}
                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSale}
                                disabled={isOverpayment || (paymentMethod === 'receipt_upload' && !receiptFile)}
                                className="flex-1 bg-green-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 text-sm"
                            >
                                Confirm Sale
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

            {/* View Sale Details Modal */}
            {viewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-800">Sale Details</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
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
                                    <span className="text-sm text-gray-600">Gender:</span>
                                    <p className="font-medium">{viewModal.gender || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Payment Method:</span>
                                    <p className="font-medium">{viewModal.payment_method || 'Cash'}</p>
                                </div>
                                {viewModal.receipt && (
                                    <div className="md:col-span-2">
                                        <span className="text-sm text-gray-600">Receipt:</span>
                                        <div className="mt-1">
                                            <a
                                                href={viewModal.receipt}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 underline flex items-center space-x-1"
                                            >
                                                <span>📎 View Uploaded Receipt</span>
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="border-t pt-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Total Amount:</span>
                                        <span className="font-semibold">₦{Number(viewModal.total).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
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
                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-2">Items Sold:</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {viewModal.items && viewModal.items.length > 0 ? (
                                        viewModal.items.map((item, index) => {
                                            const productName = getProductName(item.product);
                                            const quantity = item.qty || item.quantity || 1;
                                            const price = item.price || item.unit_price || 0;

                                            return (
                                                <div key={index} className="flex justify-between text-sm">
                                                    <span className="flex-1">{productName}</span>
                                                    <span className="ml-2">{quantity} × ₦{Number(price).toLocaleString()}</span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-gray-500 text-sm">No items found</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => handlePrint(viewModal)}
                                className="flex-1 bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                🖨️ Print Receipt
                            </button>
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

export default Orders;