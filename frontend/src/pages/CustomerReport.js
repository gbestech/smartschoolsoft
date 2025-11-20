import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// TinyMCE imports
import { Editor } from '@tinymce/tinymce-react';

const API_BASE = "http://localhost:8000";

const CustomerReportForm = ({ onSuccess }) => {
    const navigate = useNavigate();
    const editorRef = useRef(null);

    const [formData, setFormData] = useState({
        customer_name: "",
        report_date: "",
        message: "",
        products: [],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [products, setProducts] = useState([]);
    const [accordionOpen, setAccordionOpen] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [error, setError] = useState(null);
    const [serverError, setServerError] = useState("");

    // ✅ Fetch products from backend
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoadingProducts(true);
                const response = await fetch(`${API_BASE}/reports/products/`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("⚠️ Failed to load products");
                toast.error("⚠️ Failed to load products");
            } finally {
                setLoadingProducts(false);
            }
        };
        loadProducts();
    }, []);

    // ✅ Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (serverError) setServerError("");
    };

    // ✅ Handle TinyMCE editor change - FIXED CONFIGURATION
    const handleEditorChange = (content) => {
        setFormData((prev) => ({
            ...prev,
            message: content,
        }));
        if (serverError) setServerError("");
    };

    // ✅ Toggle selected products
    const handleProductToggle = (productId) => {
        setFormData((prev) => {
            const numericProductId = Number(productId);
            const alreadySelected = prev.products.includes(numericProductId);
            const newProducts = alreadySelected
                ? prev.products.filter((id) => id !== numericProductId)
                : [...prev.products, numericProductId];

            return {
                ...prev,
                products: newProducts,
            };
        });
        if (serverError) setServerError("");
    };

    // ✅ Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setServerError("");

        try {
            // Get plain text from TinyMCE content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = formData.message;
            const plainText = tempDiv.textContent || tempDiv.innerText || '';

            if (plainText.length > 500) {
                toast.error("❌ Message exceeds 500 characters. Please shorten your message.");
                setIsSubmitting(false);
                return;
            }

            // Prepare data for submission
            const submitData = {
                customer_name: formData.customer_name.trim(),
                report_date: formData.report_date,
                message: formData.message,
                products: formData.products,
            };

            const response = await axios.post(
                `${API_BASE}/reports/api/create-report/`,
                submitData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 10000,
                }
            );

            toast.success("✅ Report submitted successfully!");

            // Reset form and navigate
            setFormData({
                customer_name: "",
                report_date: "",
                message: "",
                products: [],
            });

            setTimeout(() => {
                navigate("/dashboard");
            }, 1500);

        } catch (error) {
            console.error("❌ Full error object:", error);

            let errorDetails = "Submission Failed\n\n";

            if (error.response) {
                console.error("📡 Response status:", error.response.status);
                console.error("📡 Response data:", error.response.data);

                errorDetails += `Status: ${error.response.status}\n`;
                errorDetails += `Data: ${JSON.stringify(error.response.data, null, 2)}\n\n`;

                if (error.response.status === 500) {
                    errorDetails += "🔧 The error is in your Django backend. Check:\n";
                    errorDetails += "1. Django terminal for Python traceback\n";
                    errorDetails += "2. Your create_report view function\n";
                    errorDetails += "3. Database models and relationships\n";
                }

            } else if (error.request) {
                console.error("🌐 No response received:", error.request);
                errorDetails += "No response received from server\n";
            } else {
                console.error("⚡ Request setup error:", error.message);
                errorDetails += `Error: ${error.message}\n`;
            }

            setServerError(errorDetails);
            toast.error("❌ Submission failed - check details below");

        } finally {
            setIsSubmitting(false);
        }
    };

    const today = new Date().toISOString().split("T")[0];

    // Get plain text length for character count
    const getPlainTextLength = () => {
        if (!formData.message) return 0;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = formData.message;
        return (tempDiv.textContent || tempDiv.innerText || '').length;
    };

    const characterCount = getPlainTextLength();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="mx-auto h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                            <span className="text-xl">📊</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Create Customer Report</h2>
                        <p className="text-gray-600 text-xs">
                            Fill in customer details and report information
                        </p>
                    </div>

                    {/* Server Error Display */}
                    {serverError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start">
                                <span className="text-red-500 mr-2 mt-0.5">🚨</span>
                                <div className="flex-1">
                                    <span className="text-red-700 text-sm font-medium block mb-2">
                                        Backend Error
                                    </span>
                                    <pre className="text-red-600 text-xs whitespace-pre-wrap font-sans bg-red-100 p-2 rounded border border-red-200 overflow-auto max-h-48">
                                        {serverError}
                                    </pre>
                                </div>
                                <button
                                    onClick={() => setServerError("")}
                                    className="text-red-500 hover:text-red-700 text-sm ml-2"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Customer Name */}
                        <div>
                            <label htmlFor="customer_name" className="block text-xs font-medium text-gray-700 mb-1">
                                👤 Customer Name *
                            </label>
                            <input
                                type="text"
                                id="customer_name"
                                name="customer_name"
                                value={formData.customer_name}
                                onChange={handleChange}
                                required
                                placeholder="Enter customer full name"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Report Date */}
                        <div>
                            <label htmlFor="report_date" className="block text-xs font-medium text-gray-700 mb-1">
                                📅 Report Date *
                            </label>
                            <input
                                type="date"
                                id="report_date"
                                name="report_date"
                                value={formData.report_date}
                                onChange={handleChange}
                                max={today}
                                required
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Accordion for Products */}
                        <div className="border rounded-lg shadow-sm overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setAccordionOpen(!accordionOpen)}
                                className="w-full flex justify-between items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 transition text-sm"
                            >
                                <span className="font-medium text-gray-700">
                                    🛒 Select Products ({formData.products.length} selected)
                                </span>
                                <span>{accordionOpen ? "▲" : "▼"}</span>
                            </button>

                            {accordionOpen && (
                                <div className="max-h-48 overflow-y-auto bg-white border-t">
                                    {loadingProducts ? (
                                        <p className="text-center py-2 text-gray-500 text-xs">Loading products...</p>
                                    ) : error ? (
                                        <p className="text-center py-2 text-red-500 text-xs">{error}</p>
                                    ) : products.length > 0 ? (
                                        products.map((product) => (
                                            <label
                                                key={product.id}
                                                className="flex items-center justify-between px-3 py-1 hover:bg-gray-50 cursor-pointer text-sm"
                                            >
                                                <span className="text-gray-700">{product.name}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.products.includes(Number(product.id))}
                                                    onChange={() => handleProductToggle(product.id)}
                                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                                />
                                            </label>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-xs px-3 py-2">No products available.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Message - TinyMCE Editor - FIXED CONFIGURATION */}
                        <div>
                            <label htmlFor="message" className="block text-xs font-medium text-gray-700 mb-1">
                                💬 Report Message *
                            </label>
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                <Editor
                                    tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@6.8.3/tinymce.min.js"
                                    onInit={(evt, editor) => (editorRef.current = editor)}
                                    value={formData.message}
                                    onEditorChange={handleEditorChange}
                                    init={{
                                        height: 200,
                                        menubar: false,
                                        plugins: [
                                            'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
                                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                            'insertdatetime', 'media', 'table', 'help', 'wordcount'
                                        ],
                                        toolbar: 'undo redo | bold italic underline | bullist numlist | removeformat | help',
                                        // REMOVED the problematic settings that prevent typing:
                                        // forced_root_block: '', // This was causing the issue
                                        // force_br_newlines: true,
                                        // force_p_newlines: false,
                                        // convert_newlines_to_brs: true,
                                        // remove_trailing_brs: false,

                                        // Use standard paragraph formatting instead:
                                        forced_root_block: 'p', // Use standard <p> tags (default behavior)
                                        force_br_newlines: false, // Use standard newlines
                                        force_p_newlines: true, // Use <p> tags for new paragraphs
                                        convert_newlines_to_brs: false, // Don't convert newlines to <br>

                                        content_style: `
                                            body { 
                                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                                                font-size: 13px;
                                                line-height: 1.5;
                                                margin: 8px;
                                            }
                                            p {
                                                margin: 0 0 8px 0;
                                            }
                                        `,
                                        placeholder: "Describe the issue, feedback, or report details...",
                                        statusbar: false,
                                        branding: false,
                                        promotion: false,
                                        paste_as_text: true, // Paste as plain text
                                        paste_data_images: false, // Don't paste images
                                        // Enable basic editing features:
                                        browser_spellcheck: true,
                                        contextmenu: false,
                                        // Ensure editor is editable:
                                        readonly: false,
                                    }}
                                />
                            </div>
                            <div className="flex justify-between text-xs mt-1 text-gray-500">
                                <span>{characterCount} characters</span>
                                {characterCount > 500 && (
                                    <span className="text-red-500">Maximum 500 characters recommended</span>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || characterCount > 500}
                            className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-all duration-200 text-sm ${isSubmitting || characterCount > 500
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 shadow hover:shadow-md"
                                }`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Submitting...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center space-x-2">
                                    <span>📤</span>
                                    <span>Submit Report</span>
                                </div>
                            )}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">
                            Customer report will be securely stored and accessible to authorized team members.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerReportForm;