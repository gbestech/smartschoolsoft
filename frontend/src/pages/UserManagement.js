// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const UserManagement = () => {
//     const [users, setUsers] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [showModal, setShowModal] = useState(false);
//     const [editingUser, setEditingUser] = useState(null);
//     const [error, setError] = useState(null);
//     const [debugInfo, setDebugInfo] = useState('');
//     const [formData, setFormData] = useState({
//         username: '',
//         email: '',
//         first_name: '',
//         last_name: '',
//         password: '',
//         confirm_password: '',
//         user_type: 'user',
//         is_active: true
//     });

//     // API endpoints - using your actual auth_app endpoints
//     const API_BASE = 'http://localhost:8000';
//     const USERS_API = `${API_BASE}/api/users/`; // Your actual users endpoint

//     // Enhanced Role options with descriptions
//     const roleOptions = [
//         { value: 'user', label: 'User', description: 'Can view and make sales', color: 'bg-purple-100 text-purple-800' },
//         { value: 'staff', label: 'Staff', description: 'Can manage products and view reports', color: 'bg-blue-100 text-blue-800' },
//         { value: 'inspector', label: 'Inspector', description: 'Can audit and review system activities', color: 'bg-indigo-100 text-indigo-800' },
//         { value: 'manager', label: 'Manager', description: 'Full access except system settings', color: 'bg-green-100 text-green-800' },
//         { value: 'admin', label: 'Admin', description: 'Full system access including settings', color: 'bg-red-100 text-red-800' }
//     ];

//     // Get auth headers
//     const getAuthHeaders = () => {
//         const token = localStorage.getItem('token') || sessionStorage.getItem('token');
//         return {
//             'Content-Type': 'application/json',
//             'Authorization': token ? `Token ${token}` : ''
//         };
//     };

//     // Fetch real users from your Django backend
//     const fetchUsers = async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const response = await axios.get(USERS_API, {
//                 headers: getAuthHeaders()
//             });

//             console.log('Fetched users from auth_app:', response.data);
//             setUsers(response.data);

//         } catch (error) {
//             console.error('Error fetching users:', error);
//             handleApiError(error, 'Failed to load users');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Enhanced error handling
//     const handleApiError = (error, defaultMessage) => {
//         if (error.response) {
//             switch (error.response.status) {
//                 case 401:
//                     setError('Authentication failed. Please login again.');
//                     break;
//                 case 403:
//                     setError('You do not have permission to view users. Admin access required.');
//                     break;
//                 case 404:
//                     setError('Users endpoint not found. Please ensure your Django API has user endpoints configured.');
//                     break;
//                 case 500:
//                     setError('Server error. Please try again later.');
//                     break;
//                 default:
//                     if (error.response.data) {
//                         // Handle Django validation errors
//                         const errors = Object.values(error.response.data).flat().join(', ');
//                         setError(`Server Error: ${errors}`);
//                     } else {
//                         setError(defaultMessage);
//                     }
//             }
//         } else if (error.request) {
//             setError('Network error. Please check your connection and ensure Django server is running.');
//         } else {
//             setError(defaultMessage);
//         }
//     };

//     useEffect(() => {
//         fetchUsers();
//     }, []);

//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value
//         }));
//     };

//     const handleRoleChange = (userType) => {
//         setFormData(prev => ({
//             ...prev,
//             user_type: userType
//         }));
//     };

//     // Function to change user role directly from table
//     const changeUserRole = async (userId, newRole) => {
//         if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
//             return;
//         }

//         setLoading(true);
//         try {
//             const response = await axios.post(
//                 `${USERS_API}${userId}/change-role/`,
//                 { user_type: newRole },
//                 { headers: getAuthHeaders() }
//             );

//             // Update local state
//             setUsers(users.map(user =>
//                 user.id === userId ? { ...user, user_type: newRole } : user
//             ));

//             alert(`User role changed to ${newRole} successfully!`);
//         } catch (error) {
//             console.error('Error changing user role:', error);

//             if (error.response?.data) {
//                 const errors = Object.values(error.response.data).flat().join(', ');
//                 alert(`Error: ${errors}`);
//             } else {
//                 alert('Failed to change user role. Please try again.');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const validateForm = () => {
//         if (!formData.username.trim()) {
//             setError('Username is required');
//             return false;
//         }
//         if (!formData.email.trim()) {
//             setError('Email is required');
//             return false;
//         }
//         if (!editingUser && !formData.password) {
//             setError('Password is required for new users');
//             return false;
//         }
//         if (formData.password && formData.password !== formData.confirm_password) {
//             setError('Passwords do not match');
//             return false;
//         }
//         if (formData.password && formData.password.length < 6) {
//             setError('Password must be at least 6 characters long');
//             return false;
//         }
//         setError(null);
//         return true;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!validateForm()) return;

