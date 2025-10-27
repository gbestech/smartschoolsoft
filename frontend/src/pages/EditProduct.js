import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    selling_price: "",
    quantity: "",
    category: "ELECTRONICS",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [productExists, setProductExists] = useState(true);
  const [debugInfo, setDebugInfo] = useState("");

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        setDebugInfo("");

        // Get all products and find the one we need
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://127.0.0.1:8000/api/products/",
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        setDebugInfo(
          `Fetched ${response.data.length} products, looking for ID: ${id}`
        );
        console.log("All products:", response.data);

        const product = response.data.find((p) => p.id == id);

        if (product) {
          setFormData({
            name: product.name || "",
            description: product.description || "",
            price: product.price || "",
            selling_price: product.selling_price || "",
            quantity: product.quantity || "",
            category: product.category || "ELECTRONICS",
          });
          setProductExists(true);
          setDebugInfo(`Found product: ${product.name} (ID: ${product.id})`);
        } else {
          setProductExists(false);
          const errorMsg = `Product with ID ${id} not found in the system. Available IDs: ${response.data
            .map((p) => p.id)
            .join(", ")}`;
          setError(errorMsg);
          setDebugInfo(errorMsg);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        const errorMsg =
          "Failed to load products. Please check your backend connection.";
        setError(errorMsg);
        setDebugInfo(
          `Error: ${err.message} - Status: ${
            err.response?.status
          } - Data: ${JSON.stringify(err.response?.data)}`
        );
        setProductExists(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      parseFloat(formData.price) <= 0 ||
      parseFloat(formData.selling_price) <= 0
    ) {
      const errorMsg =
        "Price and selling price must be positive values (greater than 0).";
      setError(errorMsg);
      setDebugInfo("Frontend validation failed: Price values must be positive");
      return;
    }

    if (parseInt(formData.quantity) < 0) {
      const errorMsg = "Quantity cannot be negative. Please enter 0 or higher.";
      setError(errorMsg);
      setDebugInfo("Frontend validation failed: Quantity cannot be negative");
      return;
    }

    if (parseFloat(formData.selling_price) < parseFloat(formData.price)) {
      const errorMsg =
        "Selling price cannot be less than cost price. Please adjust your prices.";
      setError(errorMsg);
      setDebugInfo("Frontend validation failed: Selling price < Cost price");
      return;
    }

    setUpdating(true);
    setError(null);
    setDebugInfo("Starting update process...");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        const errorMsg = "Authentication required. Please log in again.";
        setError(errorMsg);
        setDebugInfo("No authentication token found in localStorage");
        setUpdating(false);
        return;
      }

      // Try PATCH first, then PUT
      const endpoint = `http://127.0.0.1:8000/api/products/${id}/`;

      const updateData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        selling_price: parseFloat(formData.selling_price),
        quantity: parseInt(formData.quantity),
        category: formData.category,
      };

      console.log("Updating product:", updateData);
      setDebugInfo(
        `Sending PATCH request to: ${endpoint} with data: ${JSON.stringify(
          updateData
        )}`
      );

      let response;
      try {
        response = await axios.patch(endpoint, updateData, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });
        setDebugInfo("PATCH request successful");
      } catch (patchError) {
        setDebugInfo(`PATCH failed: ${patchError.message}. Trying PUT...`);
        console.log("PATCH failed, trying PUT...");
        response = await axios.put(endpoint, updateData, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });
        setDebugInfo("PUT request successful as fallback");
      }

      console.log("Update successful:", response.data);
      setDebugInfo("Product updated successfully!");

      // Show success and redirect
      alert("✅ Product updated successfully!");
      setTimeout(() => {
        navigate("/admin/products/all");
      }, 1000);
    } catch (err) {
      console.error("Update error:", err);

      let errorMessage = "Failed to update product. ";
      let debugMessage = `Error: ${err.message} - Status: ${err.response?.status}`;

      if (err.response?.status === 404) {
        errorMessage =
          "Product not found. It may have been deleted from the system.";
        debugMessage += " - 404 Not Found";
        setProductExists(false);
      } else if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
        debugMessage += " - 401 Unauthorized";
      } else if (err.response?.status === 403) {
        errorMessage =
          "You don't have permission to edit this product. Only the creator or admin can edit products.";
        debugMessage += " - 403 Forbidden";
      } else if (err.response?.status === 405) {
        errorMessage =
          "Update method not allowed. The server doesn't accept PATCH/PUT requests at this endpoint.";
        debugMessage += " - 405 Method Not Allowed";
      } else if (err.response?.status === 400) {
        errorMessage = "Invalid data submitted. Please check your input:\n\n";
        const backendErrors = err.response.data;

        if (typeof backendErrors === "object") {
          Object.keys(backendErrors).forEach((key) => {
            if (Array.isArray(backendErrors[key])) {
              errorMessage += `• ${key}: ${backendErrors[key].join(", ")}\n`;
            } else {
              errorMessage += `• ${key}: ${backendErrors[key]}\n`;
            }
          });
        } else {
          errorMessage += backendErrors;
        }
        debugMessage += ` - Validation errors: ${JSON.stringify(
          backendErrors
        )}`;
      } else if (err.response?.status === 500) {
        errorMessage =
          "Server error. Please try again later or contact support.";
        debugMessage += " - 500 Internal Server Error";
      } else if (err.request) {
        errorMessage =
          "Cannot connect to server. Please check:\n• Django server is running\n• Correct URL (http://127.0.0.1:8000)\n• Network connection";
        debugMessage += " - No response received from server";
      } else {
        errorMessage = "An unexpected error occurred. Please try again.";
        debugMessage += " - Unexpected error";
      }

      setError(errorMessage);
      setDebugInfo(debugMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/products/all");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading product...</p>
          {debugInfo && (
            <p className="mt-2 text-sm text-gray-500 max-w-md">{debugInfo}</p>
          )}
        </div>
      </div>
    );
  }

  if (!productExists) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-red-600">📦</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Product Not Found
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          {debugInfo && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800 text-left">{debugInfo}</p>
            </div>
          )}
          <div className="space-y-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate("/admin/products/all")}
              className="w-full bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              View All Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600 mt-2">
                Update product information and details
              </p>
              <p className="text-sm text-gray-500 mt-1">Product ID: #{id}</p>
            </div>
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors w-full sm:w-auto"
            >
              Back to Products
            </button>
          </div>
        </div>

        {/* Debug Information - Only show in development */}
        {debugInfo && process.env.NODE_ENV === "development" && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-blue-500 mr-2">🐛</span>
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-1">
                  Debug Info
                </h4>
                <p className="text-xs text-blue-700 whitespace-pre-wrap">
                  {debugInfo}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="text-2xl mr-4">📦</div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Product ID
                </h3>
                <p className="text-xl font-bold text-gray-900">#{id}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="text-2xl mr-4">💰</div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Current Stock
                </h3>
                <p className="text-xl font-bold text-gray-900">
                  {formData.quantity} units
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="text-2xl mr-4">🏷️</div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Category</h3>
                <p className="text-sm font-bold text-gray-900">
                  {formData.category}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <span className="text-red-500 mr-3 mt-0.5">⚠️</span>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 mb-2">
                  Unable to Update Product
                </h4>
                <span className="text-red-700 text-sm whitespace-pre-line">
                  {error}
                </span>
                <div className="mt-3 text-xs text-red-600">
                  <p>
                    <strong>Common solutions:</strong>
                  </p>
                  <ul className="list-disc list-inside mt-1">
                    <li>Check all required fields are filled</li>
                    <li>Ensure prices are positive numbers</li>
                    <li>Verify quantity is not negative</li>
                    <li>Check your internet connection</li>
                    <li>Make sure you're logged in</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Product Details
            </h2>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Enter product name"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    required
                    placeholder="Enter product description"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Price (₦) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be greater than 0
                  </p>
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price (₦) *
                  </label>
                  <input
                    type="number"
                    name="selling_price"
                    value={formData.selling_price}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be greater than cost price
                  </p>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    min="0"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cannot be negative
                  </p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="ELECTRONICS">Electronics</option>
                    <option value="FRUIT">Fruit</option>
                    <option value="DRINKS">Drinks</option>
                    <option value="GRAIN">Grain</option>
                    <option value="FOOD">Food</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-500 text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors order-2 sm:order-1"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                  disabled={updating}
                >
                  {updating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    "Update Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
