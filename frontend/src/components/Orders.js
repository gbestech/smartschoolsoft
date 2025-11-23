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

//     // Refund & Negotiation States
//     const [refundModal, setRefundModal] = useState(null);
//     const [refundReason, setRefundReason] = useState("");
//     const [refundAmount, setRefundAmount] = useState("");
//     const [negotiateModal, setNegotiateModal] = useState(null);
//     const [negotiatedPrice, setNegotiatedPrice] = useState("");
//     const [refundItems, setRefundItems] = useState([]);
//     const [partialRefund, setPartialRefund] = useState(false);
//     const [selectedRefundItems, setSelectedRefundItems] = useState([]);

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

//     const total = cart.reduce((sum, item) => sum + (item.negotiatedPrice || item.price) * item.qty, 0);
//     const balance = amountPaid ? Math.max(total - Number(amountPaid), 0) : total;
//     const totalInWords = total > 0 ? `${toWords(total)} Naira Only` : "";
//     const isOverpayment = Number(amountPaid) > total;

//     // Create product map for easy lookup
//     const productMap = {};
//     products.forEach(product => {
//         productMap[product.id] = product;
//     });

//     const getProductName = (productId) => {
//         return productMap[productId]?.name || `Product ${productId}`;
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
//                 price: product.selling_price || product.price,
//                 costPrice: product.cost_price || product.price,
//                 negotiatedPrice: null,
//                 isNegotiated: false
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

//     // Open negotiate modal
//     const handleNegotiate = (item) => {
//         setNegotiateModal(item);
//         setNegotiatedPrice(item.negotiatedPrice || item.price);
//     };

//     // Confirm negotiated price
//     const confirmNegotiatedPrice = () => {
//         if (!negotiatedPrice || Number(negotiatedPrice) <= 0) {
//             toast.error("Please enter a valid price.");
//             return;
//         }

//         const costPrice = negotiateModal.costPrice || negotiateModal.price;
//         if (Number(negotiatedPrice) < costPrice) {
//             toast.error(`Price cannot be less than cost price (₦${costPrice.toLocaleString()})`);
//             return;
//         }

//         setCart(
//             cart.map((item) =>
//                 item.id === negotiateModal.id
//                     ? {
//                         ...item,
//                         negotiatedPrice: Number(negotiatedPrice),
//                         isNegotiated: true
//                     }
//                     : item
//             )
//         );

//         toast.success(`Price negotiated for ${negotiateModal.name}: ₦${Number(negotiatedPrice).toLocaleString()}`);
//         setNegotiateModal(null);
//         setNegotiatedPrice("");
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

//     // Handle amount paid change
//     const handleAmountPaidChange = (e) => {
//         const value = e.target.value;
//         setAmountPaid(value);
//     };

//     // FIXED: Enhanced Confirm Sale function
//     const confirmSale = async () => {
//         try {
//             // Validation
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

//             const actualAmountPaid = Number(amountPaid) || 0;
//             if (actualAmountPaid > total) {
//                 toast.error(`❌ Cannot process sale! Amount paid (₦${actualAmountPaid.toLocaleString()}) exceeds total (₦${total.toLocaleString()})`);
//                 return;
//             }

//             const token = localStorage.getItem('token');
//             if (!token) {
//                 toast.error("Authentication token not found. Please log in again.");
//                 return;
//             }

//             const calculatedBalance = Math.max(total - actualAmountPaid, 0);

//             // Show payment confirmation
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

//             // Prepare sale data
//             const saleData = {
//                 customer_name: customerName.trim(),
//                 address: address.trim() || "Not provided",
//                 phone: phone.trim(),
//                 gender: gender || "",
//                 date: saleDate,
//                 amount_paid: actualAmountPaid,
//                 payment_method: paymentMethod,
//                 balance: calculatedBalance,
//                 total: total,
//                 items: cart.map(item => ({
//                     product: item.id,
//                     qty: item.qty,
//                     price: parseFloat(item.negotiatedPrice || item.price),
//                     original_price: parseFloat(item.price),
//                     is_negotiated: item.isNegotiated,
//                     negotiated_price: item.isNegotiated ? parseFloat(item.negotiatedPrice) : null
//                 }))
//             };

//             console.log("Creating sale with data:", saleData);

//             // Create FormData for file upload
//             const formData = new FormData();

//             // Append all sale data
//             Object.keys(saleData).forEach(key => {
//                 if (key === 'items') {
//                     saleData.items.forEach((item, index) => {
//                         Object.keys(item).forEach(itemKey => {
//                             if (item[itemKey] !== null) {
//                                 formData.append(`items[${index}]${itemKey}`, item[itemKey]);
//                             }
//                         });
//                     });
//                 } else {
//                     formData.append(key, saleData[key]);
//                 }
//             });

//             if (receiptFile) {
//                 formData.append('receipt', receiptFile);
//             }

//             // Make API call
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

//             // Close modal first
//             setShowModal(false);

//             // Show success message
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
//             resetForm();

//             // Refresh data
//             await Promise.all([fetchSales(), fetchProducts()]);

//         } catch (err) {
//             console.error("Sale creation error:", err);
//             let errorMessage = "Failed to create sale: ";

//             if (err.response?.data) {
//                 const errorData = err.response.data;

//                 if (typeof errorData === 'object') {
//                     // Handle field errors
//                     if (errorData.non_field_errors) {
//                         errorMessage += errorData.non_field_errors.join(', ');
//                     } else {
//                         Object.keys(errorData).forEach(key => {
//                             const fieldErrors = Array.isArray(errorData[key])
//                                 ? errorData[key].join(', ')
//                                 : errorData[key];
//                             errorMessage += `${key}: ${fieldErrors} `;
//                         });
//                     }
//                 } else {
//                     errorMessage += errorData;
//                 }
//             } else if (err.request) {
//                 errorMessage += 'No response received from server. Please check your connection.';
//             } else {
//                 errorMessage += err.message || 'Unknown error occurred';
//             }

//             toast.error(`❌ ${errorMessage}`);
//         }
//     };

//     // Reset form function
//     const resetForm = () => {
//         setCart([]);
//         setCustomerName("");
//         setAddress("");
//         setPhone("");
//         setGender("");
//         setAmountPaid("");
//         setPaymentMethod("cash");
//         setReceiptFile(null);
//         setReceiptPreview(null);
//         setSaleDate(new Date().toISOString().slice(0, 10));
//         setSelectedId("");
//     };

//     // Update balance
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

//             await axios.put(
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

//     // ENHANCED: Refund Handler with Better Permission Handling
//     const handleRefund = async () => {
//         if (!refundReason.trim()) {
//             toast.error("Please provide a reason for the refund.");
//             return;
//         }

//         if (!refundAmount || Number(refundAmount) <= 0) {
//             toast.error("Please enter a valid refund amount.");
//             return;
//         }

//         if (Number(refundAmount) > Number(refundModal.amount_paid)) {
//             toast.error(`❌ Refund amount (₦${Number(refundAmount).toLocaleString()}) cannot exceed amount paid (₦${Number(refundModal.amount_paid).toLocaleString()})`);
//             return;
//         }

//         try {
//             const token = localStorage.getItem('token');
//             if (!token) {
//                 toast.error("Authentication token not found. Please log in again.");
//                 return;
//             }

//             // Prepare refund data
//             const refundData = {
//                 sale: refundModal.id,
//                 reason: refundReason.trim(),
//                 refund_amount: parseFloat(refundAmount),
//                 refund_date: new Date().toISOString().slice(0, 10),
//                 items_refunded: partialRefund ? selectedRefundItems : refundModal.items,
//                 processed_by: "admin" // You might want to get this from user context
//             };

//             console.log("Processing refund with data:", refundData);

//             // First, try to create the refund record
//             let refundResponse;
//             try {
//                 refundResponse = await axios.post(
//                     "http://127.0.0.1:8000/api/sales/refunds/",
//                     refundData,
//                     {
//                         headers: {
//                             'Authorization': `Token ${token}`,
//                             'Content-Type': 'application/json'
//                         }
//                     }
//                 );
//                 console.log("Refund created successfully:", refundResponse.data);
//             } catch (refundErr) {
//                 console.error("Refund creation failed:", refundErr);

//                 // If refund endpoint doesn't exist or has permission issues, handle sale update directly
//                 if (refundErr.response?.status === 404 || refundErr.response?.status === 403) {
//                     console.log("Refund endpoint not available, updating sale directly");
//                     // Continue with sale update even if refund record fails
//                 } else {
//                     throw refundErr; // Re-throw other errors
//                 }
//             }

//             // Restore product quantities
//             const itemsToRestore = partialRefund ? selectedRefundItems : refundModal.items;
//             const restorePromises = [];

//             for (const item of itemsToRestore) {
//                 const product = productMap[item.product];
//                 if (product) {
//                     const quantityToRestore = item.qty || item.quantity || 1;
//                     const newQuantity = product.quantity + quantityToRestore;

//                     restorePromises.push(
//                         axios.put(
//                             `http://127.0.0.1:8000/api/products/${product.id}/`,
//                             {
//                                 quantity: newQuantity
//                             },
//                             {
//                                 headers: {
//                                     'Authorization': `Token ${token}`,
//                                     'Content-Type': 'application/json'
//                                 }
//                             }
//                         )
//                     );
//                 }
//             }

//             // Wait for all product updates to complete
//             await Promise.all(restorePromises);

//             // Update sale status
//             const updatedAmountPaid = Number(refundModal.amount_paid) - Number(refundAmount);
//             const isFullyRefunded = updatedAmountPaid === 0;