//         setLoading(true);
//         setError(null);

//         try {
//             // Prepare data for API - matches your UserRegistrationSerializer
//             const userData = {
//                 username: formData.username.trim(),
//                 email: formData.email.trim(),
//                 first_name: formData.first_name.trim(),
//                 last_name: formData.last_name.trim(),
//                 user_type: formData.user_type,
//                 is_active: formData.is_active
//             };

//             // Only include password for new users or when password is being changed
//             if (formData.password) {
//                 userData.password = formData.password;
//                 userData.confirm_password = formData.confirm_password;
//             }

//             console.log('Sending user data:', userData);

//             let response;
//             if (editingUser) {
//                 // Update existing user - remove password confirm for updates if no password change
//                 const updateData = { ...userData };
//                 if (!formData.password) {
//                     delete updateData.confirm_password;
//                 }

//                 response = await axios.patch(
//                     `${USERS_API}${editingUser.id}/`,
//                     updateData,
//                     { headers: getAuthHeaders() }
//                 );

//                 setUsers(users.map(user =>
//                     user.id === editingUser.id ? response.data : user
//                 ));
//                 alert('User updated successfully!');
//             } else {
//                 // Create new user - use the create endpoint
//                 response = await axios.post(
//                     `${USERS_API}create/`,
//                     userData,
//                     { headers: getAuthHeaders() }
//                 );

//                 setUsers([...users, response.data]);
//                 alert('User created successfully!');
//             }

//             resetForm();
//             fetchUsers(); // Refresh the user list

//         } catch (error) {
//             console.error('Error saving user:', error);

//             if (error.response?.data) {
//                 // Handle Django validation errors
//                 const errors = Object.values(error.response.data).flat().join(', ');
//                 setError(`Server Error: ${errors}`);

//                 // Show detailed error in alert
//                 alert(`Error: ${errors}`);
//             } else {
//                 setError('Failed to save user. Please try again.');
//                 alert('Failed to save user. Please try again.');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleEdit = (user) => {
//         setEditingUser(user);
//         setFormData({
//             username: user.username || '',
//             email: user.email || '',
//             first_name: user.first_name || '',
//             last_name: user.last_name || '',
//             password: '',
//             confirm_password: '',
//             user_type: user.user_type || 'user',
//             is_active: user.is_active !== undefined ? user.is_active : true
//         });
//         setShowModal(true);
//         setError(null);
//     };

//     const handleDelete = async (userId) => {
//         const user = users.find(u => u.id === userId);
//         if (user && (user.user_type === 'admin' || user.is_superuser)) {
//             alert('Cannot delete admin users');
//             return;
//         }

//         if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
//             setLoading(true);
//             try {
//                 await axios.delete(`${USERS_API}${userId}/`, {
//                     headers: getAuthHeaders()
//                 });

//                 setUsers(users.filter(user => user.id !== userId));
//                 alert('User deleted successfully!');
//             } catch (error) {
//                 console.error('Error deleting user:', error);
//                 if (error.response?.data) {
//                     alert(`Error: ${error.response.data.error || 'Failed to delete user'}`);
//                 } else {
//                     alert('Failed to delete user. Please try again.');
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         }
//     };

//     const toggleUserStatus = async (userId, currentStatus) => {
//         const user = users.find(u => u.id === userId);
//         if (user && (user.user_type === 'admin' || user.is_superuser)) {
//             alert('Cannot deactivate admin users');
//             return;
//         }

//         const action = currentStatus ? 'deactivate' : 'activate';

//         if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
//             return;
//         }

//         setLoading(true);
//         try {
//             const response = await axios.post(
//                 `${USERS_API}${userId}/toggle-status/`,
//                 {},
//                 { headers: getAuthHeaders() }
//             );

//             setUsers(users.map(user =>
//                 user.id === userId ? { ...user, is_active: !currentStatus } : user
//             ));

//             alert(`User ${action}d successfully!`);
//         } catch (error) {
//             console.error('Error updating user status:', error);
//             if (error.response?.data) {
//                 alert(`Error: ${error.response.data.error || 'Failed to update user status'}`);
//             } else {
//                 alert('Failed to update user status. Please try again.');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const resetForm = () => {
//         setFormData({
//             username: '',
//             email: '',
//             first_name: '',
//             last_name: '',
//             password: '',
//             confirm_password: '',
//             user_type: 'user',
//             is_active: true
//         });
//         setEditingUser(null);
//         setShowModal(false);
//         setError(null);
//     };

