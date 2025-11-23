import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminRefundManagement = () => {
    const [refundRequests, setRefundRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showProcessModal, setShowProcessModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processData, setProcessData] = useState({
        refund_amount: '',
        restore_products: true
    });

    const fetchRefundRequests = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:8000/api/refund-requests/', {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            setRefundRequests(response.data);
        } catch (err) {
            console.error('Error fetching refund requests:', err);
            toast.error('Failed to load refund requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRefundRequests();
    }, []);

    const handleApprove = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://127.0.0.1:8000/api/refund-requests/${selectedRequest.id}/approve/`,
                {},
                {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                }
            );
            toast.success('Refund request approved successfully!');
            setShowApproveModal(false);
            setSelectedRequest(null);
            fetchRefundRequests();
        } catch (err) {
            console.error('Approve error:', err);
            toast.error(`Failed to approve refund: ${err.response?.data?.error || err.message}`);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://127.0.0.1:8000/api/refund-requests/${selectedRequest.id}/reject/`,
                { rejection_reason: rejectionReason },
                {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                }
            );
            toast.success('Refund request rejected successfully!');
            setShowRejectModal(false);
            setSelectedRequest(null);
            setRejectionReason('');
            fetchRefundRequests();
        } catch (err) {
            console.error('Reject error:', err);
            toast.error(`Failed to reject refund: ${err.response?.data?.error || err.message}`);
        }
    };

    const handleProcess = async () => {
        if (!processData.refund_amount || Number(processData.refund_amount) <= 0) {
            toast.error('Please enter a valid refund amount');
            return;
        }

        if (Number(processData.refund_amount) > Number(selectedRequest.requested_amount)) {
            toast.error('Refund amount cannot exceed requested amount');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://127.0.0.1:8000/api/refund-requests/${selectedRequest.id}/process/`,
                processData,
                {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            toast.success('Refund processed successfully!');
            setShowProcessModal(false);
            setSelectedRequest(null);
            setProcessData({ refund_amount: '', restore_products: true });
            fetchRefundRequests();
        } catch (err) {
            console.error('Process error:', err);
            toast.error(`Failed to process refund: ${err.response?.data?.error || err.message}`);
        }
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-blue-100 text-blue-800',
            rejected: 'bg-red-100 text-red-800',
            processed: 'bg-green-100 text-green-800'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="p-6 w-full">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-gray-600">Loading refund requests...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 w-full">
            <ToastContainer />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Refund Management - Admin</h1>
                <p className="text-gray-600 mt-2">Approve, reject, and process refund requests</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Refund Requests</h2>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                        {refundRequests.length} total requests
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sale
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Requested Amount
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reason
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {refundRequests.map((request) => (
                                <tr key={request.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900">
                                            {request.sale_number || `Sale #${request.sale}`}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm text-gray-900">{request.customer_name}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-medium text-gray-900">
                                            ₦{Number(request.requested_amount).toLocaleString()}
                                        </div>
                                        {request.refunded_amount > 0 && (
                                            <div className="text-xs text-green-600">
                                                Refunded: ₦{Number(request.refunded_amount).toLocaleString()}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm text-gray-900 capitalize">{request.reason}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {getStatusBadge(request.status)}
                                        {request.is_partial && (
                                            <div className="text-xs text-gray-500 mt-1">Partial Refund</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {new Date(request.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col space-y-1">
                                            {request.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRequest(request);
                                                            setShowApproveModal(true);
                                                        }}
                                                        className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded transition-colors text-xs"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRequest(request);
                                                            setShowRejectModal(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors text-xs"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {request.status === 'approved' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setProcessData({
                                                            refund_amount: request.requested_amount,
                                                            restore_products: true
                                                        });
                                                        setShowProcessModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors text-xs"
                                                >
                                                    Process
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setSelectedRequest(request)}
                                                className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded transition-colors text-xs"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {refundRequests.length === 0 && !loading && (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-4">📄</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Refund Requests</h3>
                        <p className="text-gray-500">No refund requests have been submitted yet.</p>
                    </div>
                )}
            </div>

            {/* Approve Modal */}
            {showApproveModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-800">Approve Refund Request</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 mb-4">
                                Are you sure you want to approve this refund request for <strong>{selectedRequest.customer_name}</strong>?
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Amount:</span>
                                    <span className="font-bold">₦{Number(selectedRequest.requested_amount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Reason:</span>
                                    <span className="font-medium capitalize">{selectedRequest.reason}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    setShowApproveModal(false);
                                    setSelectedRequest(null);
                                }}
                                className="flex-1 bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApprove}
                                className="flex-1 bg-green-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-800">Reject Refund Request</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-gray-700">
                                Please provide a reason for rejecting the refund request from <strong>{selectedRequest.customer_name}</strong>.
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rejection Reason *
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter the reason for rejection..."
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setSelectedRequest(null);
                                    setRejectionReason('');
                                }}
                                className="flex-1 bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex-1 bg-red-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Process Modal */}
            {showProcessModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-800">Process Refund</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Customer:</span>
                                    <span className="font-medium">{selectedRequest.customer_name}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Requested Amount:</span>
                                    <span className="font-medium">₦{Number(selectedRequest.requested_amount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Sale:</span>
                                    <span className="font-medium">{selectedRequest.sale_number}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Refund Amount *
                                </label>
                                <input
                                    type="number"
                                    value={processData.refund_amount}
                                    onChange={(e) => setProcessData({
                                        ...processData,
                                        refund_amount: e.target.value
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter refund amount"
                                    min="0"
                                    max={selectedRequest.requested_amount}
                                    step="0.01"
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="restore_products"
                                    checked={processData.restore_products}
                                    onChange={(e) => setProcessData({
                                        ...processData,
                                        restore_products: e.target.checked
                                    })}
                                    className="mr-2"
                                />
                                <label htmlFor="restore_products" className="text-sm text-gray-700">
                                    Restore products to inventory
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    setShowProcessModal(false);
                                    setSelectedRequest(null);
                                }}
                                className="flex-1 bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleProcess}
                                className="flex-1 bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Process Refund
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRefundManagement;