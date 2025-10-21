// // import React, { useState, useEffect } from "react";
// // import { toast } from "react-toastify";
// // import axios from "axios";
// // const API_BASE = "http://localhost:8000";

// // const CustomerReportForm = ({ onSuccess }) => {
// //     const [formData, setFormData] = useState({
// //         customer_name: "",
// //         report_date: "",
// //         message: "",
// //         products: [],
// //     });
// //     const [isSubmitting, setIsSubmitting] = useState(false);
// //     const [products, setProducts] = useState([]);
// //     const [accordionOpen, setAccordionOpen] = useState(false);
// //     const [loadingProducts, setLoadingProducts] = useState(true);
// //     const [error, setError] = useState(null);

// //     // ✅ Fetch products from the backend
// //     useEffect(() => {
// //         const loadProducts = async () => {
// //             try {
// //                 setLoadingProducts(true);
// //                 const response = await fetch(`${API_BASE}/reports/products/`);
// //                 if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
// //                 const data = await response.json();
// //                 setProducts(data);
// //             } catch (err) {
// //                 console.error("Error fetching products:", err);
// //                 setError("⚠️ Failed to load products");
// //                 toast.error("⚠️ Failed to load products");
// //             } finally {
// //                 setLoadingProducts(false);
// //             }
// //         };
// //         loadProducts();
// //     }, []);

// //     // ✅ Handle form field changes
// //     const handleChange = (e) => {
// //         const { name, value } = e.target;
// //         setFormData((prev) => ({
// //             ...prev,
// //             [name]: value,
// //         }));
// //     };

// //     // ✅ Toggle product checkbox
// //     const handleProductToggle = (productId) => {
// //         setFormData((prev) => {
// //             const alreadySelected = prev.products.includes(productId);
// //             return {
// //                 ...prev,
// //                 products: alreadySelected
// //                     ? prev.products.filter((id) => id !== productId)
// //                     : [...prev.products, productId],
// //             };
// //         });
// //     };

// //     // ✅ Submit form data with JWT Authorization header
// //     const handleSubmit = async (e) => {
// //         e.preventDefault();

// //         try {
// //             const response = await axios.post("http://localhost:8000/reports/api/reports/", formData);
// //             toast.success("Report submitted successfully!");
// //             console.log(response.data);
// //         } catch (error) {
// //             console.error("Error submitting report:", error);
// //             toast.error("Failed to submit report");
// //         }
// //     };


// //     const today = new Date().toISOString().split("T")[0];

// //     return (
// //         <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
// //             <div className="max-w-md mx-auto">
// //                 <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
// //                     {/* Header */}
// //                     <div className="text-center mb-8">
// //                         <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
// //                             <span className="text-2xl">📊</span>
// //                         </div>
// //                         <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Customer Report</h2>
// //                         <p className="text-gray-600 text-sm">
// //                             Fill in customer details and report information
// //                         </p>
// //                     </div>

// //                     {/* Form */}
// //                     <form onSubmit={handleSubmit} className="space-y-6">
// //                         {/* Customer Name */}
// //                         <div>
// //                             <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-2">
// //                                 👤 Customer Name
// //                             </label>
// //                             <input
// //                                 type="text"
// //                                 id="customer_name"
// //                                 name="customer_name"
// //                                 value={formData.customer_name}
// //                                 onChange={handleChange}
// //                                 required
// //                                 placeholder="Enter customer full name"
// //                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
// //                             />
// //                         </div>

// //                         {/* Report Date */}
// //                         <div>
// //                             <label htmlFor="report_date" className="block text-sm font-medium text-gray-700 mb-2">
// //                                 📅 Report Date
// //                             </label>
// //                             <input
// //                                 type="date"
// //                                 id="report_date"
// //                                 name="report_date"
// //                                 value={formData.report_date}
// //                                 onChange={handleChange}
// //                                 max={today}
// //                                 required
// //                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
// //                             />
// //                         </div>

// //                         {/* Accordion for Products */}
// //                         <div className="border rounded-lg shadow-sm overflow-hidden">
// //                             <button
// //                                 type="button"
// //                                 onClick={() => setAccordionOpen(!accordionOpen)}
// //                                 className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 transition"
// //                             >
// //                                 <span className="font-medium text-gray-700">🛒 Select Products</span>
// //                                 <span>{accordionOpen ? "▲" : "▼"}</span>
// //                             </button>