//             await axios.put(
//                 `http://127.0.0.1:8000/api/sales/sales/${refundModal.id}/`,
//                 {
//                     is_refunded: isFullyRefunded,
//                     is_partially_refunded: !isFullyRefunded && updatedAmountPaid > 0,
//                     refund_reason: refundReason.trim(),
//                     amount_paid: Math.max(updatedAmountPaid, 0),
//                     balance: isFullyRefunded ? 0 : refundModal.balance,
//                     status: isFullyRefunded ? 'refunded' : 'partially_refunded'
//                 },
//                 {
//                     headers: {
//                         'Authorization': `Token ${token}`,
//                         'Content-Type': 'application/json'
//                     }
//                 }
//             );

//             // Success message
//             let successMessage = `✅ Refund of ₦${Number(refundAmount).toLocaleString()} processed successfully! `;
//             if (partialRefund && selectedRefundItems.length > 0) {
//                 successMessage += `${selectedRefundItems.length} product(s) restocked.`;
//             } else if (!partialRefund) {
//                 successMessage += "All products restocked.";
//             }

//             toast.success(successMessage, {
//                 position: "top-center",
//                 autoClose: 5000,
//             });

//             // Reset state
//             setRefundModal(null);
//             setRefundReason("");
//             setRefundAmount("");
//             setRefundItems([]);
//             setSelectedRefundItems([]);
//             setPartialRefund(false);

//             // Refresh data
//             await Promise.all([fetchSales(), fetchProducts()]);

//         } catch (err) {
//             console.error("Refund processing error:", err);

//             let errorMessage = "Failed to process refund: ";

//             if (err.response?.status === 403) {
//                 errorMessage = "❌ Permission denied: You don't have permission to process refunds. Please contact administrator.";
//             } else if (err.response?.status === 404) {
//                 errorMessage = "❌ Refund endpoint not found. Please check API configuration.";
//             } else if (err.response?.data) {
//                 const errorData = err.response.data;

//                 if (typeof errorData === 'object') {
//                     Object.keys(errorData).forEach(key => {
//                         const fieldErrors = Array.isArray(errorData[key])
//                             ? errorData[key].join(', ')
//                             : errorData[key];
//                         errorMessage += `${key}: ${fieldErrors} `;
//                     });
//                 } else {
//                     errorMessage += errorData;
//                 }
//             } else if (err.request) {
//                 errorMessage += "No response from server. Please check your connection.";
//             } else {
//                 errorMessage += err.message || "Unknown error occurred";
//             }

//             toast.error(errorMessage, {
//                 position: "top-center",
//                 autoClose: 6000,
//             });
//         }
//     };

//     // Initialize refund modal
//     const openRefundModal = (sale) => {
//         setRefundModal(sale);
//         setRefundReason("");
//         setRefundAmount("");
//         setRefundItems(sale.items || []);
//         setSelectedRefundItems([]);
//         setPartialRefund(false);
//     };

//     // Handle refund item selection
//     const handleRefundItemSelect = (item, isSelected) => {
//         if (isSelected) {
//             setSelectedRefundItems(prev => [...prev, item]);
//         } else {
//             setSelectedRefundItems(prev => prev.filter(i =>
//                 i.product !== item.product && i.quantity !== item.quantity
//             ));
//         }
//     };

//     // Calculate refund amount based on selected items
//     const calculateRefundFromItems = () => {
//         if (selectedRefundItems.length === 0) return 0;

//         return selectedRefundItems.reduce((total, item) => {
//             const price = item.negotiated_price || item.price;
//             const quantity = item.qty || item.quantity || 1;
//             return total + (price * quantity);
//         }, 0);
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

//             setSales(prevSales => prevSales.filter((s) => s.id !== id));
//             await fetchSales();

//         } catch (err) {
//             console.error("Delete error:", err);
//             toast.error(`❌ Failed to delete sale: ${err.response?.data?.detail || err.message}`);
//         }
//     };

//     // ENHANCED: Print receipt with wider layout
//     const handlePrint = (sale) => {
//         const printWindow = window.open('', '', 'height=700,width=1000');
//         printWindow.document.write(`
//             <html>
//                 <head>
//                     <title>Receipt - ${sale.customer_name}</title>
//                     <style>
//                         body {
//                             font-family: Arial, sans-serif;
//                             padding: 25px;
//                             max-width: 900px;
//                             margin: 0 auto;
//                             font-size: 14px;
//                         }
//                         .header {
//                             text-align: center;
//                             border-bottom: 3px solid #333;
//                             padding-bottom: 25px;
//                             margin-bottom: 25px;
//                         }
//                         .header h1 {
//                             margin: 0;
//                             color: #333;
//                             font-size: 28px;
//                         }
//                         .info-section {
//                             display: grid;
//                             grid-template-columns: 1fr 1fr;
//                             gap: 15px;
//                             margin-bottom: 30px;
//                         }
//                         .info-item {
//                             padding: 12px;
//                             background: #f8f9fa;
//                             border-radius: 8px;
//                             border: 1px solid #e9ecef;
//                         }
//                         .info-label {
//                             font-weight: bold;
//                             color: #495057;
//                             font-size: 12px;
//                             text-transform: uppercase;
//                         }
//                         .info-value {
//                             font-size: 16px;
//                             color: #212529;
//                             margin-top: 5px;
//                             font-weight: 600;
//                         }
//                         table {
//                             width: 100%;
//                             border-collapse: collapse;
//                             margin-bottom: 25px;
//                             font-size: 14px;
//                         }
//                         th, td {
//                             padding: 14px;
//                             text-align: left;
//                             border-bottom: 1px solid #dee2e6;
//                         }
//                         th {
//                             background-color: #343a40;
//                             color: white;
//                             font-weight: bold;
//                             font-size: 14px;
//                         }
//                         .totals {
//                             float: right;
//                             width: 350px;
//                             margin-top: 20px;
//                         }
//                         .total-row {
//                             display: flex;
//                             justify-content: space-between;
//                             padding: 12px;
//                             font-size: 16px;
//                             border-bottom: 1px solid #dee2e6;
//                         }
//                         .total-row.grand {
//                             background: #343a40;
//                             color: white;
//                             font-weight: bold;
//                             font-size: 18px;
//                             border-radius: 8px;
//                         }
//                         .total-row.paid {
//                             background: #28a745;
//                             color: white;
//                             font-weight: bold;
//                             border-radius: 8px;
//                         }
//                         .total-row.balance {
//                             background: #fd7e14;
//                             color: white;
//                             font-weight: bold;
//                             border-radius: 8px;
//                         }
//                         .footer {
//                             margin-top: 60px;
//                             text-align: center;
//                             border-top: 2px solid #343a40;
//                             padding-top: 25px;
//                             color: #6c757d;
//                             font-size: 13px;
//                         }
//                         .negotiated {
//                             color: #e83e8c;
//                             font-weight: bold;
//                         }
//                         .original-price {
//                             text-decoration: line-through;
//                             color: #6c757d;
//                             font-size: 0.85em;
//                         }
//                         .refunded {
//                             background: #f8d7da !important;
//                         }
//                         .items-section {
//                             margin-bottom: 30px;
//                         }
//                         .items-section h3 {
//                             color: #495057;
//                             border-bottom: 2px solid #dee2e6;
//                             padding-bottom: 10px;
//                             margin-bottom: 15px;
//                         }
//                         @media print {
//                             .no-print { display: none; }
//                             body { padding: 15px; }
//                         }
//                         .receipt-number {
//                             font-size: 16px;
//                             color: #6c757d;
//                             margin-top: 5px;
//                         }
//                     </style>
//                 </head>
//                 <body>
//                     <div class="header">
//                         <h1>SALES RECEIPT</h1>
//                         <div class="receipt-number">Receipt #${sale.id}</div>
//                         <div class="receipt-number">Date: ${new Date(sale.date).toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//         })}</div>
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
//                             <div class="info-value">${sale.address || 'Not Provided'}</div>
//                         </div>
//                         <div class="info-item">
//                             <div class="info-label">Gender</div>
//                             <div class="info-value">${sale.gender || 'Not Provided'}</div>
//                         </div>
//                         <div class="info-item">
//                             <div class="info-label">Payment Method</div>
//                             <div class="info-value" style="text-transform: capitalize;">${(sale.payment_method || 'cash').replace('_', ' ')}</div>
//                         </div>
//                         <div class="info-item">
//                             <div class="info-label">Sale Status</div>
//                             <div class="info-value">
//                                 ${sale.is_refunded ?
//                 '<span style="color: #dc3545; font-weight: bold;">REFUNDED</span>' :
//                 sale.is_partially_refunded ?
//                     '<span style="color: #fd7e14; font-weight: bold;">PARTIALLY REFUNDED</span>' :
//                     '<span style="color: #28a745; font-weight: bold;">COMPLETED</span>'
//             }
//                             </div>
//                         </div>
//                     </div>

//                     <div class="items-section">
//                         <h3>ITEMS PURCHASED</h3>
//                         ${sale.items && sale.items.length > 0 ? `
//                             <table>
//                                 <thead>
//                                     <tr>
//                                         <th style="width: 40%;">Product</th>
//                                         <th style="width: 15%;">Quantity</th>
//                                         <th style="width: 20%;">Unit Price</th>
//                                         <th style="width: 25%;">Total</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     ${sale.items.map(item => {
//                 const productName = getProductName(item.product);
//                 const isNegotiated = item.is_negotiated || item.negotiated_price;
//                 const displayPrice = isNegotiated ? (item.negotiated_price || item.price) : item.price;
//                 const originalPrice = item.original_price || item.price;
//                 const quantity = item.qty || item.quantity || 1;

//                 return `
//                                             <tr>
//                                                 <td>${productName}</td>
//                                                 <td>${quantity}</td>
//                                                 <td>
//                                                     ${isNegotiated ? `
//                                                         <div class="negotiated">₦${Number(displayPrice).toLocaleString()}</div>
//                                                         <div class="original-price">₦${Number(originalPrice).toLocaleString()}</div>
//                                                     ` : `₦${Number(displayPrice).toLocaleString()}`}
//                                                 </td>
//                                                 <td><strong>₦${Number(quantity * displayPrice).toLocaleString()}</strong></td>
//                                             </tr>
//                                         `;
//             }).join('')}
//                                 </tbody>
//                             </table>
//                         ` : '<p>No items found</p>'}
//                     </div>
                    
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
                    
