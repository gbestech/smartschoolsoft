import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    selling_price: "",
    quantity: "",
    category: "ELECTRONICS",
    expiry_date: "",
    manufacturing_date: "",
    batch_number: "",
    supplier: "",
    min_stock_level: "",
    max_stock_level: "",
    barcode: "",
    location: "",
    weight: "",
    dimensions: "",
    is_perishable: false,
    reorder_point: ""
  });

  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("basic");

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoadingSuppliers(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://127.0.0.1:8000/api/suppliers/",
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );
        setSuppliers(response.data.results || response.data);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
        toast.error("Failed to load suppliers");
      } finally {
        setLoadingSuppliers(false);
      }
    };

    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation for pricing
    if (formData.price && formData.selling_price && parseFloat(formData.price) > parseFloat(formData.selling_price)) {
      setError("❌ Selling price must be greater than cost price to make a profit.");
      toast.error("❌ Selling price must be greater than cost price");
      setLoading(false);
      return;
    }

    // Validation for dates
    if (formData.expiry_date && formData.manufacturing_date) {
      const manufacturingDate = new Date(formData.manufacturing_date);
      const expiryDate = new Date(formData.expiry_date);

      if (expiryDate <= manufacturingDate) {
        setError("❌ Expiry date must be after manufacturing date");
        toast.error("❌ Expiry date must be after manufacturing date");
        setLoading(false);
        return;
      }
    }

    // Validation for stock levels
    if (formData.min_stock_level && formData.max_stock_level) {
      const minStock = parseInt(formData.min_stock_level);
      const maxStock = parseInt(formData.max_stock_level);

      if (minStock >= maxStock) {
        setError("❌ Maximum stock level must be greater than minimum stock level");
        toast.error("❌ Maximum stock level must be greater than minimum stock level");
        setLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      console.log("Sending product data:", formData);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/products/",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          timeout: 10000,
        }
      );

      console.log("Product added successfully:", response.data);
      setSuccess("✅ Product has been added successfully!");
      toast.success("✅ Product has been added successfully!");

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        selling_price: "",
        quantity: "",
        category: "ELECTRONICS",
        expiry_date: "",
        manufacturing_date: "",
        batch_number: "",
        supplier: "",
        min_stock_level: "",
        max_stock_level: "",
        barcode: "",
        location: "",
        weight: "",
        dimensions: "",
        is_perishable: false,
        reorder_point: ""
      });

      setTimeout(() => {
        setIsModalOpen(false);
        navigate("/products/all");
      }, 1000);
    } catch (err) {
      console.error("Error adding product:", err);

      let errorMessage = "";

      if (err.response) {
        if (err.response.status === 400) {
          const errors = err.response.data;
          errorMessage = "Please verify your input:\n";

          if (typeof errors === "object") {
            Object.keys(errors).forEach((key) => {
              if (Array.isArray(errors[key])) {
                errors[key].forEach((msg) => {
                  errorMessage += `• ${key}: ${msg}\n`;
                });
              } else {
                errorMessage += `• ${key}: ${errors[key]}\n`;
              }
            });
          } else if (typeof errors === "string") {
            errorMessage = errors;
          } else if (errors.detail) {
            errorMessage = errors.detail;
          }

          toast.error("⚠️ Validation error — please check your input");
        } else if (err.response.status === 401) {
          errorMessage = "❌ Authentication required. Please log in.";
          toast.error(errorMessage);
        } else if (err.response.status === 403) {
          errorMessage = "❌ You don't have permission to add products.";
          toast.error(errorMessage);
        } else if (err.response.status === 500) {
          errorMessage = "❌ Server error. Please try again later.";
          toast.error(errorMessage);
        } else {
          errorMessage = `❌ Server Error (${err.response.status})`;
          toast.error(errorMessage);
        }
      } else if (err.request) {
        errorMessage = "❌ Cannot connect to server. Please check your backend server";
        toast.error("❌ Connection error — check your backend server");
      } else {
        errorMessage = `❌ Error: ${err.message}`;
        toast.error(errorMessage);
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calculate suggested reorder point
  const calculateReorderPoint = () => {
    if (formData.min_stock_level && formData.quantity) {
      const minStock = parseInt(formData.min_stock_level);
      const currentQuantity = parseInt(formData.quantity);
      return Math.max(minStock + 5, Math.floor(currentQuantity * 0.3));
    }
    return "";
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      selling_price: "",
      quantity: "",
      category: "ELECTRONICS",
      expiry_date: "",
      manufacturing_date: "",
      batch_number: "",
      supplier: "",
      min_stock_level: "",
      max_stock_level: "",
      barcode: "",
      location: "",
      weight: "",
      dimensions: "",
      is_perishable: false,
      reorder_point: ""
    });
    setError("");
    setSuccess("");
    setIsModalOpen(false);
    toast.info("Form cleared");
    navigate("/products/all");
  };

  const handleClose = () => {
    setError("");
    setSuccess("");
    setIsModalOpen(false);
    toast.info("Form closed");
    navigate("/products/all");
  };

  const sections = [
    { id: "basic", name: "Basic Info", icon: "📝" },
    { id: "pricing", name: "Pricing", icon: "💰" },
    { id: "inventory", name: "Inventory", icon: "📦" }
  ];

  return isModalOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white w-full max-w-2xl p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
        <ToastContainer position="top-right" autoClose={3000} />

        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add New Product</h2>
          <p className="text-sm text-gray-600 mt-1">Complete inventory information</p>
        </div>

        {/* Section Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${activeSection === section.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <span className="mr-1">{section.icon}</span>
              {section.name}
            </button>
          ))}
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <span className="text-red-500 mr-2 mt-0.5">⚠️</span>
              <div>
                <span className="text-red-700 text-sm font-medium block mb-1">
                  {error.includes("Validation") ? "Validation Error" : "Error"}
                </span>
                <pre className="text-red-600 text-xs whitespace-pre-wrap">
                  {error}
                </pre>
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
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Basic Information Section */}
          {activeSection === "basic" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Basic Information</h3>

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
                  <option value="FOOD">Food</option>
                  <option value="MEDICINE">Medicine</option>
                  <option value="COSMETICS">Cosmetics</option>
                  <option value="STATIONERY">Stationery</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Product description"
                  required
                />
              </div>
            </div>
          )}

          {/* Pricing Section */}
          {activeSection === "pricing" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Pricing</h3>

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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${formData.price && formData.selling_price && parseFloat(formData.price) > parseFloat(formData.selling_price)
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                    }`}
                  placeholder="0.00"
                  required
                />
              </div>

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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${formData.price && formData.selling_price && parseFloat(formData.price) > parseFloat(formData.selling_price)
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                    }`}
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Error message */}
              {formData.price && formData.selling_price && parseFloat(formData.price) > parseFloat(formData.selling_price) && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-red-500 mr-2">⚠️</span>
                    <span className="text-red-700 text-sm">
                      Selling price must be greater than cost price to make a profit.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Inventory Management Section */}
          {activeSection === "inventory" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Inventory Management</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Quantity *
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    name="batch_number"
                    value={formData.batch_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="BATCH-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barcode/SKU
                  </label>
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="123456789012"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <select
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                >
                  <option value="">Select a supplier</option>
                  {loadingSuppliers ? (
                    <option disabled>Loading suppliers...</option>
                  ) : (
                    suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Stock Level
                  </label>
                  <input
                    type="number"
                    name="min_stock_level"
                    value={formData.min_stock_level}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Stock Level
                  </label>
                  <input
                    type="number"
                    name="max_stock_level"
                    value={formData.max_stock_level}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manufacturing Date
                  </label>
                  <input
                    type="date"
                    name="manufacturing_date"
                    value={formData.manufacturing_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="expiry_date"
                    value={formData.expiry_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Storage Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Aisle 1, Shelf B"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reorder Point
                  </label>
                  <input
                    type="number"
                    name="reorder_point"
                    value={formData.reorder_point || calculateReorderPoint()}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Auto-calculated"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_perishable"
                  checked={formData.is_perishable}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  This product is perishable
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => {
                const currentIndex = sections.findIndex(s => s.id === activeSection);
                if (currentIndex > 0) {
                  setActiveSection(sections[currentIndex - 1].id);
                }
              }}
              disabled={activeSection === "basic"}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            <button
              type="button"
              onClick={() => {
                const currentIndex = sections.findIndex(s => s.id === activeSection);
                if (currentIndex < sections.length - 1) {
                  setActiveSection(sections[currentIndex + 1].id);
                }
              }}
              disabled={activeSection === "inventory"}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>

          {/* Submit & Action Buttons - Always Visible */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <button
              type="submit"
              disabled={loading || (formData.price && formData.selling_price && parseFloat(formData.price) > parseFloat(formData.selling_price))}
              className="flex-1 bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adding...
                </>
              ) : (
                "Add Product"
              )}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Clear
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