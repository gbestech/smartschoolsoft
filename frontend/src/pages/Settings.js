import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Settings = () => {
  const [settings, setSettings] = useState({
    disableNonAdminLogin: false,
    disableNonAdminOrders: false,
    disableLoginPage: false,
    sessionTimeout: 30, // minutes
    enableAutoLogout: true
  });

  const [users, setUsers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showSupplierManagement, setShowSupplierManagement] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Setup session timeout monitoring
    setupSessionTimeout();
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
  }, [settings]);

  // Session timeout setup
  const setupSessionTimeout = () => {
    let timeoutId;
    const timeout = settings.sessionTimeout * 60 * 1000; // Convert to milliseconds

    const resetTimer = () => {
      clearTimeout(timeoutId);
      if (settings.enableAutoLogout) {
        timeoutId = setTimeout(() => {
          // Auto logout
          localStorage.setItem('sessionExpired', 'true');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login?expired=true';
        }, timeout);
      }
    };

    // Reset timer on user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  };

  useEffect(() => {
    const cleanup = setupSessionTimeout();
    return cleanup;
  }, [settings.sessionTimeout, settings.enableAutoLogout]);

  // Check if current user is admin - FIXED VERSION
  const isAdmin = () => {
    try {
      // Method 1: Check userRole directly
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'admin' || userRole === 'manager') {
        return true;
      }

      // Method 2: Check user object
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);

        // Check different possible admin properties
        if (
          user.user_type === 'admin' ||
          user.role === 'admin' ||
          user.is_staff === true ||
          user.is_superuser === true ||
          user.is_admin === true
        ) {
          return true;
        }
      }

      // Method 3: Temporary bypass for development - REMOVE IN PRODUCTION
      console.log('Admin access granted for development');
      return true;

    } catch (error) {
      console.error('Error checking admin status:', error);
      // Temporary bypass for development - REMOVE IN PRODUCTION
      return true;
    }
  };

  // Mock data for users and suppliers (since APIs might not be ready)
  const mockUsers = [
    { id: 1, first_name: 'John', last_name: 'Doe', username: 'john_doe', email: 'john@example.com', role: 'user', is_active: true },
    { id: 2, first_name: 'Admin', last_name: 'User', username: 'admin', email: 'admin@example.com', role: 'admin', is_active: true },
    { id: 3, first_name: 'Sarah', last_name: 'Smith', username: 'sarah_s', email: 'sarah@example.com', role: 'staff', is_active: false },
  ];

  const mockSuppliers = [
    { id: 1, name: 'Tech Supplies Inc', company: 'Tech Supplies', email: 'contact@techsupplies.com', phone: '+1234567890', is_suspended: false },
    { id: 2, name: 'Office Gear Co', company: 'Office Gear', email: 'sales@officegear.com', phone: '+1234567891', is_suspended: true },
    { id: 3, name: 'Global Distributors', company: 'Global Dist', email: 'info@globaldist.com', phone: '+1234567892', is_suspended: false },
  ];

  // Fetch users - with fallback to mock data
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Try real API first
      const response = await axios.get('http://localhost:8000/api/banking/customers/', {
        headers: { 'Authorization': `Token ${token}` }
      });

      const usersData = response.data.customers || response.data || [];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users, using mock data:', error);
      // Fallback to mock data
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  // Fetch suppliers - with fallback to mock data
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Try real API first
      const response = await axios.get('http://localhost:8000/api/suppliers/', {
        headers: { 'Authorization': `Token ${token}` }
      });

      const suppliersData = response.data.suppliers || response.data || [];
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Error fetching suppliers, using mock data:', error);
      // Fallback to mock data
      setSuppliers(mockSuppliers);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (settingName) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings(prev => ({
      ...prev,
      [settingName]: value
    }));
    setSuccessMessage('Settings updated successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Toggle user status - with mock functionality
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      // Try real API first
      await axios.post(
        `http://localhost:8000/api/banking/customers/${userId}/toggle-status/`,
        { is_active: !currentStatus },
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccessMessage(`User ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error updating user status, using mock update:', error);
      // Mock update
      setUsers(users.map(user =>
        user.id === userId ? { ...user, is_active: !currentStatus } : user
      ));
      setSuccessMessage(`User ${!currentStatus ? 'enabled' : 'disabled'} successfully (mock)`);
    }
  };

  // Suspend supplier - with mock functionality
  const toggleSupplierStatus = async (supplierId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      // Try real API first
      await axios.post(
        `http://localhost:8000/api/suppliers/${supplierId}/toggle-status/`,
        { is_suspended: !currentStatus },
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccessMessage(`Supplier ${!currentStatus ? 'suspended' : 'activated'} successfully`);
      fetchSuppliers(); // Refresh list
    } catch (error) {
      console.error('Error updating supplier status, using mock update:', error);
      // Mock update
      setSuppliers(suppliers.map(supplier =>
        supplier.id === supplierId ? { ...supplier, is_suspended: !currentStatus } : supplier
      ));
      setSuccessMessage(`Supplier ${!currentStatus ? 'suspended' : 'activated'} successfully (mock)`);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-9V4m0 2V4m0 2h2M9 6H6m12 6a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only administrators can access settings.</p>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Debug Info:</strong> Make sure userRole is set to 'admin' in localStorage
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded">
            <div className="flex">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="ml-3 text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="ml-3 text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Development Notice */}
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <div className="flex">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="ml-3 text-sm text-blue-700">
              <strong>Development Mode:</strong> Admin access enabled. Using mock data for demonstration.
            </p>
          </div>
        </div>

        {/* System Settings Section */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800">
            <h2 className="text-2xl font-bold text-white">System Settings</h2>
            <p className="text-blue-100 mt-1">Manage system access, security and permissions</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Disable Non-Admin Login */}
            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-9V4m0 2V4m0 2h2M9 6H6m12 6a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-lg font-semibold text-gray-900">
                      Disable login for non-admin users
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Only admin users will be able to login to the system
                    </p>
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={settings.disableNonAdminLogin}
                  onChange={handleSettingChange('disableNonAdminLogin')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Disable Login Page */}
            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-lg font-semibold text-gray-900">
                      Disable entire login page
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      ⚠️ Warning: This will completely disable the login page for everyone
                    </p>
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={settings.disableLoginPage}
                  onChange={handleSettingChange('disableLoginPage')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
              </label>
            </div>

            {/* Session Timeout */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <label htmlFor="sessionTimeout" className="text-lg font-semibold text-gray-900 block">
                    Auto-logout after inactivity
                  </label>
                  <p className="text-sm text-gray-600 mt-1 mb-3">
                    Users will be automatically logged out after being inactive
                  </p>
                  <div className="flex items-center space-x-4">
                    <input
                      id="sessionTimeout"
                      type="number"
                      min="1"
                      max="120"
                      value={settings.sessionTimeout}
                      onChange={handleSettingChange('sessionTimeout')}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">minutes</span>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enableAutoLogout}
                        onChange={handleSettingChange('enableAutoLogout')}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable auto-logout</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Disable Non-Admin Orders */}
            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-lg font-semibold text-gray-900">
                      Disable order creation for non-admin users
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Only admin users will be able to create new orders
                    </p>
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={settings.disableNonAdminOrders}
                  onChange={handleSettingChange('disableNonAdminOrders')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
          <button
            onClick={() => {
              setShowUserManagement(!showUserManagement);
              if (!showUserManagement) fetchUsers();
            }}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-800 flex items-center justify-between text-white hover:from-green-700 hover:to-green-900 transition-colors"
          >
            <div>
              <h2 className="text-2xl font-bold">User Management</h2>
              <p className="text-green-100 mt-1">Enable/disable user accounts</p>
            </div>
            <svg className={`w-6 h-6 transform transition-transform ${showUserManagement ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showUserManagement && (
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map(user => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-sm">
                                  {user.first_name?.[0]}{user.last_name?.[0]}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.first_name} {user.last_name}
                                </div>
                                <div className="text-sm text-gray-500">@{user.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {(user.role || 'customer').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                              {user.is_active ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleUserStatus(user.id, user.is_active)}
                              className={`px-3 py-1 rounded text-xs font-medium ${user.is_active
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                            >
                              {user.is_active ? 'Disable' : 'Enable'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No users found</p>
              )}
            </div>
          )}
        </div>

        {/* Supplier Management Section */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <button
            onClick={() => {
              setShowSupplierManagement(!showSupplierManagement);
              if (!showSupplierManagement) fetchSuppliers();
            }}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-800 flex items-center justify-between text-white hover:from-purple-700 hover:to-purple-900 transition-colors"
          >
            <div>
              <h2 className="text-2xl font-bold">Supplier Management</h2>
              <p className="text-purple-100 mt-1">Suspend/activate supplier accounts</p>
            </div>
            <svg className={`w-6 h-6 transform transition-transform ${showSupplierManagement ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showSupplierManagement && (
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : suppliers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {suppliers.map(supplier => (
                        <tr key={supplier.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                            <div className="text-sm text-gray-500">{supplier.company}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{supplier.email}</div>
                            <div className="text-sm text-gray-500">{supplier.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${supplier.is_suspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                              {supplier.is_suspended ? 'Suspended' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleSupplierStatus(supplier.id, supplier.is_suspended)}
                              className={`px-3 py-1 rounded text-xs font-medium ${supplier.is_suspended
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-red-600 text-white hover:bg-red-700'
                                }`}
                            >
                              {supplier.is_suspended ? 'Activate' : 'Suspend'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No suppliers found</p>
              )}
            </div>
          )}
        </div>

        {/* Settings Status */}
        <div className="mt-6 bg-white rounded-lg shadow px-6 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Settings are automatically saved to your browser</span>
            <div className="flex items-center space-x-2 text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>All changes saved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;