//                     ${sale.is_refunded ? `
//                         <div style="background: #f8d7da; border: 2px solid #dc3545; padding: 20px; margin-top: 25px; border-radius: 8px; text-align: center;">
//                             <h3 style="color: #dc3545; margin: 0;">⚠️ FULLY REFUNDED</h3>
//                             <p style="color: #721c24; margin: 10px 0 0 0; font-weight: 600;">Reason: ${sale.refund_reason || 'Not specified'}</p>
//                             <p style="color: #721c24; margin: 5px 0 0 0;">Refund Amount: ₦${Number(sale.amount_paid).toLocaleString()}</p>
//                         </div>
//                     ` : ''}
                    
//                     ${sale.is_partially_refunded ? `
//                         <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 20px; margin-top: 25px; border-radius: 8px; text-align: center;">
//                             <h3 style="color: #856404; margin: 0;">⚠️ PARTIALLY REFUNDED</h3>
//                             <p style="color: #856404; margin: 10px 0 0 0; font-weight: 600;">Reason: ${sale.refund_reason || 'Not specified'}</p>
//                         </div>
//                     ` : ''}
                    
//                     <div class="footer">
//                         <p style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Thank you for your business!</p>
//                         <p>This is a computer-generated receipt. No signature required.</p>
//                         <p style="margin-top: 10px;">For inquiries, please contact support.</p>
//                     </div>
                    
//                     <div class="no-print" style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6;">
//                         <button onclick="window.print()" style="padding: 12px 35px; font-size: 16px; background: #343a40; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 10px;">Print Receipt</button>
//                         <button onclick="window.close()" style="padding: 12px 35px; font-size: 16px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">Close Window</button>
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
//                             <div className="flex gap-3 mb-4">
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

//                             {/* Selected Items Display */}
//                             <div className="space-y-3">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Selected Items ({cart.length})
//                                 </label>

//                                 {cart.length === 0 ? (
//                                     <div className="text-center py-4 text-gray-500">
//                                         No items selected yet
//                                     </div>
//                                 ) : (
//                                     <div className="space-y-3 max-h-60 overflow-y-auto p-2">
//                                         {cart.map((item) => (
//                                             <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3">
//                                                 <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
//                                                     {/* Product Name */}
//                                                     <div>
//                                                         <label className="block text-xs font-medium text-gray-500 mb-1">
//                                                             Product/N
//                                                         </label>
//                                                         <input
//                                                             type="text"
//                                                             value={item.name}
//                                                             readOnly
//                                                             className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
//                                                         />
//                                                     </div>

//                                                     {/* Price */}
//                                                     <div>
//                                                         <label className="block text-xs font-medium text-gray-500 mb-1">
//                                                             {item.isNegotiated ? "Negotiated Price" : "Price"}
//                                                         </label>
//                                                         <div className="flex gap-1">
//                                                             <input
//                                                                 type="text"
//                                                                 value={`₦${Number(item.negotiatedPrice || item.price).toLocaleString()}`}
//                                                                 readOnly
//                                                                 className={`flex-1 px-3 py-2 border rounded text-sm bg-gray-50 ${item.isNegotiated
//                                                                     ? 'border-pink-300 bg-pink-50 text-pink-700'
//                                                                     : 'border-gray-300'
//                                                                     }`}
//                                                             />
//                                                             <button
//                                                                 onClick={() => handleNegotiate(item)}
//                                                                 className="px-2 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors"
//                                                                 title="Negotiate Price"
//                                                             >
//                                                                 💬
//                                                             </button>
//                                                         </div>
//                                                         {item.isNegotiated && (
//                                                             <div className="text-xs text-gray-500 mt-1">
//                                                                 Original: ₦{Number(item.price).toLocaleString()}
//                                                             </div>
//                                                         )}
//                                                     </div>

//                                                     {/* Quantity - Editable */}
//                                                     <div>
//                                                         <label className="block text-xs font-medium text-gray-500 mb-1">
//                                                             Qty
//                                                         </label>
//                                                         <div className="flex gap-1">
//                                                             <button
//                                                                 onClick={() => handleQtyChange(item.id, item.qty - 1)}
//                                                                 disabled={item.qty <= 1}
//                                                                 className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
//                                                             >
//                                                                 -
//                                                             </button>
//                                                             <input
//                                                                 type="number"
//                                                                 value={item.qty}
//                                                                 onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 1)}
//                                                                 min="1"
//                                                                 max={item.quantity}
//                                                                 className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
//                                                             />
//                                                             <button
//                                                                 onClick={() => handleQtyChange(item.id, item.qty + 1)}
//                                                                 disabled={item.qty >= item.quantity}
//                                                                 className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
//                                                             >
//                                                                 +
//                                                             </button>
//                                                         </div>
//                                                     </div>
//                                                     <div>
//                                                         <label className="block text-xs font-medium text-gray-500 mb-1">
//                                                             Q/in Stock
//                                                         </label>
//                                                         <input
//                                                             type="text"
//                                                             value={`${Number(item.quantity).toLocaleString()}`}
//                                                             readOnly
//                                                             className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
//                                                         />
//                                                     </div>
//                                                     {/* Total & Remove */}
//                                                     <div className="flex flex-col gap-1">
//                                                         <label className="block text-xs font-medium text-gray-500 mb-1">
//                                                             Total
//                                                         </label>
//                                                         <div className="flex items-center gap-2">
//                                                             <input
//                                                                 type="text"
//                                                                 value={`₦${Number((item.negotiatedPrice || item.price) * item.qty).toLocaleString()}`}
//                                                                 readOnly
//                                                                 className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
//                                                             />
//                                                             <button
//                                                                 onClick={() => handleRemove(item.id)}
//                                                                 className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
//                                                             >
//                                                                 ✕
//                                                             </button>
//                                                         </div>
//                                                     </div>
//                                                 </div>

//                                                 {/* Stock Information */}
//                                                 <div className="mt-2 text-xs text-gray-500">
//                                                     Available stock: {item.quantity} units
//                                                     {item.costPrice && ` | Cost: ₦${Number(item.costPrice).toLocaleString()}`}
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Right Column - Order Summary */}
//                     <div className="space-y-2">
//                         {cart.length > 0 ? (
//                             <div className="bg-gray-50 rounded-lg p-6">
//                                 <div className="flex justify-between items-center mb-4">
//                                     <h3 className="text-xl font-semibold text-gray-800">Order Summary</h3>
//                                     <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
//                                         {cart.length} items
//                                     </span>
//                                 </div>

//                                 <div className="space-y-3 mb-4">
//                                     {cart.map((item) => (
//                                         <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
//                                             <div className="flex-1">
//                                                 <div className="font-medium text-gray-900">{item.name}</div>
//                                                 <div className="text-sm text-gray-500">
//                                                     {item.isNegotiated ? (
//                                                         <>
//                                                             <span className="text-pink-600">₦{Number(item.negotiatedPrice).toLocaleString()}</span>
//                                                             <span className="text-gray-400 line-through ml-1">₦{Number(item.price).toLocaleString()}</span>
//                                                         </>
//                                                     ) : (
//                                                         `₦${Number(item.price).toLocaleString()}`
//                                                     )} × {item.qty}
//                                                 </div>
//                                             </div>
//                                             <div className="font-medium text-gray-900">
//                                                 ₦{Number((item.negotiatedPrice || item.price) * item.qty).toLocaleString()}
//                                             </div>
//                                         </div>
//                                     ))}
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
//                                 <h3 className="text-lg font-semibold text-gray-900">Your Cart is Empty</h3>
//                                 <p className="text-gray-500">Select products to start a sale.</p>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Sales History Section */}
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
//                                                         onClick={() => setViewModal(sale)}
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
//                                                     {!sale.is_refunded && sale.amount_paid > 0 && (
//                                                         <button
//                                                             onClick={() => openRefundModal(sale)}
//                                                             className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors text-xs"
//                                                         >
//                                                             Refund
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

//             {/* CONFIRM SALE MODAL */}
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

//                             {/* Payment Information */}
//                             <div className="grid grid-cols-3 gap-3">
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

//             {/* REFUND MODAL */}
//             {refundModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//                         <div className="p-6 border-b border-gray-200">
//                             <h3 className="text-xl font-semibold text-gray-800">Process Refund</h3>
//                         </div>
//                         <div className="p-6">
//                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                                 {/* Left Column - Warning and Basic Info */}
//                                 <div className="space-y-4">
//                                     <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                                         <div className="flex items-center mb-2">
//                                             <span className="text-red-500 mr-2">⚠️</span>
//                                             <span className="text-red-800 font-semibold">Refund Warning</span>
//                                         </div>
//                                         <p className="text-red-700 text-sm">
//                                             This action will refund the sale and restore product quantities to inventory. This action cannot be undone.
//                                         </p>
//                                     </div>

//                                     <div className="bg-gray-50 rounded-lg p-4">
//                                         <h4 className="font-semibold text-gray-800 mb-3">Sale Information</h4>
//                                         <div className="space-y-2">
//                                             <div className="flex justify-between">
//                                                 <span className="text-gray-600">Customer:</span>
//                                                 <span className="font-medium">{refundModal.customer_name}</span>
//                                             </div>
//                                             <div className="flex justify-between">
//                                                 <span className="text-gray-600">Sale Date:</span>
//                                                 <span className="font-medium">{new Date(refundModal.date).toLocaleDateString()}</span>
//                                             </div>
//                                             <div className="flex justify-between">
//                                                 <span className="text-gray-600">Total Amount:</span>
//                                                 <span className="font-medium">₦{Number(refundModal.total).toLocaleString()}</span>
//                                             </div>
//                                             <div className="flex justify-between">
//                                                 <span className="text-gray-600">Amount Paid:</span>
//                                                 <span className="text-green-600 font-medium">₦{Number(refundModal.amount_paid).toLocaleString()}</span>
//                                             </div>
//                                             <div className="flex justify-between">
//                                                 <span className="text-gray-600">Balance:</span>
//                                                 <span className={`font-medium ${refundModal.balance > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
//                                                     ₦{Number(refundModal.balance).toLocaleString()}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Refund Type Selection */}
//                                     <div className="bg-white border border-gray-200 rounded-lg p-4">
//                                         <h4 className="font-semibold text-gray-800 mb-3">Refund Type</h4>
//                                         <div className="space-y-2">
//                                             <label className="flex items-center">
//                                                 <input
//                                                     type="radio"
//                                                     name="refundType"
//                                                     checked={!partialRefund}
//                                                     onChange={() => setPartialRefund(false)}
//                                                     className="mr-2"
//                                                 />
//                                                 <span>Full Refund (All Items)</span>
//                                             </label>
//                                             <label className="flex items-center">
//                                                 <input
//                                                     type="radio"
//                                                     name="refundType"
//                                                     checked={partialRefund}
//                                                     onChange={() => setPartialRefund(true)}
//                                                     className="mr-2"
//                                                 />
//                                                 <span>Partial Refund (Select Items)</span>
//                                             </label>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Right Column - Refund Details */}
//                                 <div className="space-y-4">
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                                             Refund Amount *
//                                         </label>
//                                         <input
//                                             type="number"
//                                             value={refundAmount}
//                                             onChange={(e) => setRefundAmount(e.target.value)}
//                                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
//                                             placeholder="Enter refund amount"
//                                             min="0"
//                                             max={refundModal.amount_paid}
//                                         />
//                                         <p className="text-xs text-gray-500 mt-1">
//                                             Maximum refundable: ₦{Number(refundModal.amount_paid).toLocaleString()}
//                                         </p>
//                                     </div>

//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                                             Refund Reason *
//                                         </label>
//                                         <textarea
//                                             value={refundReason}
//                                             onChange={(e) => setRefundReason(e.target.value)}
//                                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
//                                             placeholder="Please provide a detailed reason for the refund..."
//                                             rows="4"
//                                             required
//                                         />
//                                     </div>

//                                     {/* Items Selection for Partial Refund */}
//                                     {partialRefund && refundModal.items && refundModal.items.length > 0 && (
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                                 Select Items to Refund
//                                             </label>
//                                             <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
//                                                 {refundModal.items.map((item, index) => {
//                                                     const productName = getProductName(item.product);
//                                                     const quantity = item.qty || item.quantity || 1;
//                                                     const price = item.negotiated_price || item.price;
//                                                     const totalPrice = price * quantity;
//                                                     const isSelected = selectedRefundItems.some(selected =>
//                                                         selected.product === item.product && selected.quantity === quantity
//                                                     );

//                                                     return (
//                                                         <label key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
//                                                             <div className="flex items-center space-x-3">
//                                                                 <input
//                                                                     type="checkbox"
//                                                                     checked={isSelected}
//                                                                     onChange={(e) => handleRefundItemSelect(item, e.target.checked)}
//                                                                     className="rounded"
//                                                                 />
//                                                                 <div>
//                                                                     <div className="font-medium text-sm">{productName}</div>
//                                                                     <div className="text-xs text-gray-500">
//                                                                         {quantity} × ₦{Number(price).toLocaleString()} = ₦{Number(totalPrice).toLocaleString()}
//                                                                         {item.is_negotiated && (
//                                                                             <span className="text-pink-600 ml-2">(Negotiated)</span>
//                                                                         )}
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                             <div className="text-sm font-medium">
//                                                                 ₦{Number(totalPrice).toLocaleString()}
//                                                             </div>
//                                                         </label>
//                                                     );
//                                                 })}
//                                             </div>
//                                             {selectedRefundItems.length > 0 && (
//                                                 <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
//                                                     <div className="flex justify-between text-sm">
//                                                         <span>Selected Items Total:</span>
//                                                         <span className="font-bold">₦{Number(calculateRefundFromItems()).toLocaleString()}</span>
//                                                     </div>
//                                                     <button
//                                                         type="button"
//                                                         onClick={() => setRefundAmount(calculateRefundFromItems().toString())}
//                                                         className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
//                                                     >
//                                                         Use this amount for refund
//                                                     </button>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     )}

//                                     {/* Products to Restock */}
//                                     {refundModal.items && refundModal.items.length > 0 && (
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                                 Products to Restock
//                                             </label>
//                                             <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
//                                                 {(partialRefund ? selectedRefundItems : refundModal.items).map((item, index) => {
//                                                     const productName = getProductName(item.product);
//                                                     const quantity = item.qty || item.quantity || 1;
//                                                     const currentStock = productMap[item.product]?.quantity || 0;

//                                                     return (
//                                                         <div key={index} className="flex justify-between text-sm bg-white p-2 rounded border">
//                                                             <span className="font-medium">{productName}</span>
//                                                             <span className="text-green-600">
//                                                                 +{quantity} units (was {currentStock})
//                                                             </span>
//                                                         </div>
//                                                     );
//                                                 })}
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="flex gap-3 p-6 border-t border-gray-200">
//                             <button
//                                 onClick={() => {
//                                     setRefundModal(null);
//                                     setRefundReason("");
//                                     setRefundAmount("");
//                                     setRefundItems([]);
//                                     setSelectedRefundItems([]);
//                                     setPartialRefund(false);
//                                 }}
//                                 className="flex-1 bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleRefund}
//                                 disabled={!refundReason.trim() || !refundAmount || Number(refundAmount) <= 0 || (partialRefund && selectedRefundItems.length === 0)}
//                                 className="flex-1 bg-red-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                             >
//                                 Process Refund
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* NEGOTIATE PRICE MODAL */}
//             {negotiateModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
//                         <div className="p-6 border-b border-gray-200">
//                             <h3 className="text-xl font-semibold text-gray-800">Negotiate Price</h3>
//                         </div>
//                         <div className="p-6 space-y-4">
//                             <div className="bg-gray-50 rounded-lg p-4">
//                                 <h4 className="font-semibold text-gray-800 mb-2">{negotiateModal.name}</h4>
//                                 <div className="grid grid-cols-2 gap-2 text-sm">
//                                     <div>
//                                         <span className="text-gray-600">Current Price:</span>
//                                         <p className="font-medium">₦{Number(negotiateModal.price).toLocaleString()}</p>
//                                     </div>
//                                     <div>
//                                         <span className="text-gray-600">Cost Price:</span>
//                                         <p className="font-medium text-red-600">₦{Number(negotiateModal.costPrice || negotiateModal.price).toLocaleString()}</p>
//                                     </div>
//                                     <div>
//                                         <span className="text-gray-600">Stock:</span>
//                                         <p className="font-medium">{negotiateModal.quantity} units</p>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Negotiated Price *
//                                 </label>
//                                 <input
//                                     type="number"
//                                     value={negotiatedPrice}
//                                     onChange={(e) => setNegotiatedPrice(e.target.value)}
//                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//                                     placeholder="Enter negotiated price"
//                                     min={negotiateModal.costPrice || negotiateModal.price}
//                                     step="0.01"
//                                 />
//                                 <p className="text-xs text-gray-500 mt-1">
//                                     Minimum price: ₦{Number(negotiateModal.costPrice || negotiateModal.price).toLocaleString()}
//                                 </p>
//                             </div>

//                             {negotiatedPrice && (
//                                 <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
//                                     <div className="flex justify-between text-sm">
//                                         <span>Original Price:</span>
//                                         <span className="line-through">₦{Number(negotiateModal.price).toLocaleString()}</span>
//                                     </div>
//                                     <div className="flex justify-between text-sm font-semibold">
//                                         <span>Negotiated Price:</span>
//                                         <span className="text-purple-600">₦{Number(negotiatedPrice).toLocaleString()}</span>
//                                     </div>
//                                     <div className="flex justify-between text-sm">
//                                         <span>Discount:</span>
//                                         <span className="text-green-600">
//                                             -₦{Number(negotiateModal.price - negotiatedPrice).toLocaleString()}
//                                         </span>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                         <div className="flex gap-3 p-6 border-t border-gray-200">
//                             <button
//                                 onClick={() => {
//                                     setNegotiateModal(null);
//                                     setNegotiatedPrice("");
//                                 }}
//                                 className="flex-1 bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={confirmNegotiatedPrice}
//                                 disabled={!negotiatedPrice || Number(negotiatedPrice) < (negotiateModal.costPrice || negotiateModal.price)}
//                                 className="flex-1 bg-purple-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                             >
//                                 Confirm Price
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* UPDATE BALANCE MODAL */}
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

//             {/* ENHANCED: WIDER VIEW SALE DETAILS MODAL */}
//             {viewModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//                         <div className="p-6 border-b border-gray-200">
//                             <h3 className="text-2xl font-semibold text-gray-800">Sale Details - {viewModal.customer_name}</h3>
//                         </div>
//                         <div className="p-6 space-y-6">
//                             {/* Customer Information Grid */}
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                 <div className="bg-gray-50 rounded-lg p-4">
//                                     <div className="text-sm font-medium text-gray-500 mb-1">Customer Name</div>
//                                     <div className="text-lg font-semibold text-gray-900">{viewModal.customer_name}</div>
//                                 </div>
//                                 <div className="bg-gray-50 rounded-lg p-4">
//                                     <div className="text-sm font-medium text-gray-500 mb-1">Phone Number</div>
//                                     <div className="text-lg font-semibold text-gray-900">{viewModal.phone}</div>
//                                 </div>
//                                 <div className="bg-gray-50 rounded-lg p-4">
//                                     <div className="text-sm font-medium text-gray-500 mb-1">Sale Date</div>
//                                     <div className="text-lg font-semibold text-gray-900">
//                                         {new Date(viewModal.date).toLocaleDateString('en-US', {
//                                             year: 'numeric',
//                                             month: 'long',
//                                             day: 'numeric'
//                                         })}
//                                     </div>
//                                 </div>
//                                 <div className="bg-gray-50 rounded-lg p-4">
//                                     <div className="text-sm font-medium text-gray-500 mb-1">Gender</div>
//                                     <div className="text-lg font-semibold text-gray-900">{viewModal.gender || 'Not Provided'}</div>
//                                 </div>
//                                 <div className="bg-gray-50 rounded-lg p-4">
//                                     <div className="text-sm font-medium text-gray-500 mb-1">Payment Method</div>
//                                     <div className="text-lg font-semibold text-gray-900 capitalize">
//                                         {(viewModal.payment_method || 'cash').replace('_', ' ')}
//                                     </div>
//                                 </div>
//                                 <div className="bg-gray-50 rounded-lg p-4">
//                                     <div className="text-sm font-medium text-gray-500 mb-1">Sale Status</div>
//                                     <div className="text-lg font-semibold">
//                                         {viewModal.is_refunded ? (
//                                             <span className="text-red-600">Refunded</span>
//                                         ) : viewModal.is_partially_refunded ? (
//                                             <span className="text-orange-600">Partially Refunded</span>
//                                         ) : (
//                                             <span className="text-green-600">Completed</span>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Address */}
//                             {viewModal.address && (
//                                 <div className="bg-gray-50 rounded-lg p-4">
//                                     <div className="text-sm font-medium text-gray-500 mb-1">Address</div>
//                                     <div className="text-lg text-gray-900">{viewModal.address}</div>
//                                 </div>
//                             )}

//                             {/* Receipt Upload */}
//                             {viewModal.receipt && (
//                                 <div className="bg-blue-50 rounded-lg p-4">
//                                     <div className="text-sm font-medium text-gray-500 mb-2">Uploaded Receipt</div>
//                                     <a
//                                         href={viewModal.receipt}
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         className="inline-flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
//                                     >
//                                         <span>📎</span>
//                                         <span>View Receipt Document</span>
//                                     </a>
//                                 </div>
//                             )}

//                             {/* Financial Summary */}
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                 <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                                     <div className="text-sm font-medium text-green-700 mb-1">Total Amount</div>
//                                     <div className="text-2xl font-bold text-green-800">
//                                         ₦{Number(viewModal.total).toLocaleString()}
//                                     </div>
//                                 </div>
//                                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                                     <div className="text-sm font-medium text-blue-700 mb-1">Amount Paid</div>
//                                     <div className="text-2xl font-bold text-blue-800">
//                                         ₦{Number(viewModal.amount_paid).toLocaleString()}
//                                     </div>
//                                 </div>
//                                 <div className={`border rounded-lg p-4 ${viewModal.balance > 0
//                                         ? 'bg-orange-50 border-orange-200'
//                                         : 'bg-gray-50 border-gray-200'
//                                     }`}>
//                                     <div className={`text-sm font-medium mb-1 ${viewModal.balance > 0 ? 'text-orange-700' : 'text-gray-700'
//                                         }`}>
//                                         Balance
//                                     </div>
//                                     <div className={`text-2xl font-bold ${viewModal.balance > 0 ? 'text-orange-800' : 'text-gray-800'
//                                         }`}>
//                                         ₦{Number(viewModal.balance).toLocaleString()}
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Refund Information */}
//                             {(viewModal.is_refunded || viewModal.is_partially_refunded) && viewModal.refund_reason && (
//                                 <div className={`rounded-lg p-4 ${viewModal.is_refunded
//                                         ? 'bg-red-50 border border-red-200'
//                                         : 'bg-orange-50 border border-orange-200'
//                                     }`}>
//                                     <div className={`font-semibold mb-2 ${viewModal.is_refunded ? 'text-red-800' : 'text-orange-800'
//                                         }`}>
//                                         {viewModal.is_refunded ? '🔄 Refund Details' : '⚠️ Partial Refund Details'}
//                                     </div>
//                                     <div className={`text-sm ${viewModal.is_refunded ? 'text-red-700' : 'text-orange-700'
//                                         }`}>
//                                         <strong>Reason:</strong> {viewModal.refund_reason}
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Items Sold */}
//                             <div className="border border-gray-200 rounded-lg">
//                                 <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
//                                     <h4 className="text-lg font-semibold text-gray-800">Items Sold ({viewModal.items?.length || 0})</h4>
//                                 </div>
//                                 <div className="p-6">
//                                     {viewModal.items && viewModal.items.length > 0 ? (
//                                         <div className="space-y-4 max-h-96 overflow-y-auto">
//                                             {viewModal.items.map((item, index) => {
//                                                 const productName = getProductName(item.product);
//                                                 const quantity = item.qty || item.quantity || 1;
//                                                 const price = item.price || item.unit_price || 0;
//                                                 const negotiatedPrice = item.negotiated_price;
//                                                 const isNegotiated = item.is_negotiated || negotiatedPrice;
//                                                 const displayPrice = isNegotiated ? negotiatedPrice : price;
//                                                 const totalPrice = quantity * displayPrice;

