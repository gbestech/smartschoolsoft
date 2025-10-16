import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    selling_price: "",
    quantity: "",
    category: "ELECTRONICS",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem('token');
      console.log('Sending product data:', formData);
      console.log('Token exists:', !!token);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/products/",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`
          },
          timeout: 10000
        }
      );

      console.log('Product added successfully:', response.data);
      setSuccess("✅ Product has been added successfully!");

      setFormData({
        name: "",
        description: "",
        price: "",
        selling_price: "",
        quantity: "",
        category: "ELECTRONICS",
      });

      setTimeout(() => {
        setIsModalOpen(false);
        navigate("/products/all");
      }, 1000);
    } catch (err) {
      console.error('Error adding product:', err);
      console.error('Full error object:', err);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);

      if (err.response) {
        // Server responded with error status
        if (err.response.status === 400) {
          // Validation errors from Django
          const errors = err.response.data;
          console.log('Validation errors:', errors);

          let errorMessage = "Please fix the verify your action:\n";

          // Handle different error formats
          if (typeof errors === 'object') {
            Object.keys(errors).forEach(key => {
              if (Array.isArray(errors[key])) {
                errors[key].forEach(msg => {
                  errorMessage += `• ${key}: ${msg}\n`;
                });
              } else {
                errorMessage += `• ${key}: ${errors[key]}\n`;
              }
            });
          } else if (typeof errors === 'string') {
            errorMessage = errors;
          } else if (errors.detail) {
            errorMessage = errors.detail;
          }

          setError(errorMessage);
        } else if (err.response.status === 401) {
          setError("❌ Authentication required. Please log in and try again.");
        } else if (err.response.status === 403) {
          setError("❌ You don't have permission to add products.");
        } else if (err.response.status === 404) {
          setError("❌ API endpoint not found. Please check the URL.");
        } else if (err.response.status === 500) {
          setError("❌ Server error. Please try again later.");
        } else {
          setError(`❌ Server Error (${err.response.status}): ${JSON.stringify(err.response.data)}`);
        }
      } else if (err.request) {
        // Request was made but no response received
        console.error('No response received:', err.request);
        setError("❌ Cannot connect to server. Please check:\n• Django server is running on http://127.0.0.1:8000\n• CORS is properly configured\n• Network connection is stable");
      } else {
        // Other errors
        console.error('Other error:', err.message);
        setError(`❌ Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      selling_price: "",
      quantity: "",
      category: "ELECTRONICS",
    });
    setError("");
    setSuccess("");
    setIsModalOpen(false);
    navigate("/products/all");
  };

  const handleClose = () => {
    setError("");
    setSuccess("");
    setIsModalOpen(false);
    navigate("/products/all");
  };

  return isModalOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white w-full max-w-2xl p-6 rounded-lg shadow-lg">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add New Product</h2>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <span className="text-red-500 mr-2 mt-0.5">⚠️</span>
              <div>
                <span className="text-red-700 text-sm font-medium block mb-1">Validation Error</span>
                <pre className="text-red-600 text-xs whitespace-pre-wrap">{error}</pre>
              </div>
            </div>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Product name"
              required
            />
          </div>

          {/* Cost Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cost Price (₦) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="0.00"
              required
            />
          </div>

          {/* Selling Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selling Price (₦) *
            </label>
            <input
              type="number"
              name="selling_price"
              value={formData.selling_price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="0.00"
              required
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="0"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              required
            >
              <option value="ELECTRONICS">Electronics</option>
              <option value="FRUIT">Fruit</option>
              <option value="DRINKS">Drinks</option>
              <option value="GRAIN">Grain</option>
            </select>
          </div>

          {/* Description - Full Width */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Product description"
              required
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                'Add Product'
              )}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Clear Form
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-red-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
};

export default AddProduct;