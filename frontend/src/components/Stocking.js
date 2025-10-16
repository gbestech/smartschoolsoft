import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Stocking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addedQuantity, setAddedQuantity] = useState(0);

    // Fetch product details
    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                console.log("Fetching product with id:", id);

                // Try these endpoints - use the correct one for your Django setup
                const endpoints = [
                    `http://127.0.0.1:8000/api/products/${id}/`,  // Most common
                    `http://127.0.0.1:8000/products/${id}/`,
                    `http://127.0.0.1:8000/api/products/${id}`,   // Without trailing slash
                    `http://127.0.0.1:8000/products/${id}`,
                ];

                let response;
                for (const endpoint of endpoints) {
                    try {
                        console.log("Trying endpoint:", endpoint);
                        response = await axios.get(endpoint, {
                            headers: {
                                'Authorization': `Token ${token}`
                            }
                        });
                        console.log("API Response:", response.data);
                        setProduct(response.data);
                        setLoading(false);
                        return; // Success, exit the function
                    } catch (err) {
                        console.log(`Failed with endpoint: ${endpoint}`, err.response?.status);
                        continue; // Try next endpoint
                    }
                }

                // If all endpoints fail
                throw new Error("All API endpoints failed");

            } catch (err) {
                console.error("Error fetching product:", err);
                setError(`Failed to load product. 
                         Error: ${err.message}
                         ID: ${id}
                         Status: ${err.response?.status}
                         Details: ${err.response?.data?.detail || 'No detail'}`);
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (addedQuantity <= 0) {
            alert("Quantity to add must be greater than 0.");
            return;
        }

        const newQuantity = parseInt(product.quantity) + parseInt(addedQuantity);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://127.0.0.1:8000/api/products/${id}/`,  // Use the same endpoint as GET
                {
                    ...product,
                    quantity: newQuantity,
                },
                {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("Update response:", response.data);
            alert("Product quantity updated successfully!");
            navigate("/dashboard");
        } catch (err) {
            console.error("Error updating product:", err);
            alert(`Failed to update product: ${err.response?.data?.detail || err.message}`);
        }
    };

    // Rest of your component remains the same...
    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 text-lg">Loading product data...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-red-600">⚠️</span>
                </div>
                <h2 className="text-xl font-bold text-red-600 mb-2">Failed to Load Product</h2>
                <p className="text-red-500 mb-4 whitespace-pre-line">{error}</p>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
                    <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting:</h3>
                    <ul className="text-yellow-700 text-sm list-disc list-inside space-y-1">
                        <li>Check if the product ID exists</li>
                        <li>Verify your API endpoint in Django</li>
                        <li>Ensure you're authenticated</li>
                        <li>Check Django server is running</li>
                    </ul>
                </div>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl text-indigo-600">📦</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Top Up Product</h1>
                        <p className="text-gray-600">Add more quantity to existing inventory</p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Product Name
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={product.name}
                                    disabled
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 font-medium cursor-not-allowed transition-colors"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <span className="text-gray-400 text-sm">🔒</span>
                                </div>
                            </div>
                        </div>

                        {/* Current Quantity */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Current Quantity
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={product.quantity}
                                    disabled
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 font-medium cursor-not-allowed transition-colors"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <span className="text-gray-400 text-sm">📊</span>
                                </div>
                            </div>
                        </div>

                        {/* Quantity to Add */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Quantity to Add *
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="addedQuantity"
                                    value={addedQuantity}
                                    onChange={(e) => setAddedQuantity(e.target.value)}
                                    min="1"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-colors"
                                    required
                                    placeholder="Enter quantity to add"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <span className="text-gray-400 text-sm">➕</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Enter the number of items you want to add to current stock
                            </p>
                        </div>

                        {/* New Total Preview */}
                        {addedQuantity > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-blue-800">New Total Quantity:</span>
                                    <span className="text-lg font-bold text-blue-800">
                                        {parseInt(product.quantity) + parseInt(addedQuantity)} units
                                    </span>
                                </div>
                                <div className="text-xs text-blue-600 mt-1">
                                    Current {product.quantity} + Added {addedQuantity}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate("/dashboard")}
                                className="flex-1 bg-gray-500 text-white font-semibold py-3 px-4 rounded-xl hover:bg-gray-600 transition-colors shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={addedQuantity <= 0}
                            >
                                Update Quantity
                            </button>
                        </div>
                    </form>
                </div>

                {/* Product Info Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 mt-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">Category:</span>
                            <p className="font-medium text-gray-900">{product.category}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Price:</span>
                            <p className="font-medium text-gray-900">₦{product.price}</p>
                        </div>
                        {product.selling_price && (
                            <div>
                                <span className="text-gray-500">Selling Price:</span>
                                <p className="font-medium text-gray-900">₦{product.selling_price}</p>
                            </div>
                        )}
                        {product.description && (
                            <div className="col-span-2">
                                <span className="text-gray-500">Description:</span>
                                <p className="font-medium text-gray-900 mt-1">{product.description}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stocking;