// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth } from './context/AuthContext';
// import { useNavigate } from 'react-router-dom';

// const Inventory = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   useEffect(() => {
//     // Filter products based on search term
//     const filtered = products.filter(product =>
//       product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       product.category?.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredProducts(filtered);
//     setCurrentPage(1); // Reset to first page when search changes
//   }, [searchTerm, products]);

//   const fetchProducts = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get('http://127.0.0.1:8000/api/products/', {
//         headers: {
//           'Authorization': `Token ${token}`
//         }
//       });
//       console.log('API Response:', response.data);
//       setProducts(response.data);
//       setFilteredProducts(response.data);
//     } catch (err) {
//       setError('Failed to fetch products. Please try again.');
//       console.error('Error fetching products:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Calculate total profit
//   const calculateTotalProfit = () => {
//     return filteredProducts.reduce((total, product) => {
//       const profit = parseFloat(product.selling_price) - parseFloat(product.price);
//       return total + (profit * product.quantity);
//     }, 0);
//   };

//   // Calculate total potential profit (if all items are sold)
//   const calculateTotalPotentialProfit = () => {
//     return filteredProducts.reduce((total, product) => {
//       const profitPerItem = parseFloat(product.selling_price) - parseFloat(product.price);
//       return total + (profitPerItem * product.quantity);
//     }, 0);
//   };

//   // Calculate profit margin percentage
//   const calculateAverageProfitMargin = () => {
//     if (filteredProducts.length === 0) return 0;

//     const totalMargin = filteredProducts.reduce((total, product) => {
//       const profitMargin = parseFloat(product.profit_margin) || 0;
//       return total + profitMargin;
//     }, 0);

//     return totalMargin / filteredProducts.length;
//   };

//   const handleDelete = async (productId) => {
//     if (window.confirm('Are you sure you want to delete this product?')) {
//       try {
//         const token = localStorage.getItem('token');
//         await axios.delete(`http://127.0.0.1:8000/api/products/${productId}/`, {
//           headers: {
//             'Authorization': `Token ${token}`
//           }
//         });
//         setProducts(products.filter(product => product.id !== productId));
//       } catch (err) {
//         setError('Failed to delete product.');
//         console.error('Error deleting product:', err);
//       }
//     }
//   };

//   const handleEdit = (product) => {
//     console.log('Edit product:', product);
//     if (product.id) {
//       navigate(`/edit-product/${product.id}`);
//     } else if (product.id) {
//       navigate(`/edit-product/${product.id}`);
//     } else {
//       console.error('No valid identifier found for product:', product);
//       alert('Cannot edit product: No valid identifier found');
//     }
//   };

//   const handleStock = (product) => {
//     console.log('Stock product:', product);
//     if (product.id) {
//       navigate(`/addToExisting/${product.id}`);
//     } else if (product.id) {
//       navigate(`/addToExisting/${product.id}`);
//     } else {
//       console.error('No valid identifier found for product:', product);
//       alert('Cannot stock product: No valid identifier found');
//     }
//   };

//   // Pagination calculations
//   const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

//   // Handle page change
//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   // Generate page numbers for pagination
//   const getPageNumbers = () => {
//     const pageNumbers = [];
//     const maxPagesToShow = 5;

//     if (totalPages <= maxPagesToShow) {
//       for (let i = 1; i <= totalPages; i++) {
//         pageNumbers.push(i);
//       }
//     } else {
//       const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
//       const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

//       for (let i = startPage; i <= endPage; i++) {
//         pageNumbers.push(i);
//       }
//     }

//     return pageNumbers;
//   };

//   if (loading) {
//     return (
//       <div className="p-6 w-full">
//         <div className="flex justify-center items-center h-64">
//           <div className="text-lg text-gray-600">Loading products...</div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6 w-full">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
//           <div className="flex items-center">
//             <span className="text-red-500 mr-3">⚠️</span>
//             <span className="text-red-700">{error}</span>
//           </div>
//           <button
//             onClick={fetchProducts}
//             className="mt-3 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const totalProfit = calculateTotalProfit();
//   const totalPotentialProfit = calculateTotalPotentialProfit();
//   const averageProfitMargin = calculateAverageProfitMargin();

