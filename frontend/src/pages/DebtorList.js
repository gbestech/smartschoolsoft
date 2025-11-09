import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DebtorList = () => {
    const [debtors, setDebtors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [updateBalanceModal, setUpdateBalanceModal] = useState(null);
    const [newPayment, setNewPayment] = useState("");
    const [viewModal, setViewModal] = useState(null);
    const [page, setPage] = useState(1);
    const perPage = 10;

    // ============================
    // FETCH DEBTORS
    // ============================
    const fetchDebtors = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get("http://127.0.0.1:8000/api/sales/sales/", {
                headers: { Authorization: `Token ${token}` },
            });

            const salesWithBalance = response.data
                .filter((sale) => Number(sale.balance) > 0)
                .sort((a, b) => Number(b.balance) - Number(a.balance));

            setDebtors(salesWithBalance);
            setError(null);
        } catch (err) {
            console.error("Error fetching debtors:", err);
            const message = `Failed to load debtors. ${err.response?.data?.detail || err.message}`;
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDebtors();
    }, []);

    // ============================
    // UPDATE BALANCE
    // ============================
    const handleUpdateBalance = async () => {
        if (!newPayment || Number(newPayment) <= 0) {
            toast.error("Please enter a valid payment amount.");
            return;
        }

        // Enhanced validation
        const paymentAmount = Number(newPayment);
        const currentBalance = Number(updateBalanceModal.balance);

        if (paymentAmount > currentBalance) {
            toast.error(`Payment amount (₦${paymentAmount.toLocaleString()}) cannot exceed the current balance (₦${currentBalance.toLocaleString()}).`);
            return;
        }

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("Authentication token not found. Please login again.");
                return;
            }

            const updatedAmountPaid = Number(updateBalanceModal.amount_paid) + paymentAmount;
            const updatedBalance = Math.max(Number(updateBalanceModal.total) - updatedAmountPaid, 0);

            console.log("Updating balance:", {
                saleId: updateBalanceModal.id,
                currentBalance: currentBalance,
                paymentAmount: paymentAmount,
                updatedAmountPaid: updatedAmountPaid,
                updatedBalance: updatedBalance
            });

            const response = await axios.patch(
                `http://127.0.0.1:8000/api/sales/sales/${updateBalanceModal.id}/`,
                {
                    amount_paid: updatedAmountPaid,
                    balance: updatedBalance
                },
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                    timeout: 10000
                }
            );

            console.log("Update successful:", response.data);

            toast.success("💰 Payment recorded successfully!");
            setUpdateBalanceModal(null);
            setNewPayment("");
            await fetchDebtors(); // Refresh the list
        } catch (err) {
            console.error("Update balance error:", err);
            let errorMessage = "Failed to update balance: ";

            if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
                errorMessage += "Network error - please check your connection and ensure the server is running.";
            } else if (err.response?.status === 401) {
                errorMessage += "Authentication failed - please login again.";
            } else if (err.response?.status === 404) {
                errorMessage += "Sale not found - the record may have been deleted.";
            } else if (err.response?.data) {
                // Handle different types of validation errors
                if (typeof err.response.data === 'object') {
                    if (err.response.data.amount_paid) {
                        errorMessage += `Amount paid error: ${err.response.data.amount_paid}`;
                    } else if (err.response.data.balance) {
                        errorMessage += `Balance error: ${err.response.data.balance}`;
                    } else {
                        errorMessage += JSON.stringify(err.response.data);
                    }
                } else {
                    errorMessage += err.response.data.detail || err.response.data;
                }
            } else {
                errorMessage += err.message;
            }

            toast.error(errorMessage);
        }
    };

    // ============================
    // PRINT RECEIPT
    // ============================
    const handlePrint = (debtor) => {
        const printWindow = window.open("", "", "height=600,width=800");
        printWindow.document.write(`
      <html>
        <head>
          <title>Debt Statement - ${debtor.customer_name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              color: #333;
            }
            .customer-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
            }
            .info-item {
              padding: 10px;
              background: #f5f5f5;
              border-radius: 5px;
            }
            .info-label {
              font-weight: bold;
              color: #666;
              font-size: 12px;
            }
            .info-value {
              font-size: 16px;
              color: #333;
              margin-top: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background-color: #333;
              color: white;
              font-weight: bold;
            }
            .summary {
              background: #f9f9f9;
              padding: 20px;
              border-radius: 5px;
              margin-top: 20px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 16px;
            }
            .summary-row.total {
              font-weight: bold;
              font-size: 18px;
              border-top: 2px solid #333;
              padding-top: 12px;
            }
            .summary-row.balance {
              color: #e53e3e;
              font-weight: bold;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              border-top: 2px solid #333;
              padding-top: 20px;
              color: #666;
            }
            @media print {
              .no-print {
                display: none;
              }
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DEBT STATEMENT</h1>
            <p>Statement #${debtor.id}</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="customer-info">
            <div class="info-item">
              <div class="info-label">Customer Name</div>
              <div class="info-value">${debtor.customer_name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Phone Number</div>
              <div class="info-value">${debtor.phone}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Sale Date</div>
              <div class="info-value">${new Date(debtor.date).toLocaleDateString()}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Address</div>
              <div class="info-value">${debtor.address || 'N/A'}</div>
            </div>
          </div>

          ${debtor.items && debtor.items.length > 0 ? `
            <h3>Items Purchased</h3>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${debtor.items
                    .map(
                        (item) => `
                    <tr>
                      <td>${item.product_name || `Product ${item.product}`}</td>
                      <td>${item.qty}</td>
                      <td>₦${Number(item.price).toLocaleString()}</td>
                      <td>₦${Number(item.qty * item.price).toLocaleString()}</td>
                    </tr>`
                    )
                    .join("")}
              </tbody>
            </table>
          ` : ''}

          <div class="summary">
            <div class="summary-row">
              <span>Total Amount:</span>
              <span>₦${Number(debtor.total).toLocaleString()}</span>
            </div>
            <div class="summary-row">
              <span>Amount Paid:</span>
              <span>₦${Number(debtor.amount_paid).toLocaleString()}</span>
            </div>
            <div class="summary-row balance">
              <span>Outstanding Balance:</span>
              <span>₦${Number(debtor.balance).toLocaleString()}</span>
            </div>
          </div>

          <div class="footer">
            <p><strong>Thank you for your business!</strong></p>
            <p>Please settle your outstanding balance at your earliest convenience.</p>
            <p>This is a computer-generated statement.</p>
          </div>

          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="padding: 10px 30px; font-size: 16px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
              Print Statement
            </button>
            <button onclick="window.close()" style="padding: 10px 30px; font-size: 16px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Close
            </button>
          </div>
        </body>
      </html>
    `);
        printWindow.document.close();
    };

    const filteredDebtors = debtors.filter(
        (d) =>
            d.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.phone.includes(searchTerm)
    );

    const totalDebt = filteredDebtors.reduce((sum, d) => sum + Number(d.balance), 0);
    const totalAmount = filteredDebtors.reduce((sum, d) => sum + Number(d.total), 0);
    const totalPaid = filteredDebtors.reduce((sum, d) => sum + Number(d.amount_paid), 0);

    const totalPages = Math.ceil(filteredDebtors.length / perPage);
    const currentDebtors = filteredDebtors.slice((page - 1) * perPage, page * perPage);

    if (loading)
        return (
            <div className="p-6 w-full">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-gray-600">Loading debtors...</div>
                </div>
            </div>
        );

    if (error && debtors.length === 0)
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-medium text-red-800">Error Loading Debtors</h3>
                            <p className="text-red-700 mt-2">{error}</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchDebtors}
                        className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );

    return (
        <div className="p-6 w-full">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
                theme="light"
            />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Debtor Management</h1>
                <p className="text-gray-600 mt-2">Track and manage outstanding balances</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <SummaryCard title="Total Debtors" value={filteredDebtors.length} color="red" icon="👥" />
                <SummaryCard title="Total Outstanding" value={`₦${totalDebt.toLocaleString()}`} color="orange" icon="💰" />
                <SummaryCard title="Total Sales Value" value={`₦${totalAmount.toLocaleString()}`} color="blue" icon="📊" />
                <SummaryCard title="Total Paid" value={`₦${totalPaid.toLocaleString()}`} color="green" icon="✅" />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <input
                        type="text"
                        placeholder="Search by customer name or phone number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                    <button
                        onClick={fetchDebtors}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
                    >
                        <span>🔄</span>
                        Refresh List
                    </button>
                </div>
            </div>

            {/* Debtors Table - Now passing perPage */}
            <DebtorsTable
                currentDebtors={currentDebtors}
                totalPages={totalPages}
                page={page}
                setPage={setPage}
                handlePrint={handlePrint}
                setUpdateBalanceModal={setUpdateBalanceModal}
                setViewModal={setViewModal}
                perPage={perPage} // Added this prop
            />

            {/* Modals */}
            {updateBalanceModal && (
                <UpdatePaymentModal
                    debtor={updateBalanceModal}
                    newPayment={newPayment}
                    setNewPayment={setNewPayment}
                    setUpdateBalanceModal={setUpdateBalanceModal}
                    handleUpdateBalance={handleUpdateBalance}
                />
            )}

            {viewModal && (
                <ViewDetailsModal
                    debtor={viewModal}
                    setViewModal={setViewModal}
                    handlePrint={handlePrint}
                />
            )}
        </div>
    );
};