//     const formatDate = (dateString) => {
//         if (!dateString) return 'Never';
//         try {
//             return new Date(dateString).toLocaleDateString('en-US', {
//                 year: 'numeric',
//                 month: 'short',
//                 day: 'numeric'
//             });
//         } catch (error) {
//             return 'Invalid Date';
//         }
//     };

//     // Helper function to get role display
//     const getUserRole = (user) => {
//         return roleOptions.find(role => role.value === user.user_type)?.label || 'User';
//     };

//     // Helper function to get role color
//     const getRoleColor = (user) => {
//         return roleOptions.find(role => role.value === user.user_type)?.color || 'bg-gray-100 text-gray-800';
//     };

//     // Enhanced Statistics with Inspector count
//     const userStats = {
//         total: users.length,
//         active: users.filter(user => user.is_active).length,
//         admins: users.filter(user => user.user_type === 'admin' || user.is_superuser).length,
//         managers: users.filter(user => user.user_type === 'manager').length,
//         inspectors: users.filter(user => user.user_type === 'inspector').length,
//         staff: users.filter(user => user.user_type === 'staff').length,
//         regular: users.filter(user => user.user_type === 'user').length
//     };

//     return (
//         <div className="min-h-screen bg-gray-50 p-6">
//             <div className="max-w-7xl mx-auto">
//                 {/* Header */}
//                 <div className="flex justify-between items-center mb-8">
//                     <div>
//                         <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
//                         <p className="text-gray-600 mt-2">
//                             Manage system users and their permissions
//                         </p>
//                         {/* <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3 max-w-md">
//                             <p className="text-green-800 text-sm">
//                                 <strong>Real Data Mode:</strong> Connected to auth_app API
//                             </p>
//                             <p className="text-green-800 text-sm mt-1">
//                                 <strong>Endpoint:</strong> {USERS_API}
//                             </p>
//                         </div> */}
//                     </div>
//                     <button
//                         className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200 flex items-center space-x-2 disabled:opacity-50"
//                         onClick={() => setShowModal(true)}
//                         disabled={loading}
//                     >
//                         <span>+</span>
//                         <span>Add New User</span>
//                     </button>
//                 </div>

//                 {/* Error Display */}
//                 {error && (
//                     <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
//                         <div className="flex items-center">
//                             <div className="text-red-600 font-medium">Error:</div>
//                             <div className="text-red-600 ml-2">{error}</div>
//                             <button
//                                 className="ml-auto text-red-600 hover:text-red-800"
//                                 onClick={() => setError(null)}
//                             >
//                                 ×
//                             </button>
//                         </div>
//                     </div>
//                 )}

//                 {/* Enhanced Statistics Cards with Inspector */}
//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
//                     <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
//                         <div className="text-2xl font-bold text-gray-900">{userStats.total}</div>
//                         <div className="text-sm text-gray-600">Total Users</div>
//                     </div>
//                     <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
//                         <div className="text-2xl font-bold text-green-600">{userStats.active}</div>
//                         <div className="text-sm text-gray-600">Active Users</div>
//                     </div>
//                     <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
//                         <div className="text-2xl font-bold text-red-600">{userStats.admins}</div>
//                         <div className="text-sm text-gray-600">Admins</div>
//                     </div>
//                     <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
//                         <div className="text-2xl font-bold text-green-600">{userStats.managers}</div>
//                         <div className="text-sm text-gray-600">Managers</div>
//                     </div>
//                     <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
//                         <div className="text-2xl font-bold text-indigo-600">{userStats.inspectors}</div>
//                         <div className="text-sm text-gray-600">Inspectors</div>
//                     </div>
//                     <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
//                         <div className="text-2xl font-bold text-blue-600">{userStats.staff}</div>
//                         <div className="text-sm text-gray-600">Staff</div>
//                     </div>
//                     <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
//                         <div className="text-2xl font-bold text-purple-600">{userStats.regular}</div>
//                         <div className="text-sm text-gray-600">Regular Users</div>
//                     </div>
//                 </div>