//   return (
//     <div className="p-6 w-full">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-800">All Products</h1>
//         <p className="text-gray-600 mt-2">Manage and view all products in the system</p>
//       </div>

//       {/* Stats Overview */}
//       <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
//         <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//           <div className="flex items-center">
//             <div className="text-2xl mr-4">📦</div>
//             <div>
//               <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
//               <p className="text-2xl font-bold text-gray-800">{filteredProducts.length}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//           <div className="flex items-center">
//             <div className="text-2xl mr-4">💰</div>
//             <div>
//               <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
//               <p className="text-2xl font-bold text-gray-800">
//                 ₦{filteredProducts.reduce((sum, product) => sum + (parseFloat(product.selling_price) * product.quantity), 0).toLocaleString()}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//           <div className="flex items-center">
//             <div className="text-2xl mr-4">💵</div>
//             <div>
//               <h3 className="text-sm font-medium text-gray-500">Total Profit</h3>
//               <p className="text-2xl font-bold text-green-600">
//                 ₦{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//           <div className="flex items-center">
//             <div className="text-2xl mr-4">📊</div>
//             <div>
//               <h3 className="text-sm font-medium text-gray-500">Avg Margin</h3>
//               <p className="text-2xl font-bold text-blue-600">
//                 {averageProfitMargin.toFixed(1)}%
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//           <div className="flex items-center">
//             <div className="text-2xl mr-4">⚠️</div>
//             <div>
//               <h3 className="text-sm font-medium text-gray-500">Low Stock</h3>
//               <p className="text-2xl font-bold text-orange-600">
//                 {filteredProducts.filter(product => product.quantity < 10).length}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Search and Controls */}
//       <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           {/* Search Bar */}
//           <div className="flex-1 max-w-md">
//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//               </div>
//               <input
//                 type="text"
//                 placeholder="Search products by name, description, or category..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//               />
//               {searchTerm && (
//                 <button
//                   onClick={() => setSearchTerm('')}
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                 >
//                   <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Controls */}
//           <div className="flex items-center space-x-3">
//             <div className="text-sm text-gray-500">
//               Showing {Math.min(currentProducts.length, itemsPerPage)} of {filteredProducts.length} products
//             </div>
//             <button
//               onClick={fetchProducts}
//               className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center"
//             >
//               <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//               </svg>
//               Refresh
//             </button>
//           </div>
//         </div>

//         {/* Search Results Info */}
//         {searchTerm && (
//           <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
//             <div className="flex items-center text-sm text-blue-700">
//               <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               Found {filteredProducts.length} products matching "{searchTerm}"
//               <button
//                 onClick={() => setSearchTerm('')}
//                 className="ml-2 text-blue-500 hover:text-blue-700 underline text-xs"
//               >
//                 Clear search
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Additional Profit Summary */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//         <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm p-6 border border-green-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="text-sm font-medium text-green-800">Potential Total Profit</h3>
//               <p className="text-2xl font-bold text-green-700 mt-2">
//                 ₦{totalPotentialProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//               </p>
//               <p className="text-sm text-green-600 mt-1">
//                 If all {filteredProducts.reduce((sum, product) => sum + product.quantity, 0)} items are sold
//               </p>
//             </div>
//             <div className="text-3xl">🚀</div>
//           </div>
//         </div>

//         <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg shadow-sm p-6 border border-blue-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="text-sm font-medium text-blue-800">Profit Performance</h3>
//               <p className="text-2xl font-bold text-blue-700 mt-2">
//                 {filteredProducts.filter(product => parseFloat(product.profit_margin) > 20).length} / {filteredProducts.length}
//               </p>
//               <p className="text-sm text-blue-600 mt-1">
//                 Products with over 20% profit margin
//               </p>
//             </div>
//             <div className="text-3xl">📈</div>
//           </div>
//         </div>
//       </div>