export default DebtorList;

// ============================
// HELPER COMPONENTS
// ============================

const SummaryCard = ({ title, value, color, icon }) => {
    const colorClasses = {
        red: "from-red-500 to-red-600",
        orange: "from-orange-500 to-orange-600",
        blue: "from-blue-500 to-blue-600",
        green: "from-green-500 to-green-600"
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl shadow-lg p-6 text-white`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm opacity-90 mb-1">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-3 text-2xl">
                    {icon}
                </div>
            </div>
        </div>
    );
};

// Updated DebtorsTable to accept perPage prop
const DebtorsTable = ({
    currentDebtors,
    page,
    totalPages,
    setPage,
    handlePrint,
    setUpdateBalanceModal,
    setViewModal,
    perPage // Added this prop
}) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Paid
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Balance
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {currentDebtors.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="px-6 py-8 text-center">
                                <div className="text-gray-500 text-lg mb-2">📋</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">No Debtors Found</h3>
                                <p className="text-gray-500">There are no outstanding balances to display.</p>
                            </td>
                        </tr>
                    ) : (
                        currentDebtors.map((debtor) => (
                            <tr key={debtor.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{debtor.customer_name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-gray-600">{debtor.phone}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-600">
                                        {new Date(debtor.date).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-gray-900">
                                    ₦{Number(debtor.total).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-green-600 font-medium">
                                        ₦{Number(debtor.amount_paid).toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-red-600 font-bold">
                                        ₦{Number(debtor.balance).toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center space-x-2">
                                        <button
                                            onClick={() => setUpdateBalanceModal(debtor)}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm flex items-center gap-1"
                                        >
                                            💵 Pay
                                        </button>
                                        <button
                                            onClick={() => setViewModal(debtor)}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm flex items-center gap-1"
                                        >
                                            👁 View
                                        </button>
                                        <button
                                            onClick={() => handlePrint(debtor)}
                                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm flex items-center gap-1"
                                        >
                                            🖨 Print
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {/* Pagination - Now using the perPage prop */}
        {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                    Showing {Math.min(currentDebtors.length, perPage)} of {currentDebtors.length} debtors
                </div>
                <div className="flex gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium">
                        {page}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        Next
                    </button>
                </div>
            </div>
        )}
    </div>
);

const UpdatePaymentModal = ({
    debtor,
    newPayment,
    setNewPayment,
    setUpdateBalanceModal,
    handleUpdateBalance
}) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">Record Payment</h3>
                <p className="text-gray-600 mt-1">for {debtor.customer_name}</p>
            </div>
            <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Current Balance:</span>
                        <span className="text-red-600 font-bold">₦{Number(debtor.balance).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-medium">₦{Number(debtor.total).toLocaleString()}</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Amount
                    </label>
                    <input
                        type="number"
                        value={newPayment}
                        onChange={(e) => {
                            const value = e.target.value;
                            setNewPayment(value);

                            // Real-time validation
                            if (value && Number(value) > Number(debtor.balance)) {
                                // You could show a warning message here if needed
                                console.log(`Warning: Payment exceeds balance by ₦${(Number(value) - Number(debtor.balance)).toLocaleString()}`);
                            }
                        }}
                        placeholder="Enter payment amount"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        min="0"
                        max={debtor.balance}
                        step="0.01"
                    />
                </div>
                {newPayment && (
                    <div className={`border rounded-lg p-4 ${Number(newPayment) > Number(debtor.balance)
                        ? 'bg-red-50 border-red-200'
                        : 'bg-green-50 border-green-200'
                        }`}>
                        <div className="flex justify-between">
                            <span className={`font-medium ${Number(newPayment) > Number(debtor.balance)
                                ? 'text-red-800'
                                : 'text-green-800'
                                }`}>
                                {Number(newPayment) > Number(debtor.balance)
                                    ? 'Payment Exceeds Balance!'
                                    : 'New Balance:'}
                            </span>
                            <span className={`font-bold ${Number(newPayment) > Number(debtor.balance)
                                ? 'text-red-800'
                                : 'text-green-800'
                                }`}>
                                {Number(newPayment) > Number(debtor.balance)
                                    ? `Excess: ₦${(Number(newPayment) - Number(debtor.balance)).toLocaleString()}`
                                    : `₦${Math.max(Number(debtor.balance) - Number(newPayment), 0).toLocaleString()}`
                                }
                            </span>
                        </div>
                        {Number(newPayment) > Number(debtor.balance) && (
                            <p className="text-red-700 text-sm mt-2">
                                You cannot pay more than the outstanding balance.
                            </p>
                        )}
                    </div>
                )}
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                    onClick={() => {
                        setUpdateBalanceModal(null);
                        setNewPayment("");
                    }}
                    className="flex-1 bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleUpdateBalance}
                    disabled={!newPayment || Number(newPayment) <= 0 || Number(newPayment) > Number(debtor.balance)}
                    className="flex-1 bg-green-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Record Payment
                </button>
            </div>
        </div>
    </div>
);

// Updated ViewDetailsModal - Reduced to 3 rows
const ViewDetailsModal = ({ debtor, setViewModal, handlePrint }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">Sale Details</h3>
                <p className="text-gray-600 mt-1">{debtor.customer_name}</p>
            </div>

            {/* Three Rows Layout */}
            <div className="p-6 space-y-4">
                {/* Row 1: Customer Information */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-sm text-gray-600">Customer Name</span>
                        <p className="font-medium">{debtor.customer_name}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-sm text-gray-600">Phone</span>
                        <p className="font-medium">{debtor.phone}</p>
                    </div>
                </div>

                {/* Row 2: Sale Information */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-sm text-gray-600">Sale Date</span>
                        <p className="font-medium">{new Date(debtor.date).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-sm text-gray-600">Gender</span>
                        <p className="font-medium">{debtor.gender || 'N/A'}</p>
                    </div>
                </div>

                {/* Row 3: Payment Summary */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-semibold">₦{Number(debtor.total).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Amount Paid:</span>
                        <span className="text-green-600 font-semibold">₦{Number(debtor.amount_paid).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Balance:</span>
                        <span className="text-red-600 font-bold">₦{Number(debtor.balance).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                    onClick={() => handlePrint(debtor)}
                    className="flex-1 bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    🖨 Print
                </button>
                <button
                    onClick={() => setViewModal(null)}
                    className="flex-1 bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
);