//                 {/* Users Table */}
//                 <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//                     {loading && !users.length ? (
//                         <div className="flex justify-center items-center py-12">
//                             <div className="flex items-center space-x-2">
//                                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//                                 <div className="text-gray-600 text-lg">Loading users from database...</div>
//                             </div>
//                         </div>
//                     ) : users.length === 0 ? (
//                         <div className="text-center py-12">
//                             <div className="text-gray-400 text-6xl mb-4">👥</div>
//                             <p className="text-gray-600 mb-4">No users found in database.</p>
//                             <button
//                                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
//                                 onClick={() => setShowModal(true)}
//                             >
//                                 Add First User
//                             </button>
//                         </div>
//                     ) : (
//                         <div className="overflow-x-auto">
//                             <table className="min-w-full divide-y divide-gray-200">
//                                 <thead className="bg-gray-50">
//                                     <tr>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="bg-white divide-y divide-gray-200">
//                                     {users.map(user => (
//                                         <tr
//                                             key={user.id}
//                                             className={!user.is_active ? 'bg-gray-50 opacity-75' : 'hover:bg-gray-50'}
//                                         >
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <div className="flex items-center">
//                                                     <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
//                                                         <span className="text-white font-medium text-sm">
//                                                             {user.first_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
//                                                         </span>
//                                                     </div>
//                                                     <div className="ml-4">
//                                                         <div className="text-sm font-medium text-gray-900">
//                                                             {user.first_name || user.last_name
//                                                                 ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
//                                                                 : user.username
//                                                             }
//                                                         </div>
//                                                         <div className="text-sm text-gray-500">
//                                                             @{user.username}
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <div className="text-sm text-gray-900">{user.email}</div>
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <div className="flex flex-col space-y-2">
//                                                     <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user)}`}>
//                                                         {getUserRole(user)}
//                                                     </span>
//                                                     {/* Quick Role Change Dropdown */}
//                                                     <select
//                                                         value={user.user_type}
//                                                         onChange={(e) => changeUserRole(user.id, e.target.value)}
//                                                         disabled={loading || (user.user_type === 'admin' || user.is_superuser)}
//                                                         className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
//                                                     >
//                                                         {roleOptions.map(role => (
//                                                             <option key={role.value} value={role.value}>
//                                                                 Change to {role.label}
//                                                             </option>
//                                                         ))}
//                                                     </select>
//                                                 </div>
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.is_active
//                                                     ? 'bg-green-100 text-green-800'
//                                                     : 'bg-red-100 text-red-800'
//                                                     }`}>
//                                                     {user.is_active ? 'Active' : 'Inactive'}
//                                                 </span>
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                                                 {formatDate(user.last_login)}
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                                                 {formatDate(user.date_joined)}
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                                                 <div className="flex space-x-2">
//                                                     <button
//                                                         className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition duration-200 disabled:opacity-50 flex items-center space-x-1"
//                                                         onClick={() => handleEdit(user)}
//                                                         disabled={loading}
//                                                         title="Edit User"
//                                                     >
//                                                         <span>✏️</span>
//                                                         <span>Edit</span>
//                                                     </button>
//                                                     {(user.user_type !== 'admin' && !user.is_superuser) && (
//                                                         <>
//                                                             {user.is_active ? (
//                                                                 <button
//                                                                     className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition duration-200 disabled:opacity-50 flex items-center space-x-1"
//                                                                     onClick={() => toggleUserStatus(user.id, user.is_active)}
//                                                                     disabled={loading}
//                                                                     title="Deactivate User"
//                                                                 >
//                                                                     <span>⏸️</span>
//                                                                     <span>Deactivate</span>
//                                                                 </button>
//                                                             ) : (
//                                                                 <button
//                                                                     className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition duration-200 disabled:opacity-50 flex items-center space-x-1"
//                                                                     onClick={() => toggleUserStatus(user.id, user.is_active)}
//                                                                     disabled={loading}
//                                                                     title="Activate User"
//                                                                 >
//                                                                     <span>▶️</span>
//                                                                     <span>Activate</span>
//                                                                 </button>
//                                                             )}
//                                                             <button
//                                                                 className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition duration-200 disabled:opacity-50 flex items-center space-x-1"
//                                                                 onClick={() => handleDelete(user.id)}
//                                                                 disabled={loading}
//                                                                 title="Delete User"
//                                                             >
//                                                                 <span>🗑️</span>
//                                                                 <span>Delete</span>
//                                                             </button>
//                                                         </>
//                                                     )}
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     )}
//                 </div>

//                 {/* Add/Edit User Modal */}
//                 {showModal && (
//                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//                         <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//                             <div className="flex justify-between items-center p-6 border-b border-gray-200">
//                                 <h2 className="text-xl font-semibold text-gray-900">
//                                     {editingUser ? 'Edit User' : 'Add New User'}
//                                 </h2>
//                                 <button
//                                     className="text-gray-400 hover:text-gray-600 text-2xl disabled:opacity-50"
//                                     onClick={resetForm}
//                                     disabled={loading}
//                                 >
//                                     ×
//                                 </button>
//                             </div>

//                             <form onSubmit={handleSubmit} className="p-6">
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                     {/* Left Column - Basic Info */}
//                                     <div className="space-y-4">
//                                         <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

//                                         <div>
//                                             <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
//                                                 Username *
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 id="username"
//                                                 name="username"
//                                                 value={formData.username}
//                                                 onChange={handleInputChange}
//                                                 required
//                                                 disabled={loading}
//                                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
//                                                 placeholder="Enter username"
//                                             />
//                                         </div>