//                                                 return (
//                                                     <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
//                                                         <div className="flex-1">
//                                                             <div className="font-semibold text-gray-900 text-lg mb-1">
//                                                                 {productName}
//                                                             </div>
//                                                             <div className="text-sm text-gray-600 space-y-1">
//                                                                 <div>Quantity: <strong>{quantity}</strong></div>
//                                                                 {isNegotiated ? (
//                                                                     <div className="space-y-1">
//                                                                         <div className="text-pink-600">
//                                                                             Negotiated Price: <strong>₦{Number(displayPrice).toLocaleString()}</strong>
//                                                                         </div>
//                                                                         <div className="text-gray-500 line-through">
//                                                                             Original Price: ₦{Number(price).toLocaleString()}
//                                                                         </div>
//                                                                     </div>
//                                                                 ) : (
//                                                                     <div>
//                                                                         Price: <strong>₦{Number(price).toLocaleString()}</strong>
//                                                                     </div>
//                                                                 )}
//                                                             </div>
//                                                         </div>
//                                                         <div className="text-right">
//                                                             <div className="text-2xl font-bold text-green-600">
//                                                                 ₦{Number(totalPrice).toLocaleString()}
//                                                             </div>
//                                                             <div className="text-sm text-gray-500 mt-1">
//                                                                 Total
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 );
//                                             })}
//                                         </div>
//                                     ) : (
//                                         <div className="text-center py-8 text-gray-500">
//                                             <div className="text-4xl mb-2">📦</div>
//                                             <p>No items found for this sale</p>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
//                             <button
//                                 onClick={() => handlePrint(viewModal)}
//                                 className="flex-1 bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
//                             >
//                                 <span>🖨️</span>
//                                 <span>Print Receipt</span>
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

    // Refund & Negotiation States
    const [refundModal, setRefundModal] = useState(null);
    const [refundReason, setRefundReason] = useState("");
    const [refundAmount, setRefundAmount] = useState("");
    const [negotiateModal, setNegotiateModal] = useState(null);
    const [negotiatedPrice, setNegotiatedPrice] = useState("");
    const [refundItems, setRefundItems] = useState([]);
    const [partialRefund, setPartialRefund] = useState(false);
    const [selectedRefundItems, setSelectedRefundItems] = useState([]);

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

    const total = cart.reduce((sum, item) => sum + (item.negotiatedPrice || item.price) * item.qty, 0);
    const balance = amountPaid ? Math.max(total - Number(amountPaid), 0) : total;
    const totalInWords = total > 0 ? `${toWords(total)} Naira Only` : "";
    const isOverpayment = Number(amountPaid) > total;

    // Create product map for easy lookup
    const productMap = {};
    products.forEach(product => {
        productMap[product.id] = product;
    });

    const getProductName = (productId) => {
        return productMap[productId]?.name || `Product ${productId}`;
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
                price: product.selling_price || product.price,
                costPrice: product.cost_price || product.price,
                negotiatedPrice: null,
                isNegotiated: false
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

    // Open negotiate modal
    const handleNegotiate = (item) => {
        setNegotiateModal(item);
        setNegotiatedPrice(item.negotiatedPrice || item.price);
    };

    // Confirm negotiated price
    const confirmNegotiatedPrice = () => {
        if (!negotiatedPrice || Number(negotiatedPrice) <= 0) {
            toast.error("Please enter a valid price.");
            return;
        }

        const costPrice = negotiateModal.costPrice || negotiateModal.price;
        if (Number(negotiatedPrice) < costPrice) {
            toast.error(`Price cannot be less than cost price (₦${costPrice.toLocaleString()})`);
            return;
        }

        setCart(
            cart.map((item) =>
                item.id === negotiateModal.id
                    ? {
                        ...item,
                        negotiatedPrice: Number(negotiatedPrice),
                        isNegotiated: true
                    }
                    : item
            )
        );

        toast.success(`Price negotiated for ${negotiateModal.name}: ₦${Number(negotiatedPrice).toLocaleString()}`);
        setNegotiateModal(null);
        setNegotiatedPrice("");
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
    const handleAmountPaidChange = (e) => {
        const value = e.target.value;
        setAmountPaid(value);
    };

    // FIXED: Enhanced Confirm Sale function
    const confirmSale = async () => {
        try {
            // Validation
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
            if (!token) {
                toast.error("Authentication token not found. Please log in again.");
                return;
            }

            const calculatedBalance = Math.max(total - actualAmountPaid, 0);

            // Show payment confirmation
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

            // Prepare sale data
            const saleData = {
                customer_name: customerName.trim(),
                address: address.trim() || "Not provided",
                phone: phone.trim(),
                gender: gender || "",
                date: saleDate,
                amount_paid: actualAmountPaid,
                payment_method: paymentMethod,
                balance: calculatedBalance,
                total: total,
                items: cart.map(item => ({
                    product: item.id,
                    qty: item.qty,
                    price: parseFloat(item.negotiatedPrice || item.price),
                    original_price: parseFloat(item.price),
                    is_negotiated: item.isNegotiated,
                    negotiated_price: item.isNegotiated ? parseFloat(item.negotiatedPrice) : null
                }))
            };

            console.log("Creating sale with data:", saleData);

            // Create FormData for file upload
            const formData = new FormData();

            // Append all sale data
            Object.keys(saleData).forEach(key => {
                if (key === 'items') {
                    saleData.items.forEach((item, index) => {
                        Object.keys(item).forEach(itemKey => {
                            if (item[itemKey] !== null) {
                                formData.append(`items[${index}]${itemKey}`, item[itemKey]);
                            }
                        });
                    });
                } else {
                    formData.append(key, saleData[key]);
                }
            });

            if (receiptFile) {
                formData.append('receipt', receiptFile);
            }

            // Make API call
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

            // Close modal first
            setShowModal(false);

            // Show success message
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
            resetForm();

            // Refresh data
            await Promise.all([fetchSales(), fetchProducts()]);

        } catch (err) {
            console.error("Sale creation error:", err);
            let errorMessage = "Failed to create sale: ";

            if (err.response?.data) {
                const errorData = err.response.data;

                if (typeof errorData === 'object') {
                    // Handle field errors
                    if (errorData.non_field_errors) {
                        errorMessage += errorData.non_field_errors.join(', ');
                    } else {
                        Object.keys(errorData).forEach(key => {
                            const fieldErrors = Array.isArray(errorData[key])
                                ? errorData[key].join(', ')
                                : errorData[key];
                            errorMessage += `${key}: ${fieldErrors} `;
                        });
                    }
                } else {
                    errorMessage += errorData;
                }
            } else if (err.request) {
                errorMessage += 'No response received from server. Please check your connection.';
            } else {
                errorMessage += err.message || 'Unknown error occurred';
            }

            toast.error(`❌ ${errorMessage}`);
        }
    };

    // Reset form function
    const resetForm = () => {
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
        setSelectedId("");
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

            await axios.put(
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

    // ENHANCED: Refund Handler with Better Permission Handling
    const handleRefund = async () => {
        if (!refundReason.trim()) {
            toast.error("Please provide a reason for the refund.");
            return;
        }

        if (!refundAmount || Number(refundAmount) <= 0) {
            toast.error("Please enter a valid refund amount.");
            return;
        }

        if (Number(refundAmount) > Number(refundModal.amount_paid)) {
            toast.error(`❌ Refund amount (₦${Number(refundAmount).toLocaleString()}) cannot exceed amount paid (₦${Number(refundModal.amount_paid).toLocaleString()})`);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Authentication token not found. Please log in again.");
                return;
            }

            // Prepare refund data
            const refundData = {
                sale: refundModal.id,
                reason: refundReason.trim(),
                refund_amount: parseFloat(refundAmount),
                refund_date: new Date().toISOString().slice(0, 10),
                items_refunded: partialRefund ? selectedRefundItems : refundModal.items,
                processed_by: "admin" // You might want to get this from user context
            };

            console.log("Processing refund with data:", refundData);

            // First, try to create the refund record
            let refundResponse;
            try {
                refundResponse = await axios.post(
                    "http://127.0.0.1:8000/api/sales/refunds/",
                    refundData,
                    {
                        headers: {
                            'Authorization': `Token ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log("Refund created successfully:", refundResponse.data);
            } catch (refundErr) {
                console.error("Refund creation failed:", refundErr);

                // If refund endpoint doesn't exist or has permission issues, handle sale update directly
                if (refundErr.response?.status === 404 || refundErr.response?.status === 403) {
                    console.log("Refund endpoint not available, updating sale directly");
                    // Continue with sale update even if refund record fails
                } else {
                    throw refundErr; // Re-throw other errors
                }
            }

            // Restore product quantities
            const itemsToRestore = partialRefund ? selectedRefundItems : refundModal.items;
            const restorePromises = [];

            for (const item of itemsToRestore) {
                const product = productMap[item.product];
                if (product) {
                    const quantityToRestore = item.qty || item.quantity || 1;
                    const newQuantity = product.quantity + quantityToRestore;

                    restorePromises.push(
                        axios.put(
                            `http://127.0.0.1:8000/api/products/${product.id}/`,
                            {
                                quantity: newQuantity
                            },
                            {
                                headers: {
                                    'Authorization': `Token ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        )
                    );
                }
            }

            // Wait for all product updates to complete
            await Promise.all(restorePromises);

            // Update sale status
            const updatedAmountPaid = Number(refundModal.amount_paid) - Number(refundAmount);
            const isFullyRefunded = updatedAmountPaid === 0;

            await axios.put(
                `http://127.0.0.1:8000/api/sales/sales/${refundModal.id}/`,
                {
                    is_refunded: isFullyRefunded,
                    is_partially_refunded: !isFullyRefunded && updatedAmountPaid > 0,
                    refund_reason: refundReason.trim(),
                    amount_paid: Math.max(updatedAmountPaid, 0),
                    balance: isFullyRefunded ? 0 : refundModal.balance,
                    status: isFullyRefunded ? 'refunded' : 'partially_refunded'
                },
                {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Success message
            let successMessage = `✅ Refund of ₦${Number(refundAmount).toLocaleString()} processed successfully! `;
            if (partialRefund && selectedRefundItems.length > 0) {
                successMessage += `${selectedRefundItems.length} product(s) restocked.`;
            } else if (!partialRefund) {
                successMessage += "All products restocked.";
            }

            toast.success(successMessage, {
                position: "top-center",
                autoClose: 5000,
            });

            // Reset state
            setRefundModal(null);
            setRefundReason("");
            setRefundAmount("");
            setRefundItems([]);
            setSelectedRefundItems([]);
            setPartialRefund(false);

            // Refresh data
            await Promise.all([fetchSales(), fetchProducts()]);

        } catch (err) {
            console.error("Refund processing error:", err);

            let errorMessage = "Failed to process refund: ";

            if (err.response?.status === 403) {
                errorMessage = "❌ Permission denied: You don't have permission to process refunds. Please contact administrator.";
            } else if (err.response?.status === 404) {
                errorMessage = "❌ Refund endpoint not found. Please check API configuration.";
            } else if (err.response?.data) {
                const errorData = err.response.data;

                if (typeof errorData === 'object') {
                    Object.keys(errorData).forEach(key => {
                        const fieldErrors = Array.isArray(errorData[key])
                            ? errorData[key].join(', ')
                            : errorData[key];
                        errorMessage += `${key}: ${fieldErrors} `;
                    });
                } else {
                    errorMessage += errorData;
                }
            } else if (err.request) {
                errorMessage += "No response from server. Please check your connection.";
            } else {
                errorMessage += err.message || "Unknown error occurred";
            }

            toast.error(errorMessage, {
                position: "top-center",
                autoClose: 6000,
            });
        }
    };

    // Initialize refund modal
    const openRefundModal = (sale) => {
        setRefundModal(sale);
        setRefundReason("");
        setRefundAmount("");
        setRefundItems(sale.items || []);
        setSelectedRefundItems([]);
        setPartialRefund(false);
    };

    // Handle refund item selection
    const handleRefundItemSelect = (item, isSelected) => {
        if (isSelected) {
            setSelectedRefundItems(prev => [...prev, item]);
        } else {
            setSelectedRefundItems(prev => prev.filter(i =>
                i.product !== item.product && i.quantity !== item.quantity
            ));
        }
    };

    // Calculate refund amount based on selected items
    const calculateRefundFromItems = () => {
        if (selectedRefundItems.length === 0) return 0;

        return selectedRefundItems.reduce((total, item) => {
            const price = item.negotiated_price || item.price;
            const quantity = item.qty || item.quantity || 1;
            return total + (price * quantity);
        }, 0);
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

            setSales(prevSales => prevSales.filter((s) => s.id !== id));
            await fetchSales();

        } catch (err) {
            console.error("Delete error:", err);
            toast.error(`❌ Failed to delete sale: ${err.response?.data?.detail || err.message}`);
        }
    };

    // ENHANCED: Print receipt with wider layout
    const handlePrint = (sale) => {
        const printWindow = window.open('', '', 'height=700,width=1000');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Receipt - ${sale.customer_name}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            padding: 25px; 
                            max-width: 900px; 
                            margin: 0 auto; 
                            font-size: 14px;
                        }
                        .header { 
                            text-align: center; 
                            border-bottom: 3px solid #333; 
                            padding-bottom: 25px; 
                            margin-bottom: 25px; 
                        }
                        .header h1 { 
                            margin: 0; 
                            color: #333; 
                            font-size: 28px;
                        }
                        .info-section { 
                            display: grid; 
                            grid-template-columns: 1fr 1fr; 
                            gap: 15px; 
                            margin-bottom: 30px; 
                        }
                        .info-item { 
                            padding: 12px; 
                            background: #f8f9fa; 
                            border-radius: 8px; 
                            border: 1px solid #e9ecef;
                        }
                        .info-label { 
                            font-weight: bold; 
                            color: #495057; 
                            font-size: 12px; 
                            text-transform: uppercase;
                        }
                        .info-value { 
                            font-size: 16px; 
                            color: #212529; 
                            margin-top: 5px; 
                            font-weight: 600;
                        }
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-bottom: 25px;
                            font-size: 14px;
                        }
                        th, td { 
                            padding: 14px; 
                            text-align: left; 
                            border-bottom: 1px solid #dee2e6; 
                        }
                        th { 
                            background-color: #343a40; 
                            color: white; 
                            font-weight: bold;
                            font-size: 14px;
                        }
                        .totals { 
                            float: right; 
                            width: 350px; 
                            margin-top: 20px;
                        }
                        .total-row { 
                            display: flex; 
                            justify-content: space-between; 
                            padding: 12px; 
                            font-size: 16px; 
                            border-bottom: 1px solid #dee2e6;
                        }
                        .total-row.grand { 
                            background: #343a40; 
                            color: white; 
                            font-weight: bold; 
                            font-size: 18px;
                            border-radius: 8px;
                        }
                        .total-row.paid { 
                            background: #28a745; 
                            color: white; 
                            font-weight: bold;
                            border-radius: 8px;
                        }
                        .total-row.balance { 
                            background: #fd7e14; 
                            color: white; 
                            font-weight: bold;
                            border-radius: 8px;
                        }
                        .footer { 
                            margin-top: 60px; 
                            text-align: center; 
                            border-top: 2px solid #343a40; 
                            padding-top: 25px; 
                            color: #6c757d;
                            font-size: 13px;
                        }
                        .negotiated { 
                            color: #e83e8c; 
                            font-weight: bold; 
                        }
                        .original-price { 
                            text-decoration: line-through; 
                            color: #6c757d; 
                            font-size: 0.85em; 
                        }
                        .refunded { 
                            background: #f8d7da !important; 
                        }
                        .items-section {
                            margin-bottom: 30px;
                        }
                        .items-section h3 {
                            color: #495057;
                            border-bottom: 2px solid #dee2e6;
                            padding-bottom: 10px;
                            margin-bottom: 15px;
                        }
                        @media print { 
                            .no-print { display: none; } 
                            body { padding: 15px; }
                        }
                        .receipt-number {
                            font-size: 16px;
                            color: #6c757d;
                            margin-top: 5px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>SALES RECEIPT</h1>
                        <div class="receipt-number">Receipt #${sale.id}</div>
                        <div class="receipt-number">Date: ${new Date(sale.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</div>
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
                            <div class="info-value">${sale.address || 'Not Provided'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Gender</div>
                            <div class="info-value">${sale.gender || 'Not Provided'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Payment Method</div>
                            <div class="info-value" style="text-transform: capitalize;">${(sale.payment_method || 'cash').replace('_', ' ')}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Sale Status</div>
                            <div class="info-value">
                                ${sale.is_refunded ?
                '<span style="color: #dc3545; font-weight: bold;">REFUNDED</span>' :
                sale.is_partially_refunded ?
                    '<span style="color: #fd7e14; font-weight: bold;">PARTIALLY REFUNDED</span>' :
                    '<span style="color: #28a745; font-weight: bold;">COMPLETED</span>'
            }
                            </div>
                        </div>
                    </div>

                    <div class="items-section">
                        <h3>ITEMS PURCHASED</h3>
                        ${sale.items && sale.items.length > 0 ? `
                            <table>
                                <thead>
                                    <tr>
                                        <th style="width: 40%;">Product</th>
                                        <th style="width: 15%;">Quantity</th>
                                        <th style="width: 20%;">Unit Price</th>
                                        <th style="width: 25%;">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${sale.items.map(item => {
                const productName = getProductName(item.product);
                const isNegotiated = item.is_negotiated || item.negotiated_price;
                const displayPrice = isNegotiated ? (item.negotiated_price || item.price) : item.price;
                const originalPrice = item.original_price || item.price;
                const quantity = item.qty || item.quantity || 1;

                return `
                                            <tr>
                                                <td>${productName}</td>
                                                <td>${quantity}</td>
                                                <td>
                                                    ${isNegotiated ? `
                                                        <div class="negotiated">₦${Number(displayPrice).toLocaleString()}</div>
                                                        <div class="original-price">₦${Number(originalPrice).toLocaleString()}</div>
                                                    ` : `₦${Number(displayPrice).toLocaleString()}`}
                                                </td>
                                                <td><strong>₦${Number(quantity * displayPrice).toLocaleString()}</strong></td>
                                            </tr>
                                        `;
            }).join('')}
                                </tbody>
                            </table>
                        ` : '<p>No items found</p>'}
                    </div>
                    
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
                    
                    ${sale.is_refunded ? `
                        <div style="background: #f8d7da; border: 2px solid #dc3545; padding: 20px; margin-top: 25px; border-radius: 8px; text-align: center;">
                            <h3 style="color: #dc3545; margin: 0;">⚠️ FULLY REFUNDED</h3>
                            <p style="color: #721c24; margin: 10px 0 0 0; font-weight: 600;">Reason: ${sale.refund_reason || 'Not specified'}</p>
                            <p style="color: #721c24; margin: 5px 0 0 0;">Refund Amount: ₦${Number(sale.amount_paid).toLocaleString()}</p>
                        </div>
                    ` : ''}
                    
                    ${sale.is_partially_refunded ? `
                        <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 20px; margin-top: 25px; border-radius: 8px; text-align: center;">
                            <h3 style="color: #856404; margin: 0;">⚠️ PARTIALLY REFUNDED</h3>
                            <p style="color: #856404; margin: 10px 0 0 0; font-weight: 600;">Reason: ${sale.refund_reason || 'Not specified'}</p>
                        </div>
                    ` : ''}
                    
                    <div class="footer">
                        <p style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Thank you for your business!</p>
                        <p>This is a computer-generated receipt. No signature required.</p>
                        <p style="margin-top: 10px;">For inquiries, please contact support.</p>
                    </div>
                    
                    <div class="no-print" style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                        <button onclick="window.print()" style="padding: 12px 35px; font-size: 16px; background: #343a40; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 10px;">Print Receipt</button>
                        <button onclick="window.close()" style="padding: 12px 35px; font-size: 16px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">Close Window</button>
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
                            <div className="mb-4">
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="w-32 px-4 py-2 mt-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                >
                                    Add
                                </button>
                            </div>

                            {/* Selected Items Display */}
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
                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                                                    {/* Product Name */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                                            Product/N
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
                                                            {item.isNegotiated ? "Negotiated Price" : "Price"}
                                                        </label>
                                                        <div className="flex gap-1">
                                                            <input
                                                                type="text"
                                                                value={`₦${Number(item.negotiatedPrice || item.price).toLocaleString()}`}
                                                                readOnly
                                                                className={`flex-1 px-3 py-2 border rounded text-sm bg-gray-50 ${item.isNegotiated
                                                                    ? 'border-pink-300 bg-pink-50 text-pink-700'
                                                                    : 'border-gray-300'
                                                                    }`}
                                                            />
                                                            <button
                                                                onClick={() => handleNegotiate(item)}
                                                                className="px-2 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors"
                                                                title="Negotiate Price"
                                                            >
                                                                💬
                                                            </button>
                                                        </div>
                                                        {item.isNegotiated && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Original: ₦{Number(item.price).toLocaleString()}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Quantity - Editable */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                                            Qty
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
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                                            Q/in Stock
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={`${Number(item.quantity).toLocaleString()}`}
                                                            readOnly
                                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                                                        />
                                                    </div>
                                                    {/* Total & Remove */}
                                                    <div className="flex flex-col gap-1">
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                                            Total
                                                        </label>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={`₦${Number((item.negotiatedPrice || item.price) * item.qty).toLocaleString()}`}
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
                                                    {item.costPrice && ` | Cost: ₦${Number(item.costPrice).toLocaleString()}`}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="space-y-2">
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
                                                    {item.isNegotiated ? (
                                                        <>
                                                            <span className="text-pink-600">₦{Number(item.negotiatedPrice).toLocaleString()}</span>
                                                            <span className="text-gray-400 line-through ml-1">₦{Number(item.price).toLocaleString()}</span>
                                                        </>
                                                    ) : (
                                                        `₦${Number(item.price).toLocaleString()}`
                                                    )} × {item.qty}
                                                </div>
                                            </div>
                                            <div className="font-medium text-gray-900">
                                                ₦{Number((item.negotiatedPrice || item.price) * item.qty).toLocaleString()}
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
                                                        onClick={() => setViewModal(sale)}
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
                                                    {!sale.is_refunded && sale.amount_paid > 0 && (
                                                        <button
                                                            onClick={() => openRefundModal(sale)}
                                                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors text-xs"
                                                        >
                                                            Refund
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

            {/* CONFIRM SALE MODAL */}
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

            {/* REFUND MODAL */}
            {refundModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-800">Process Refund</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column - Warning and Basic Info */}
                                <div className="space-y-4">
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-center mb-2">
                                            <span className="text-red-500 mr-2">⚠️</span>
                                            <span className="text-red-800 font-semibold">Refund Warning</span>
                                        </div>
                                        <p className="text-red-700 text-sm">
                                            This action will refund the sale and restore product quantities to inventory. This action cannot be undone.
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-800 mb-3">Sale Information</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Customer:</span>
                                                <span className="font-medium">{refundModal.customer_name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Sale Date:</span>
                                                <span className="font-medium">{new Date(refundModal.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total Amount:</span>
                                                <span className="font-medium">₦{Number(refundModal.total).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Amount Paid:</span>
                                                <span className="text-green-600 font-medium">₦{Number(refundModal.amount_paid).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Balance:</span>
                                                <span className={`font-medium ${refundModal.balance > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                                                    ₦{Number(refundModal.balance).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Refund Type Selection */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-800 mb-3">Refund Type</h4>
                                        <div className="space-y-2">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="refundType"
                                                    checked={!partialRefund}
                                                    onChange={() => setPartialRefund(false)}
                                                    className="mr-2"
                                                />
                                                <span>Full Refund (All Items)</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="refundType"
                                                    checked={partialRefund}
                                                    onChange={() => setPartialRefund(true)}
                                                    className="mr-2"
                                                />
                                                <span>Partial Refund (Select Items)</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Refund Details */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Refund Amount *
                                        </label>
                                        <input
                                            type="number"
                                            value={refundAmount}
                                            onChange={(e) => setRefundAmount(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            placeholder="Enter refund amount"
                                            min="0"
                                            max={refundModal.amount_paid}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Maximum refundable: ₦{Number(refundModal.amount_paid).toLocaleString()}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Refund Reason *
                                        </label>
                                        <textarea
                                            value={refundReason}
                                            onChange={(e) => setRefundReason(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            placeholder="Please provide a detailed reason for the refund..."
                                            rows="4"
                                            required
                                        />
                                    </div>

                                    {/* Items Selection for Partial Refund */}
                                    {partialRefund && refundModal.items && refundModal.items.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Items to Refund
                                            </label>
                                            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                                {refundModal.items.map((item, index) => {
                                                    const productName = getProductName(item.product);
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
                                                                        {item.is_negotiated && (
                                                                            <span className="text-pink-600 ml-2">(Negotiated)</span>
                                                                        )}
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
                                                <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Selected Items Total:</span>
                                                        <span className="font-bold">₦{Number(calculateRefundFromItems()).toLocaleString()}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setRefundAmount(calculateRefundFromItems().toString())}
                                                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                                                    >
                                                        Use this amount for refund
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Products to Restock */}
                                    {refundModal.items && refundModal.items.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Products to Restock
                                            </label>
                                            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                                {(partialRefund ? selectedRefundItems : refundModal.items).map((item, index) => {
                                                    const productName = getProductName(item.product);
                                                    const quantity = item.qty || item.quantity || 1;
                                                    const currentStock = productMap[item.product]?.quantity || 0;

                                                    return (
                                                        <div key={index} className="flex justify-between text-sm bg-white p-2 rounded border">
                                                            <span className="font-medium">{productName}</span>
                                                            <span className="text-green-600">
                                                                +{quantity} units (was {currentStock})
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    setRefundModal(null);
                                    setRefundReason("");
                                    setRefundAmount("");
                                    setRefundItems([]);
                                    setSelectedRefundItems([]);
                                    setPartialRefund(false);
                                }}
                                className="flex-1 bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRefund}
                                disabled={!refundReason.trim() || !refundAmount || Number(refundAmount) <= 0 || (partialRefund && selectedRefundItems.length === 0)}
                                className="flex-1 bg-red-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Process Refund
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* NEGOTIATE PRICE MODAL */}
            {negotiateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-800">Negotiate Price</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-800 mb-2">{negotiateModal.name}</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-600">Current Price:</span>
                                        <p className="font-medium">₦{Number(negotiateModal.price).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Cost Price:</span>
                                        <p className="font-medium text-red-600">₦{Number(negotiateModal.costPrice || negotiateModal.price).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Stock:</span>
                                        <p className="font-medium">{negotiateModal.quantity} units</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Negotiated Price *
                                </label>
                                <input
                                    type="number"
                                    value={negotiatedPrice}
                                    onChange={(e) => setNegotiatedPrice(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Enter negotiated price"
                                    min={negotiateModal.costPrice || negotiateModal.price}
                                    step="0.01"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Minimum price: ₦{Number(negotiateModal.costPrice || negotiateModal.price).toLocaleString()}
                                </p>
                            </div>

                            {negotiatedPrice && (
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <div className="flex justify-between text-sm">
                                        <span>Original Price:</span>
                                        <span className="line-through">₦{Number(negotiateModal.price).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-semibold">
                                        <span>Negotiated Price:</span>
                                        <span className="text-purple-600">₦{Number(negotiatedPrice).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Discount:</span>
                                        <span className="text-green-600">
                                            -₦{Number(negotiateModal.price - negotiatedPrice).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    setNegotiateModal(null);
                                    setNegotiatedPrice("");
                                }}
                                className="flex-1 bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmNegotiatedPrice}
                                disabled={!negotiatedPrice || Number(negotiatedPrice) < (negotiateModal.costPrice || negotiateModal.price)}
                                className="flex-1 bg-purple-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm Price
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* UPDATE BALANCE MODAL */}
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

            {/* ENHANCED: WIDER VIEW SALE DETAILS MODAL */}
            {viewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-2xl font-semibold text-gray-800">Sale Details - {viewModal.customer_name}</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Customer Information Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="text-sm font-medium text-gray-500 mb-1">Customer Name</div>
                                    <div className="text-lg font-semibold text-gray-900">{viewModal.customer_name}</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="text-sm font-medium text-gray-500 mb-1">Phone Number</div>
                                    <div className="text-lg font-semibold text-gray-900">{viewModal.phone}</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="text-sm font-medium text-gray-500 mb-1">Sale Date</div>
                                    <div className="text-lg font-semibold text-gray-900">
                                        {new Date(viewModal.date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="text-sm font-medium text-gray-500 mb-1">Gender</div>
                                    <div className="text-lg font-semibold text-gray-900">{viewModal.gender || 'Not Provided'}</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="text-sm font-medium text-gray-500 mb-1">Payment Method</div>
                                    <div className="text-lg font-semibold text-gray-900 capitalize">
                                        {(viewModal.payment_method || 'cash').replace('_', ' ')}
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="text-sm font-medium text-gray-500 mb-1">Sale Status</div>
                                    <div className="text-lg font-semibold">
                                        {viewModal.is_refunded ? (
                                            <span className="text-red-600">Refunded</span>
                                        ) : viewModal.is_partially_refunded ? (
                                            <span className="text-orange-600">Partially Refunded</span>
                                        ) : (
                                            <span className="text-green-600">Completed</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            {viewModal.address && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="text-sm font-medium text-gray-500 mb-1">Address</div>
                                    <div className="text-lg text-gray-900">{viewModal.address}</div>
                                </div>
                            )}

                            {/* Receipt Upload */}
                            {viewModal.receipt && (
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="text-sm font-medium text-gray-500 mb-2">Uploaded Receipt</div>
                                    <a
                                        href={viewModal.receipt}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        <span>📎</span>
                                        <span>View Receipt Document</span>
                                    </a>
                                </div>
                            )}

                            {/* Financial Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="text-sm font-medium text-green-700 mb-1">Total Amount</div>
                                    <div className="text-2xl font-bold text-green-800">
                                        ₦{Number(viewModal.total).toLocaleString()}
                                    </div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="text-sm font-medium text-blue-700 mb-1">Amount Paid</div>
                                    <div className="text-2xl font-bold text-blue-800">
                                        ₦{Number(viewModal.amount_paid).toLocaleString()}
                                    </div>
                                </div>
                                <div className={`border rounded-lg p-4 ${viewModal.balance > 0
                                    ? 'bg-orange-50 border-orange-200'
                                    : 'bg-gray-50 border-gray-200'
                                    }`}>
                                    <div className={`text-sm font-medium mb-1 ${viewModal.balance > 0 ? 'text-orange-700' : 'text-gray-700'
                                        }`}>
                                        Balance
                                    </div>
                                    <div className={`text-2xl font-bold ${viewModal.balance > 0 ? 'text-orange-800' : 'text-gray-800'
                                        }`}>
                                        ₦{Number(viewModal.balance).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Refund Information */}
                            {(viewModal.is_refunded || viewModal.is_partially_refunded) && viewModal.refund_reason && (
                                <div className={`rounded-lg p-4 ${viewModal.is_refunded
                                    ? 'bg-red-50 border border-red-200'
                                    : 'bg-orange-50 border border-orange-200'
                                    }`}>
                                    <div className={`font-semibold mb-2 ${viewModal.is_refunded ? 'text-red-800' : 'text-orange-800'
                                        }`}>
                                        {viewModal.is_refunded ? '🔄 Refund Details' : '⚠️ Partial Refund Details'}
                                    </div>
                                    <div className={`text-sm ${viewModal.is_refunded ? 'text-red-700' : 'text-orange-700'
                                        }`}>
                                        <strong>Reason:</strong> {viewModal.refund_reason}
                                    </div>
                                </div>
                            )}

                            {/* Items Sold */}
                            <div className="border border-gray-200 rounded-lg">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                    <h4 className="text-lg font-semibold text-gray-800">Items Sold ({viewModal.items?.length || 0})</h4>
                                </div>
                                <div className="p-6">
                                    {viewModal.items && viewModal.items.length > 0 ? (
                                        <div className="space-y-4 max-h-96 overflow-y-auto">
                                            {viewModal.items.map((item, index) => {
                                                const productName = getProductName(item.product);
                                                const quantity = item.qty || item.quantity || 1;
                                                const price = item.price || item.unit_price || 0;
                                                const negotiatedPrice = item.negotiated_price;
                                                const isNegotiated = item.is_negotiated || negotiatedPrice;
                                                const displayPrice = isNegotiated ? negotiatedPrice : price;
                                                const totalPrice = quantity * displayPrice;

                                                return (
                                                    <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-gray-900 text-lg mb-1">
                                                                {productName}
                                                            </div>
                                                            <div className="text-sm text-gray-600 space-y-1">
                                                                <div>Quantity: <strong>{quantity}</strong></div>
                                                                {isNegotiated ? (
                                                                    <div className="space-y-1">
                                                                        <div className="text-pink-600">
                                                                            Negotiated Price: <strong>₦{Number(displayPrice).toLocaleString()}</strong>
                                                                        </div>
                                                                        <div className="text-gray-500 line-through">
                                                                            Original Price: ₦{Number(price).toLocaleString()}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        Price: <strong>₦{Number(price).toLocaleString()}</strong>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-bold text-green-600">
                                                                ₦{Number(totalPrice).toLocaleString()}
                                                            </div>
                                                            <div className="text-sm text-gray-500 mt-1">
                                                                Total
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <div className="text-4xl mb-2">📦</div>
                                            <p>No items found for this sale</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                            <button
                                onClick={() => handlePrint(viewModal)}
                                className="flex-1 bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                            >
                                <span>🖨️</span>
                                <span>Print Receipt</span>
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