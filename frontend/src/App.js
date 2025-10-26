import React from 'react';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import './App.css';
import SimpleFooter from './components/SimpleFooter';

// Product Components (Placeholders - create these files)
import ProductCategories from './components/admin/ProductCategories';

// Other page components (Placeholders)
import Customers from './components/Customers';
import Messages from './components/Messages';

import Help from './components/Help';
import AllProducts from './AllProducts';
import AddProduct from './components/AddProduct';
// import Profile from './components/Profile';

import Stocking from './components/Stocking';
import EditProduct from './pages/EditProduct';
import Orders from './components/Orders';
import Reports from './pages/Report';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import DebtorList from './pages/DebtorList';
import ActivityLogs from './pages/ActivityLogs';
import CustomerReportForm from './pages/CustomerReport';
import ViewCustomerReport from './pages/ViewCustomerReport';
import Settings from './pages/Settings';
import ProfilePage from './pages/ProfilePage';
import UserManagement from './pages/UserManagement';
import HelpSupport from './pages/HelpSuppor';
import Inventory from './Inventory';
import Suppliers from './pages/Supplier';


function App() {
  return (

    <AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <Routes>
            {/* Auth pages with navbar only */}
            <Route path="/login" element={
              <PublicLayout>
                <Login />
              </PublicLayout>
            } />
            <Route path="/register" element={
              <PublicLayout>
                <Register />
              </PublicLayout>
            } />

            {/* User Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            {/* <Route path="/profile" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            } /> */}

            {/* User Product Routes */}
            <Route path="/products/all" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AllProducts />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/products/categories" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProductCategories />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            {/* <Route path="/products/inventory" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Inventory />
                </DashboardLayout>
              </ProtectedRoute>
            } /> */}
            <Route path="/products/add" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AddProduct />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Inventory />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Other User Routes */}
            <Route path="/orders" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Orders />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/supplier" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Suppliers />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/debtors" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DebtorList />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="edit-product/:id" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EditProduct />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="addToExisting/:id" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Stocking />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Customers />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Messages />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/customerReport" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CustomerReportForm />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/ViewCustomerReport" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ViewCustomerReport />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>

                <ProfilePage />

              </ProtectedRoute>
            } />
            <Route path="/help" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <HelpSupport />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute adminOnly={true}>
                <DashboardLayout>
                  <div className="p-6">
                    <UserManagement />
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Admin Product Routes */}
            <Route path="/admin/products/all" element={
              <ProtectedRoute adminOnly={true}>
                <DashboardLayout>
                  <AllProducts />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/products/inventory" element={
              <ProtectedRoute adminOnly={true}>
                <DashboardLayout>
                  <Inventory />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/products/categories" element={
              <ProtectedRoute adminOnly={true}>
                <DashboardLayout>
                  <ProductCategories />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/products/analytics" element={
              <ProtectedRoute adminOnly={true}>
                <DashboardLayout>
                  <div className="p-6">
                    <div className="mb-6">
                      <h1 className="text-2xl font-bold text-gray-800">Product Analytics</h1>
                      <p className="text-gray-600 mt-1">View product performance and analytics</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                      <p className="text-gray-600">Product Analytics page content will go here.</p>
                    </div>
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/products/add" element={
              <ProtectedRoute adminOnly={true}>
                <DashboardLayout>
                  <AddProduct />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Other Admin Routes */}
            <Route path="/reports" element={
              <ProtectedRoute adminOnly={true}>
                <DashboardLayout>
                  <Reports />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute adminOnly={true}>
                <DashboardLayout>
                  <div className="p-6">
                    <div className="mb-6">
                      <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
                      <p className="text-gray-600 mt-1">Configure system-wide settings</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                      <p className="text-gray-600">System Settings page content will go here.</p>
                    </div>
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/activitylogs" element={
              <ProtectedRoute adminOnly={true}>
                <DashboardLayout>
                  <div className="p-6">
                    <ActivityLogs />
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/customerReport" element={
              <ProtectedRoute adminOnly={true}>
                <DashboardLayout>
                  <div className="p-6">
                    <CustomerReportForm />
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Default route */}
            <Route path="/" element={<Navigate to="/dashboard" />} />

            {/* 404 Page */}
            <Route path="*" element={
              <PublicLayout>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                  <div className="text-center">
                    <h1 className="text-9xl font-bold text-gray-300">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
                    <p className="text-gray-600 mt-2 mb-6">The page you're looking for doesn't exist.</p>
                    <a
                      href="/dashboard"
                      className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      Go to Dashboard
                    </a>
                  </div>
                </div>
              </PublicLayout>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Public layout for auth pages (navbar + content)
const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-8">
        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </main>
      <SimpleFooter />
    </div>
  );
};

const DashboardLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar - Fixed at top */}
      <Navbar />

      {/* Sidebar - Controlled by parent state */}
      <div className={`fixed top-16 left-0 bottom-0 z-40 transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}>
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Main Content - Adjusted for navbar height and sidebar width */}
      <div
        className={`min-h-screen transition-all duration-300 pt-16 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
      >
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
// Protected route component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user?.user_type !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default App;