//                                         <div>
//                                             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                                                 Email *
//                                             </label>
//                                             <input
//                                                 type="email"
//                                                 id="email"
//                                                 name="email"
//                                                 value={formData.email}
//                                                 onChange={handleInputChange}
//                                                 required
//                                                 disabled={loading}
//                                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
//                                                 placeholder="Enter user email"
//                                             />
//                                         </div>

//                                         <div className="grid grid-cols-2 gap-4">
//                                             <div>
//                                                 <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
//                                                     First Name
//                                                 </label>
//                                                 <input
//                                                     type="text"
//                                                     id="first_name"
//                                                     name="first_name"
//                                                     value={formData.first_name}
//                                                     onChange={handleInputChange}
//                                                     disabled={loading}
//                                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
//                                                     placeholder="First name"
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
//                                                     Last Name
//                                                 </label>
//                                                 <input
//                                                     type="text"
//                                                     id="last_name"
//                                                     name="last_name"
//                                                     value={formData.last_name}
//                                                     onChange={handleInputChange}
//                                                     disabled={loading}
//                                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
//                                                     placeholder="Last name"
//                                                 />
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Right Column - Security & Permissions */}
//                                     <div className="space-y-4">
//                                         <h3 className="text-lg font-medium text-gray-900">Security & Permissions</h3>

//                                         {/* Password Fields */}
//                                         <div className="space-y-3">
//                                             <div>
//                                                 <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//                                                     {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
//                                                 </label>
//                                                 <input
//                                                     type="password"
//                                                     id="password"
//                                                     name="password"
//                                                     value={formData.password}
//                                                     onChange={handleInputChange}
//                                                     required={!editingUser}
//                                                     disabled={loading}
//                                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
//                                                     placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
//                                                 />
//                                             </div>
//                                             {formData.password && (
//                                                 <div>
//                                                     <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
//                                                         Confirm Password *
//                                                     </label>
//                                                     <input
//                                                         type="password"
//                                                         id="confirm_password"
//                                                         name="confirm_password"
//                                                         value={formData.confirm_password}
//                                                         onChange={handleInputChange}
//                                                         required={!!formData.password}
//                                                         disabled={loading}
//                                                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
//                                                         placeholder="Confirm password"
//                                                     />
//                                                 </div>
//                                             )}
//                                         </div>

//                                         {/* Enhanced Role Selection with Inspector */}
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                                 User Role *
//                                             </label>
//                                             <div className="grid grid-cols-2 gap-2">
//                                                 {roleOptions.map(role => (
//                                                     <button
//                                                         key={role.value}
//                                                         type="button"
//                                                         onClick={() => handleRoleChange(role.value)}
//                                                         className={`p-3 rounded-lg border-2 text-left transition-all ${formData.user_type === role.value
//                                                             ? 'border-blue-500 bg-blue-50'
//                                                             : 'border-gray-200 hover:border-gray-300'
//                                                             } ${role.color}`}
//                                                     >
//                                                         <div className="font-medium text-sm">{role.label}</div>
//                                                         <div className="text-xs opacity-75 mt-1">{role.description}</div>
//                                                     </button>
//                                                 ))}
//                                             </div>
//                                         </div>