// //                             {accordionOpen && (
// //                                 <div className="max-h-60 overflow-y-auto bg-white border-t">
// //                                     {loadingProducts ? (
// //                                         <p className="text-center py-3 text-gray-500 text-sm">Loading products...</p>
// //                                     ) : error ? (
// //                                         <p className="text-center py-3 text-red-500 text-sm">{error}</p>
// //                                     ) : products.length > 0 ? (
// //                                         products.map((product) => (
// //                                             <label
// //                                                 key={product.id}
// //                                                 className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
// //                                             >
// //                                                 <span className="text-gray-700 text-sm">{product.name}</span>
// //                                                 <input
// //                                                     type="checkbox"
// //                                                     checked={formData.products.includes(product.id)}
// //                                                     onChange={() => handleProductToggle(product.id)}
// //                                                     className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
// //                                                 />
// //                                             </label>
// //                                         ))
// //                                     ) : (
// //                                         <p className="text-gray-500 text-sm px-4 py-3">No products available.</p>
// //                                     )}
// //                                 </div>
// //                             )}
// //                         </div>

// //                         {/* Message */}
// //                         <div>
// //                             <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
// //                                 💬 Report Message
// //                             </label>
// //                             <textarea
// //                                 id="message"
// //                                 name="message"
// //                                 value={formData.message}
// //                                 onChange={handleChange}
// //                                 required
// //                                 rows="4"
// //                                 placeholder="Describe the issue, feedback, or report details..."
// //                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
// //                             />
// //                             <div className="flex justify-between text-xs mt-2 text-gray-500">
// //                                 <span>{formData.message.length} characters</span>
// //                                 {formData.message.length > 500 && (
// //                                     <span className="text-red-500">Maximum 500 characters recommended</span>
// //                                 )}
// //                             </div>
// //                         </div>

// //                         {/* Submit Button */}
// //                         <button
// //                             type="submit"
// //                             disabled={isSubmitting}
// //                             className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${isSubmitting
// //                                 ? "bg-gray-400 cursor-not-allowed"
// //                                 : "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
// //                                 }`}
// //                         >
// //                             {isSubmitting ? (
// //                                 <div className="flex items-center justify-center space-x-2">
// //                                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
// //                                     <span>Submitting...</span>
// //                                 </div>
// //                             ) : (
// //                                 <div className="flex items-center justify-center space-x-2">
// //                                     <span>📤</span>
// //                                     <span>Submit Report</span>
// //                                 </div>
// //                             )}
// //                         </button>
// //                     </form>

// //                     <div className="mt-6 text-center">
// //                         <p className="text-xs text-gray-500">
// //                             Customer report will be securely stored and accessible to authorized team members.
// //                         </p>
// //                     </div>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // };

// // export default CustomerReportForm;

// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import axios from "axios";
// import { useNavigate } from "react-router-dom"; // ✅ import navigation hook

// const API_BASE = "http://localhost:8000";

// const CustomerReportForm = ({ onSuccess }) => {
//     const navigate = useNavigate(); // ✅ initialize navigate

//     const [formData, setFormData] = useState({
//         customer_name: "",
//         report_date: "",
//         message: "",
//         products: [],
//     });

//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [products, setProducts] = useState([]);
//     const [accordionOpen, setAccordionOpen] = useState(false);
//     const [loadingProducts, setLoadingProducts] = useState(true);
//     const [error, setError] = useState(null);

//     // ✅ Fetch products from backend
//     useEffect(() => {
//         const loadProducts = async () => {
//             try {
//                 setLoadingProducts(true);
//                 const response = await fetch(`${API_BASE}/reports/products/`);
//                 if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
//                 const data = await response.json();
//                 setProducts(data);
//             } catch (err) {
//                 console.error("Error fetching products:", err);
//                 setError("⚠️ Failed to load products");
//                 toast.error("⚠️ Failed to load products");
//             } finally {
//                 setLoadingProducts(false);
//             }
//         };
//         loadProducts();
//     }, []);

//     // ✅ Handle input changes
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     };

//     // ✅ Toggle selected products
//     const handleProductToggle = (productId) => {
//         setFormData((prev) => {
//             const alreadySelected = prev.products.includes(productId);
//             return {
//                 ...prev,
//                 products: alreadySelected
//                     ? prev.products.filter((id) => id !== productId)
//                     : [...prev.products, productId],
//             };
//         });
//     };

//     // ✅ Handle form submission
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsSubmitting(true);

//         try {
//             const response = await axios.post(`${API_BASE}/reports/api/reports/`, formData);
//             toast.success("✅ Report submitted successfully!");

//             console.log("Report Response:", response.data);

//             // ✅ Navigate to dashboard after success
//             setTimeout(() => {
//                 navigate("/dashboard");
//             }, 1500);

//         } catch (error) {
//             console.error("Error submitting report:", error);
//             toast.error("❌ Failed to submit report");
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     const today = new Date().toISOString().split("T")[0];

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
//             <div className="max-w-md mx-auto">
//                 <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
//                     {/* Header */}
//                     <div className="text-center mb-8">
//                         <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
//                             <span className="text-2xl">📊</span>
//                         </div>
//                         <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Customer Report</h2>
//                         <p className="text-gray-600 text-sm">
//                             Fill in customer details and report information
//                         </p>
//                     </div>

//                     {/* Form */}
//                     <form onSubmit={handleSubmit} className="space-y-6">
//                         {/* Customer Name */}
//                         <div>
//                             <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-2">
//                                 👤 Customer Name
//                             </label>
//                             <input
//                                 type="text"
//                                 id="customer_name"
//                                 name="customer_name"
//                                 value={formData.customer_name}
//                                 onChange={handleChange}
//                                 required
//                                 placeholder="Enter customer full name"
//                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                             />
//                         </div>

//                         {/* Report Date */}
//                         <div>
//                             <label htmlFor="report_date" className="block text-sm font-medium text-gray-700 mb-2">
//                                 📅 Report Date
//                             </label>
//                             <input
//                                 type="date"
//                                 id="report_date"
//                                 name="report_date"
//                                 value={formData.report_date}
//                                 onChange={handleChange}
//                                 max={today}
//                                 required
//                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                             />
//                         </div>

//                         {/* Accordion for Products */}
//                         <div className="border rounded-lg shadow-sm overflow-hidden">
//                             <button
//                                 type="button"
//                                 onClick={() => setAccordionOpen(!accordionOpen)}
//                                 className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 transition"
//                             >
//                                 <span className="font-medium text-gray-700">🛒 Select Products</span>
//                                 <span>{accordionOpen ? "▲" : "▼"}</span>
//                             </button>

//                             {accordionOpen && (
//                                 <div className="max-h-60 overflow-y-auto bg-white border-t">
//                                     {loadingProducts ? (
//                                         <p className="text-center py-3 text-gray-500 text-sm">Loading products...</p>
//                                     ) : error ? (
//                                         <p className="text-center py-3 text-red-500 text-sm">{error}</p>
//                                     ) : products.length > 0 ? (
//                                         products.map((product) => (
//                                             <label
//                                                 key={product.id}
//                                                 className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
//                                             >
//                                                 <span className="text-gray-700 text-sm">{product.name}</span>
//                                                 <input
//                                                     type="checkbox"
//                                                     checked={formData.products.includes(product.id)}
//                                                     onChange={() => handleProductToggle(product.id)}
//                                                     className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
//                                                 />
//                                             </label>
//                                         ))
//                                     ) : (
//                                         <p className="text-gray-500 text-sm px-4 py-3">No products available.</p>
//                                     )}
//                                 </div>
//                             )}
//                         </div>

//                         {/* Message */}
//                         <div>
//                             <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
//                                 💬 Report Message
//                             </label>
//                             <textarea
//                                 id="message"
//                                 name="message"
//                                 value={formData.message}
//                                 onChange={handleChange}
//                                 required
//                                 rows="4"
//                                 placeholder="Describe the issue, feedback, or report details..."
//                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
//                             />
//                             <div className="flex justify-between text-xs mt-2 text-gray-500">
//                                 <span>{formData.message.length} characters</span>
//                                 {formData.message.length > 500 && (
//                                     <span className="text-red-500">Maximum 500 characters recommended</span>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Submit Button */}
//                         <button
//                             type="submit"
//                             disabled={isSubmitting}
//                             className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${isSubmitting
//                                 ? "bg-gray-400 cursor-not-allowed"
//                                 : "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
//                                 }`}
//                         >
//                             {isSubmitting ? (
//                                 <div className="flex items-center justify-center space-x-2">
//                                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                     <span>Submitting...</span>
//                                 </div>
//                             ) : (
//                                 <div className="flex items-center justify-center space-x-2">
//                                     <span>📤</span>
//                                     <span>Submit Report</span>
//                                 </div>
//                             )}
//                         </button>
//                     </form>

//                     <div className="mt-6 text-center">
//                         <p className="text-xs text-gray-500">
//                             Customer report will be securely stored and accessible to authorized team members.
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CustomerReportForm;

import React from 'react'

const Report = () => {
    return (
        <div>Report</div>
    )
} 

export default Report