//       {/* Products Table */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//         <div className="p-6 border-b border-gray-200">
//           <div className="flex justify-between items-center">
//             <h3 className="text-xl font-semibold text-gray-800">
//               Products ({filteredProducts.length})
//             </h3>
//             <div className="text-sm text-gray-500">
//               Page {currentPage} of {totalPages}
//             </div>
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
//                   Product
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
//                   Category
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
//                   Cost Price
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
//                   Selling Price
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
//                   Quantity
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
//                   Profit
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {currentProducts.map((product) => {
//                 const profitPerItem = parseFloat(product.selling_price) - parseFloat(product.price);
//                 const totalProductProfit = profitPerItem * product.quantity;

//                 return (
//                   <tr key={product.id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <div className="ml-4">
//                           <div className="text-sm font-medium text-gray-900">
//                             {product.name}
//                           </div>
//                           <div className="text-sm text-gray-500 truncate max-w-xs">
//                             {product.description}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.category === 'ELECTRONICS' ? 'bg-blue-100 text-blue-800' :
//                         product.category === 'FRUIT' ? 'bg-green-100 text-green-800' :
//                           product.category === 'DRINKS' ? 'bg-purple-100 text-purple-800' :
//                             'bg-orange-100 text-orange-800'
//                         }`}>
//                         {product.category}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       ₦{parseFloat(product.price).toLocaleString()}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       ₦{parseFloat(product.selling_price).toLocaleString()}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.quantity < 10
//                         ? 'bg-red-100 text-red-800'
//                         : product.quantity < 20
//                           ? 'bg-yellow-100 text-yellow-800'
//                           : 'bg-green-100 text-green-800'
//                         }`}>
//                         {product.quantity} units
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                       <div className="text-green-600 font-medium">
//                         ₦{totalProductProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                       </div>
//                       <div className="text-gray-500 text-xs">
//                         {parseFloat(product.profit_margin).toFixed(1)}% margin
//                       </div>
//                       <div className="text-gray-400 text-xs">
//                         ₦{profitPerItem.toFixed(2)} per item
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <div className="flex space-x-2">
//                         <button
//                           onClick={() => handleEdit(product)}
//                           className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors text-xs"
//                         >
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => handleStock(product)}
//                           className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded transition-colors text-xs"
//                         >
//                           Stock
//                         </button>
//                         <button
//                           onClick={() => handleDelete(product.id)}
//                           className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors text-xs"
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>

//           {filteredProducts.length === 0 && (
//             <div className="text-center py-12">
//               <div className="text-4xl mb-4">📦</div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                 {searchTerm ? 'No Products Found' : 'No Products Available'}
//               </h3>
//               <p className="text-gray-500">
//                 {searchTerm
//                   ? `No products found matching "${searchTerm}". Try a different search term.`
//                   : 'Get started by adding your first product to the system.'
//                 }
//               </p>
//               {searchTerm && (
//                 <button
//                   onClick={() => setSearchTerm('')}
//                   className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
//                 >
//                   Clear Search
//                 </button>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="px-6 py-4 border-t border-gray-200">
//             <div className="flex items-center justify-between">
//               <div className="text-sm text-gray-500">
//                 Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} results
//               </div>
//               <div className="flex space-x-1">
//                 {/* Previous Button */}
//                 <button
//                   onClick={() => handlePageChange(currentPage - 1)}
//                   disabled={currentPage === 1}
//                   className={`px-3 py-1 rounded-lg text-sm font-medium ${currentPage === 1
//                     ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                     : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
//                     }`}
//                 >
//                   Previous
//                 </button>

//                 {/* Page Numbers */}
//                 {getPageNumbers().map(page => (
//                   <button
//                     key={page}
//                     onClick={() => handlePageChange(page)}
//                     className={`px-3 py-1 rounded-lg text-sm font-medium ${currentPage === page
//                       ? 'bg-blue-500 text-white'
//                       : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
//                       }`}
//                   >
//                     {page}
//                   </button>
//                 ))}

//                 {/* Next Button */}
//                 <button
//                   onClick={() => handlePageChange(currentPage + 1)}
//                   disabled={currentPage === totalPages}
//                   className={`px-3 py-1 rounded-lg text-sm font-medium ${currentPage === totalPages
//                     ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                     : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
//                     }`}
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Footer Summary */}
//       {filteredProducts.length > 0 && (
//         <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
//           <div className="flex justify-between items-center">
//             <div>
//               <h4 className="font-semibold text-gray-800">Profit Summary</h4>
//               <p className="text-sm text-gray-600">
//                 Based on current inventory and pricing
//               </p>
//             </div>
//             <div className="text-right">
//               <p className="text-2xl font-bold text-green-600">
//                 ₦{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//               </p>
//               <p className="text-sm text-gray-600">
//                 Total Profit
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Inventory;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Inventory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter products based on search term
    const filtered = products.filter(product =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.batch_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/products/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      console.log('API Response:', response.data);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total profit
  const calculateTotalProfit = () => {
    return filteredProducts.reduce((total, product) => {
      const profit = parseFloat(product.selling_price) - parseFloat(product.price);
      return total + (profit * product.quantity);
    }, 0);
  };

  // Calculate total potential profit (if all items are sold)
  const calculateTotalPotentialProfit = () => {
    return filteredProducts.reduce((total, product) => {
      const profitPerItem = parseFloat(product.selling_price) - parseFloat(product.price);
      return total + (profitPerItem * product.quantity);
    }, 0);
  };

  // Calculate profit margin percentage
  const calculateAverageProfitMargin = () => {
    if (filteredProducts.length === 0) return 0;

    const totalMargin = filteredProducts.reduce((total, product) => {
      const profitMargin = parseFloat(product.profit_margin) || 0;
      return total + profitMargin;
    }, 0);

    return totalMargin / filteredProducts.length;
  };

  // Check if product is expired
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  // Check if product is near expiry (within 30 days)
  const isNearExpiry = (expiryDate) => {
    if (!expiryDate) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return new Date(expiryDate) <= thirtyDaysFromNow && !isExpired(expiryDate);
  };

  // Check if product is low stock
  const isLowStock = (product) => {
    return product.quantity <= (product.min_stock_level || 10);
  };

  // Check if product is overstocked
  const isOverstocked = (product) => {
    return product.max_stock_level && product.quantity > product.max_stock_level;
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://127.0.0.1:8000/api/products/${productId}/`, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        setProducts(products.filter(product => product.id !== productId));
      } catch (err) {
        setError('Failed to delete product.');
        console.error('Error deleting product:', err);
      }
    }
  };

  const handleEdit = (product) => {
    console.log('Edit product:', product);
    if (product.id) {
      navigate(`/edit-product/${product.id}`);
    } else if (product.id) {
      navigate(`/edit-product/${product.id}`);
    } else {
      console.error('No valid identifier found for product:', product);
      alert('Cannot edit product: No valid identifier found');
    }
  };

  const handleStock = (product) => {
    console.log('Stock product:', product);
    if (product.id) {
      navigate(`/addToExisting/${product.id}`);
    } else if (product.id) {
      navigate(`/addToExisting/${product.id}`);
    } else {
      console.error('No valid identifier found for product:', product);
      alert('Cannot stock product: No valid identifier found');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

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
            onClick={fetchProducts}
            className="mt-3 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalProfit = calculateTotalProfit();
  const totalPotentialProfit = calculateTotalPotentialProfit();
  const averageProfitMargin = calculateAverageProfitMargin();

  // Count expired and near-expiry products
  const expiredProductsCount = filteredProducts.filter(product => isExpired(product.expiry_date)).length;
  const nearExpiryProductsCount = filteredProducts.filter(product => isNearExpiry(product.expiry_date)).length;
  const lowStockProductsCount = filteredProducts.filter(product => isLowStock(product)).length;

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
        <p className="text-gray-600 mt-2">Complete inventory overview with stock tracking</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl mr-4">📦</div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
              <p className="text-2xl font-bold text-gray-800">{filteredProducts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl mr-4">💰</div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
              <p className="text-2xl font-bold text-gray-800">
                ₦{filteredProducts.reduce((sum, product) => sum + (parseFloat(product.selling_price) * product.quantity), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl mr-4">💵</div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Profit</h3>
              <p className="text-2xl font-bold text-green-600">
                ₦{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl mr-4">⚠️</div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Low Stock</h3>
              <p className="text-2xl font-bold text-orange-600">
                {lowStockProductsCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl mr-4">⏰</div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Near Expiry</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {nearExpiryProductsCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl mr-4">❌</div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Expired</h3>
              <p className="text-2xl font-bold text-red-600">
                {expiredProductsCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name, category, supplier, or batch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500">
              Showing {Math.min(currentProducts.length, itemsPerPage)} of {filteredProducts.length} products
            </div>
            <button
              onClick={fetchProducts}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center text-sm text-blue-700">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Found {filteredProducts.length} products matching "{searchTerm}"
              <button
                onClick={() => setSearchTerm('')}
                className="ml-2 text-blue-500 hover:text-blue-700 underline text-xs"
              >
                Clear search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">
              Inventory Details ({filteredProducts.length})
            </h3>
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pricing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Levels
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier & Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentProducts.map((product) => {
                const profitPerItem = parseFloat(product.selling_price) - parseFloat(product.price);
                const totalProductProfit = profitPerItem * product.quantity;
                const expired = isExpired(product.expiry_date);
                const nearExpiry = isNearExpiry(product.expiry_date);
                const lowStock = isLowStock(product);
                const overstocked = isOverstocked(product);

                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    {/* Product Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                          {product.batch_number && (
                            <div className="text-xs text-gray-400 mt-1">
                              Batch: {product.batch_number}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.category === 'ELECTRONICS' ? 'bg-blue-100 text-blue-800' :
                        product.category === 'FRUIT' ? 'bg-green-100 text-green-800' :
                          product.category === 'DRINKS' ? 'bg-purple-100 text-purple-800' :
                            'bg-orange-100 text-orange-800'
                        }`}>
                        {product.category}
                      </span>
                    </td>

                    {/* Pricing */}
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900">
                          Cost: ₦{parseFloat(product.price).toLocaleString()}
                        </div>
                        <div className="text-gray-900 font-medium">
                          Sell: ₦{parseFloat(product.selling_price).toLocaleString()}
                        </div>
                        <div className="text-green-600 text-xs">
                          Profit: ₦{profitPerItem.toFixed(2)}
                        </div>
                      </div>
                    </td>

                    {/* Stock Levels */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Current:</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${lowStock
                            ? 'bg-red-100 text-red-800'
                            : overstocked
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                            }`}>
                            {product.quantity} units
                          </span>
                        </div>
                        {product.min_stock_level > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Min:</span>
                            <span className="text-xs text-gray-700">{product.min_stock_level}</span>
                          </div>
                        )}
                        {product.max_stock_level > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Max:</span>
                            <span className="text-xs text-gray-700">{product.max_stock_level}</span>
                          </div>
                        )}
                        {product.reorder_point > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Reorder:</span>
                            <span className="text-xs text-blue-600">{product.reorder_point}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        {product.manufacturing_date && (
                          <div>
                            <div className="text-xs text-gray-500">Manufactured:</div>
                            <div className="text-gray-700">{formatDate(product.manufacturing_date)}</div>
                          </div>
                        )}
                        {product.expiry_date && (
                          <div>
                            <div className="text-xs text-gray-500">Expires:</div>
                            <div className={`font-medium ${expired
                              ? 'text-red-600'
                              : nearExpiry
                                ? 'text-yellow-600'
                                : 'text-green-600'
                              }`}>
                              {formatDate(product.expiry_date)}
                              {expired && <span className="ml-1 text-xs">(Expired)</span>}
                              {nearExpiry && !expired && <span className="ml-1 text-xs">(Soon)</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Supplier & Location */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        {product.supplier && (
                          <div>
                            <div className="text-xs text-gray-500">Supplier:</div>
                            <div className="text-gray-700 truncate max-w-xs">{product.supplier}</div>
                          </div>
                        )}
                        {product.location && (
                          <div>
                            <div className="text-xs text-gray-500">Location:</div>
                            <div className="text-gray-700">{product.location}</div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleStock(product)}
                          className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded transition-colors text-xs"
                        >
                          Stock
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No Products Found' : 'No Products Available'}
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? `No products found matching "${searchTerm}". Try a different search term.`
                  : 'Get started by adding your first product to the system.'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} results
              </div>
              <div className="flex space-x-1">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;