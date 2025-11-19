import React, { useState, useEffect } from 'react';
import HRMenu from './HR';

const Settings = () => {
  const [settings, setSettings] = useState({
    disableNonAdminLogin: false,
    disableNonAdminOrders: false
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
  }, [settings]);

  const handleSettingChange = (settingName) => (event) => {
    setSettings(prev => ({
      ...prev,
      [settingName]: event.target.checked
    }));
  };

  // Check if current user is admin
  const isAdmin = () => {
    const userRole = localStorage.getItem('userRole');
    return userRole === 'admin';
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* <HRMenu /> */}

        {/* Admin Settings Section */}
        <div className="mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800">
            <h2 className="text-2xl font-bold text-white">Admin Settings</h2>
            <p className="text-blue-100 mt-1">Manage system access and permissions</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Disable Non-Admin Login Setting */}
            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-9V4m0 2V4m0 2h2M9 6H6m12 6a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label htmlFor="disableNonAdminLogin" className="flex items-center cursor-pointer">
                      <div className="flex-1">
                        <span className="text-lg font-semibold text-gray-900">
                          Disable login for non-admin users
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          When enabled, only admin users will be able to login to the system.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 ml-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="disableNonAdminLogin"
                    type="checkbox"
                    checked={settings.disableNonAdminLogin}
                    onChange={handleSettingChange('disableNonAdminLogin')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Disable Non-Admin Orders Setting */}
            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label htmlFor="disableNonAdminOrders" className="flex items-center cursor-pointer">
                      <div className="flex-1">
                        <span className="text-lg font-semibold text-gray-900">
                          Disable order creation for non-admin users
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          When enabled, only admin users will be able to create new orders.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 ml-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="disableNonAdminOrders"
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

          {/* Settings Status Summary */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
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
    </div>
  );
};

export default Settings;