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

        try {
            const token = localStorage.getItem("token");
            const updatedAmountPaid = Number(updateBalanceModal.amount_paid) + Number(newPayment);
            const updatedBalance = Math.max(Number(updateBalanceModal.total) - updatedAmountPaid, 0);

            await axios.patch(
                `http://127.0.0.1:8000/api/sales/sales/${updateBalanceModal.id}/`,
                { amount_paid: updatedAmountPaid, balance: updatedBalance },
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            toast.success("💰 Payment recorded successfully!");
            setUpdateBalanceModal(null);
            setNewPayment("");
            await fetchDebtors();
        } catch (err) {
            console.error("Update balance error:", err);
            toast.error(`Failed to update balance: ${err.response?.data?.detail || err.message}`);
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
            body { font-family: Arial; padding: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 8px; border: 1px solid #ccc; text-align: left; }
            th { background-color: #333; color: white; }
            .footer { margin-top: 50px; text-align: center; color: #666; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <h1>DEBT STATEMENT</h1>
          <p><strong>Customer:</strong> ${debtor.customer_name}</p>
          <p><strong>Phone:</strong> ${debtor.phone}</p>
          <p><strong>Date:</strong> ${new Date(debtor.date).toLocaleDateString()}</p>
          ${debtor.items?.length
                ? `
              <table>
                <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
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
              </table>`
                : ""
            }
          <h3>Total: ₦${Number(debtor.total).toLocaleString()}</h3>
          <h3>Paid: ₦${Number(debtor.amount_paid).toLocaleString()}</h3>
          <h3>Balance: ₦${Number(debtor.balance).toLocaleString()}</h3>
          <div class="footer">This is a computer-generated statement.</div>
          <div class="no-print" style="text-align:center; margin-top:20px;">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
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
        return <div className="p-6 text-center text-gray-600 text-lg">Loading debtors...</div>;

    if (error)
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">
                    {error}
                    <button
                        onClick={fetchDebtors}
                        className="block mt-3 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );

    return (
        <div className="p-6 w-full">
            <ToastContainer position="top-right" autoClose={3000} theme="light" />

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

            <div className="bg-white rounded-lg border p-6 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={fetchDebtors}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Debtors Table */}
            <DebtorsTable
                currentDebtors={currentDebtors}
                totalPages={totalPages}
                page={page}
                setPage={setPage}
                handlePrint={handlePrint}
                setUpdateBalanceModal={setUpdateBalanceModal}
                setViewModal={setViewModal}
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

            {viewModal && <ViewDetailsModal debtor={viewModal} setViewModal={setViewModal} />}
        </div>
    );
};

export default DebtorList;

// ============================
// HELPER COMPONENTS
// ============================

const SummaryCard = ({ title, value, color, icon }) => (
    <div
        className={`bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-lg shadow-lg p-6 text-white`}
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm opacity-80">{title}</p>
                <p className="text-2xl font-bold mt-2">{value}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3 text-3xl">{icon}</div>
        </div>
    </div>
);

// Simple Table
const DebtorsTable = ({ currentDebtors, page, totalPages, setPage, handlePrint, setUpdateBalanceModal, setViewModal }) => (
    <div className="overflow-x-auto bg-white border rounded-lg shadow-sm">
        <table className="w-full border-collapse">
            <thead className="bg-gray-100">
                <tr>
                    <th className="p-3 text-left">Customer</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-right">Total</th>
                    <th className="p-3 text-right">Paid</th>
                    <th className="p-3 text-right">Balance</th>
                    <th className="p-3 text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
                {currentDebtors.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="text-center py-4 text-gray-500">
                            No debtors found.
                        </td>
                    </tr>
                ) : (
                    currentDebtors.map((debtor) => (
                        <tr key={debtor.id} className="border-t hover:bg-gray-50">
                            <td className="p-3">{debtor.customer_name}</td>
                            <td className="p-3">{debtor.phone}</td>
                            <td className="p-3 text-right">₦{Number(debtor.total).toLocaleString()}</td>
                            <td className="p-3 text-right">₦{Number(debtor.amount_paid).toLocaleString()}</td>
                            <td className="p-3 text-right text-red-600 font-semibold">
                                ₦{Number(debtor.balance).toLocaleString()}
                            </td>
                            <td className="p-3 text-center space-x-2">
                                <button
                                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                    onClick={() => setUpdateBalanceModal(debtor)}
                                >
                                    💵 Pay
                                </button>
                                <button
                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    onClick={() => setViewModal(debtor)}
                                >
                                    👁 View
                                </button>
                                <button
                                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                    onClick={() => handlePrint(debtor)}
                                >
                                    🖨 Print
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center p-4">
            <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
                Prev
            </button>
            <span>
                Page {page} of {totalPages}
            </span>
            <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
                Next
            </button>
        </div>
    </div>
);

// Update Payment Modal
const UpdatePaymentModal = ({ debtor, newPayment, setNewPayment, setUpdateBalanceModal, handleUpdateBalance }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Update Payment - {debtor.customer_name}</h2>
            <p className="text-gray-700 mb-2">
                Current Balance: ₦{Number(debtor.balance).toLocaleString()}
            </p>
            <input
                type="number"
                value={newPayment}
                onChange={(e) => setNewPayment(e.target.value)}
                placeholder="Enter payment amount"
                className="w-full border px-3 py-2 rounded mb-4"
            />
            <div className="flex justify-end gap-3">
                <button
                    onClick={() => setUpdateBalanceModal(null)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                    Cancel
                </button>
                <button
                    onClick={handleUpdateBalance}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Submit
                </button>
            </div>
        </div>
    </div>
);

// View Details Modal
const ViewDetailsModal = ({ debtor, setViewModal }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Sale Details</h2>
            <p><strong>Customer:</strong> {debtor.customer_name}</p>
            <p><strong>Phone:</strong> {debtor.phone}</p>
            <p><strong>Total:</strong> ₦{Number(debtor.total).toLocaleString()}</p>
            <p><strong>Paid:</strong> ₦{Number(debtor.amount_paid).toLocaleString()}</p>
            <p><strong>Balance:</strong> ₦{Number(debtor.balance).toLocaleString()}</p>

            <div className="text-right mt-4">
                <button
                    onClick={() => setViewModal(null)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
);