//                                         {/* Status */}
//                                         <div>
//                                             <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
//                                                 <input
//                                                     type="checkbox"
//                                                     name="is_active"
//                                                     checked={formData.is_active}
//                                                     onChange={handleInputChange}
//                                                     disabled={loading}
//                                                     className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                                                 />
//                                                 <div>
//                                                     <div className="text-sm font-medium text-gray-700">Active User</div>
//                                                     <div className="text-xs text-gray-500">User can login and access the system</div>
//                                                 </div>
//                                             </label>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
//                                     <button
//                                         type="button"
//                                         className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition duration-200 disabled:opacity-50"
//                                         onClick={resetForm}
//                                         disabled={loading}
//                                     >
//                                         Cancel
//                                     </button>
//                                     <button
//                                         type="submit"
//                                         className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-200 disabled:opacity-50 flex items-center space-x-2"
//                                         disabled={loading}
//                                     >
//                                         {loading ? (
//                                             <>
//                                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                                                 <span>Saving...</span>
//                                             </>
//                                         ) : (
//                                             <>
//                                                 <span>💾</span>
//                                                 <span>{editingUser ? 'Update User' : 'Create User'}</span>
//                                             </>
//                                         )}
//                                     </button>
//                                 </div>
//                             </form>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default UserManagement;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        password2: '', // Changed from confirm_password to password2
        user_type: 'user',
        is_active: true
    });

    // API endpoints - using your actual auth_app endpoints
    const API_BASE = 'http://localhost:8000';
    const USERS_API = `${API_BASE}/api/users/`; // Your actual users endpoint

    // Enhanced Role options with descriptions
    const roleOptions = [
        { value: 'user', label: 'User', description: 'Can view and make sales', color: 'bg-purple-100 text-purple-800' },
        { value: 'staff', label: 'Staff', description: 'Can manage products and view reports', color: 'bg-blue-100 text-blue-800' },
        { value: 'inspector', label: 'Inspector', description: 'Can audit and review system activities', color: 'bg-indigo-100 text-indigo-800' },
        { value: 'manager', label: 'Manager', description: 'Full access except system settings', color: 'bg-green-100 text-green-800' },
        { value: 'admin', label: 'Admin', description: 'Full system access including settings', color: 'bg-red-100 text-red-800' }
    ];

    // Get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Token ${token}` : ''
        };
    };

    // Fetch real users from your Django backend
    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(USERS_API, {
                headers: getAuthHeaders()
            });

            console.log('Fetched users from auth_app:', response.data);
            setUsers(response.data);

        } catch (error) {
            console.error('Error fetching users:', error);
            handleApiError(error, 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    // Enhanced error handling
    const handleApiError = (error, defaultMessage) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    setError('Authentication failed. Please login again.');
                    break;
                case 403:
                    setError('You do not have permission to view users. Admin access required.');
                    break;
                case 404:
                    setError('Users endpoint not found. Please ensure your Django API has user endpoints configured.');
                    break;
                case 500:
                    setError('Server error. Please try again later.');
                    break;
                default:
                    if (error.response.data) {
                        const errors = Object.values(error.response.data).flat().join(', ');
                        setError(`Server Error: ${errors}`);
                    } else {
                        setError(defaultMessage);
                    }
            }
        } else if (error.request) {
            setError('Network error. Please check your connection and ensure Django server is running.');
        } else {
            setError(defaultMessage);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRoleChange = (userType) => {
        setFormData(prev => ({
            ...prev,
            user_type: userType
        }));
    };

    // Function to change user role directly from table
    const changeUserRole = async (userId, newRole) => {
        if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${USERS_API}${userId}/change-role/`,
                { user_type: newRole },
                { headers: getAuthHeaders() }
            );

            // Update local state
            setUsers(users.map(user =>
                user.id === userId ? { ...user, user_type: newRole } : user
            ));

            alert(`User role changed to ${newRole} successfully!`);
        } catch (error) {
            console.error('Error changing user role:', error);

            if (error.response?.data) {
                const errors = Object.values(error.response.data).flat().join(', ');
                alert(`Error: ${errors}`);
            } else {
                alert('Failed to change user role. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        if (!formData.username.trim()) {
            setError('Username is required');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!editingUser && !formData.password) {
            setError('Password is required for new users');
            return false;
        }
        if (formData.password && formData.password !== formData.password2) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password && formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        setError(null);
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        try {
            // Prepare data for API - matches your UserRegistrationSerializer
            const userData = {
                username: formData.username.trim(),
                email: formData.email.trim(),
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                user_type: formData.user_type,
                is_active: formData.is_active
            };

            // Only include password for new users or when password is being changed
            if (formData.password) {
                userData.password = formData.password;
                userData.password2 = formData.password2;
            }

            console.log('Sending user data:', userData);

            let response;
            if (editingUser) {
                // Update existing user - remove password fields if no password change
                const updateData = { ...userData };
                if (!formData.password) {
                    delete updateData.password;
                    delete updateData.password2;
                }

                response = await axios.patch(
                    `${USERS_API}${editingUser.id}/`,
                    updateData,
                    { headers: getAuthHeaders() }
                );

                setUsers(users.map(user =>
                    user.id === editingUser.id ? response.data : user
                ));
                alert('User updated successfully!');
            } else {
                // Create new user - use the create endpoint
                response = await axios.post(
                    `${USERS_API}create/`,
                    userData,
                    { headers: getAuthHeaders() }
                );

                setUsers([...users, response.data]);
                alert('User created successfully!');
            }

            resetForm();
            fetchUsers(); // Refresh the user list

        } catch (error) {
            console.error('Error saving user:', error);

            if (error.response?.data) {
                // Handle Django validation errors
                const errors = Object.values(error.response.data).flat().join(', ');
                setError(`Server Error: ${errors}`);

                // Show detailed error in alert
                alert(`Error: ${errors}`);
            } else {
                setError('Failed to save user. Please try again.');
                alert('Failed to save user. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username || '',
            email: user.email || '',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            password: '',
            password2: '', // Changed from confirm_password to password2
            user_type: user.user_type || 'user',
            is_active: user.is_active !== undefined ? user.is_active : true
        });
        setShowModal(true);
        setError(null);
    };

    const handleDelete = async (userId) => {
        const user = users.find(u => u.id === userId);
        if (user && (user.user_type === 'admin' || user.is_superuser)) {
            alert('Cannot delete admin users');
            return;
        }

        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            setLoading(true);
            try {
                await axios.delete(`${USERS_API}${userId}/`, {
                    headers: getAuthHeaders()
                });

                setUsers(users.filter(user => user.id !== userId));
                alert('User deleted successfully!');
            } catch (error) {
                console.error('Error deleting user:', error);
                if (error.response?.data) {
                    alert(`Error: ${error.response.data.error || 'Failed to delete user'}`);
                } else {
                    alert('Failed to delete user. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        const user = users.find(u => u.id === userId);
        if (user && (user.user_type === 'admin' || user.is_superuser)) {
            alert('Cannot deactivate admin users');
            return;
        }

        const action = currentStatus ? 'deactivate' : 'activate';

        if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${USERS_API}${userId}/toggle-status/`,
                {},
                { headers: getAuthHeaders() }
            );

            setUsers(users.map(user =>
                user.id === userId ? { ...user, is_active: !currentStatus } : user
            ));

            alert(`User ${action}d successfully!`);
        } catch (error) {
            console.error('Error updating user status:', error);
            if (error.response?.data) {
                alert(`Error: ${error.response.data.error || 'Failed to update user status'}`);
            } else {
                alert('Failed to update user status. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            first_name: '',
            last_name: '',
            password: '',
            password2: '', // Changed from confirm_password to password2
            user_type: 'user',
            is_active: true
        });
        setEditingUser(null);
        setShowModal(false);
        setError(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    // Helper function to get role display
    const getUserRole = (user) => {
        return roleOptions.find(role => role.value === user.user_type)?.label || 'User';
    };

    // Helper function to get role color
    const getRoleColor = (user) => {
        return roleOptions.find(role => role.value === user.user_type)?.color || 'bg-gray-100 text-gray-800';
    };

    // Enhanced Statistics with Inspector count
    const userStats = {
        total: users.length,
        active: users.filter(user => user.is_active).length,
        admins: users.filter(user => user.user_type === 'admin' || user.is_superuser).length,
        managers: users.filter(user => user.user_type === 'manager').length,
        inspectors: users.filter(user => user.user_type === 'inspector').length,
        staff: users.filter(user => user.user_type === 'staff').length,
        regular: users.filter(user => user.user_type === 'user').length
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="text-gray-600 mt-2">
                            Manage system users and their permissions
                        </p>
                        {/* <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3 max-w-md">
                            <p className="text-green-800 text-sm">
                                <strong>Real Data Mode:</strong> Connected to auth_app API
                            </p>
                            <p className="text-green-800 text-sm mt-1">
                                <strong>Endpoint:</strong> {USERS_API}
                            </p>
                        </div> */}
                    </div>
                    {/* <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200 flex items-center space-x-2 disabled:opacity-50"
                        onClick={() => setShowModal(true)}
                        disabled={loading}
                    >
                        <span>+</span>
                        <span>Add New User</span>
                    </button> */}
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="text-red-600 font-medium">Error:</div>
                            <div className="text-red-600 ml-2">{error}</div>
                            <button
                                className="ml-auto text-red-600 hover:text-red-800"
                                onClick={() => setError(null)}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                {/* Enhanced Statistics Cards with Inspector */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">{userStats.total}</div>
                        <div className="text-sm text-gray-600">Total Users</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="text-2xl font-bold text-green-600">{userStats.active}</div>
                        <div className="text-sm text-gray-600">Active Users</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="text-2xl font-bold text-red-600">{userStats.admins}</div>
                        <div className="text-sm text-gray-600">Admins</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="text-2xl font-bold text-green-600">{userStats.managers}</div>
                        <div className="text-sm text-gray-600">Managers</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="text-2xl font-bold text-indigo-600">{userStats.inspectors}</div>
                        <div className="text-sm text-gray-600">Inspectors</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="text-2xl font-bold text-blue-600">{userStats.staff}</div>
                        <div className="text-sm text-gray-600">Staff</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="text-2xl font-bold text-purple-600">{userStats.regular}</div>
                        <div className="text-sm text-gray-600">Regular Users</div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {loading && !users.length ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <div className="text-gray-600 text-lg">Loading users from database...</div>
                            </div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">👥</div>
                            <p className="text-gray-600 mb-4">No users found in database.</p>
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                                onClick={() => setShowModal(true)}
                            >
                                Add First User
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map(user => (
                                        <tr
                                            key={user.id}
                                            className={!user.is_active ? 'bg-gray-50 opacity-75' : 'hover:bg-gray-50'}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-medium text-sm">
                                                            {user.first_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.first_name || user.last_name
                                                                ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                                                : user.username
                                                            }
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            @{user.username}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col space-y-2">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user)}`}>
                                                        {getUserRole(user)}
                                                    </span>
                                                    {/* Quick Role Change Dropdown */}
                                                    <select
                                                        value={user.user_type}
                                                        onChange={(e) => changeUserRole(user.id, e.target.value)}
                                                        disabled={loading || (user.user_type === 'admin' || user.is_superuser)}
                                                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                                                    >
                                                        {roleOptions.map(role => (
                                                            <option key={role.value} value={role.value}>
                                                                Change to {role.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(user.last_login)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(user.date_joined)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition duration-200 disabled:opacity-50 flex items-center space-x-1"
                                                        onClick={() => handleEdit(user)}
                                                        disabled={loading}
                                                        title="Edit User"
                                                    >
                                                        <span>✏️</span>
                                                        <span>Edit</span>
                                                    </button>
                                                    {(user.user_type !== 'admin' && !user.is_superuser) && (
                                                        <>
                                                            {user.is_active ? (
                                                                <button
                                                                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition duration-200 disabled:opacity-50 flex items-center space-x-1"
                                                                    onClick={() => toggleUserStatus(user.id, user.is_active)}
                                                                    disabled={loading}
                                                                    title="Deactivate User"
                                                                >
                                                                    <span>⏸️</span>
                                                                    <span>Deactivate</span>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition duration-200 disabled:opacity-50 flex items-center space-x-1"
                                                                    onClick={() => toggleUserStatus(user.id, user.is_active)}
                                                                    disabled={loading}
                                                                    title="Activate User"
                                                                >
                                                                    <span>▶️</span>
                                                                    <span>Activate</span>
                                                                </button>
                                                            )}
                                                            <button
                                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition duration-200 disabled:opacity-50 flex items-center space-x-1"
                                                                onClick={() => handleDelete(user.id)}
                                                                disabled={loading}
                                                                title="Delete User"
                                                            >
                                                                <span>🗑️</span>
                                                                <span>Delete</span>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Add/Edit User Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {editingUser ? 'Edit User' : 'Add New User'}
                                </h2>
                                <button
                                    className="text-gray-400 hover:text-gray-600 text-2xl disabled:opacity-50"
                                    onClick={resetForm}
                                    disabled={loading}
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column - Basic Info */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

                                        <div>
                                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                                Username *
                                            </label>
                                            <input
                                                type="text"
                                                id="username"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                required
                                                disabled={loading}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                                placeholder="Enter username"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                disabled={loading}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                                placeholder="Enter user email"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                                                    First Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="first_name"
                                                    name="first_name"
                                                    value={formData.first_name}
                                                    onChange={handleInputChange}
                                                    disabled={loading}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                                    placeholder="First name"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Last Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="last_name"
                                                    name="last_name"
                                                    value={formData.last_name}
                                                    onChange={handleInputChange}
                                                    disabled={loading}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                                    placeholder="Last name"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Security & Permissions */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-gray-900">Security & Permissions</h3>

                                        {/* Password Fields */}
                                        <div className="space-y-3">
                                            <div>
                                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                                    {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
                                                </label>
                                                <input
                                                    type="password"
                                                    id="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    required={!editingUser}
                                                    disabled={loading}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                                    placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
                                                />
                                            </div>
                                            {formData.password && (
                                                <div>
                                                    <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Confirm Password *
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="password2"
                                                        name="password2"
                                                        value={formData.password2}
                                                        onChange={handleInputChange}
                                                        required={!!formData.password}
                                                        disabled={loading}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                                        placeholder="Confirm password"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Enhanced Role Selection with Inspector */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                User Role *
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {roleOptions.map(role => (
                                                    <button
                                                        key={role.value}
                                                        type="button"
                                                        onClick={() => handleRoleChange(role.value)}
                                                        className={`p-3 rounded-lg border-2 text-left transition-all ${formData.user_type === role.value
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                            } ${role.color}`}
                                                    >
                                                        <div className="font-medium text-sm">{role.label}</div>
                                                        <div className="text-xs opacity-75 mt-1">{role.description}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                <input
                                                    type="checkbox"
                                                    name="is_active"
                                                    checked={formData.is_active}
                                                    onChange={handleInputChange}
                                                    disabled={loading}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-700">Active User</div>
                                                    <div className="text-xs text-gray-500">User can login and access the system</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition duration-200 disabled:opacity-50"
                                        onClick={resetForm}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-200 disabled:opacity-50 flex items-center space-x-2"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>💾</span>
                                                <span>{editingUser ? 'Update User' : 'Create User'}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;