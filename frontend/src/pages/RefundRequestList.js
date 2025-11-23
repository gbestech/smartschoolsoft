import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RefundRequestList = () => {
    const [refundRequests, setRefundRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-blue-100 text-blue-800',
        rejected: 'bg-red-100 text-red-800',
        processed: 'bg-green-100 text-green-800'
    };

    const fetchRefundRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:8000/api/sales/refund-requests/', {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            setRefundRequests(response.data);
        } catch (error) {
            setError('Failed to load refund requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRefundRequests();
    }, []);

    const handleStatusUpdate = async (refundId, newStatus, rejectionReason = '') => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `http://127.0.0.1:8000/api/sales/refund-requests/${refundId}/`,
                {
                    status: newStatus,
                    rejection_reason: rejectionReason
                },
                {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            fetchRefundRequests(); // Refresh list
        } catch (error) {
            setError('Failed to update refund status');
        }
    };

    const handleProcessRefund = async (refundId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://127.0.0.1:8000/api/sales/refund-requests/${refundId}/process/`,
                {},
                {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                }
            );

            fetchRefundRequests(); // Refresh list
        } catch (error) {
            setError('Failed to process refund');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="text-gray-600">Loading refund requests...</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Refund Requests</h2>
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    {refundRequests.length} requests
                </span>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            {refundRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">📝</div>
                    <p>No refund requests found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {refundRequests.map((request) => (
                        <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-semibold text-gray-800">
                                        Refund Request #{request.id}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Sale #{request.sale_details.id} - {request.sale_details.customer_name}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                                    {request.status.toUpperCase()}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm">
                                <div>
                                    <span className="text-gray-600">Reason:</span>
                                    <p className="font-medium capitalize">
                                        {request.reason.replace(/_/g, ' ')}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Requested Amount:</span>
                                    <p className="font-medium text-green-600">
                                        ₦{Number(request.requested_amount).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Submitted by:</span>
                                    <p className="font-medium">{request.created_by_name}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Date:</span>
                                    <p className="font-medium">
                                        {new Date(request.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-3">
                                <span className="text-gray-600 text-sm">Description:</span>
                                <p className="text-gray-800 mt-1">{request.description}</p>
                            </div>

                            {request.rejection_reason && (
                                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
                                    <span className="text-red-700 text-sm font-medium">Rejection Reason:</span>
                                    <p className="text-red-600 text-sm mt-1">{request.rejection_reason}</p>
                                </div>
                            )}

                            {/* Admin Actions */}
                            {localStorage.getItem('user_is_staff') === 'true' && (
                                <div className="flex space-x-2 pt-3 border-t border-gray-200">
                                    {request.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(request.id, 'approved')}
                                                className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const reason = prompt('Enter rejection reason:');
                                                    if (reason) {
                                                        handleStatusUpdate(request.id, 'rejected', reason);
                                                    }
                                                }}
                                                className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {request.status === 'approved' && (
                                        <button
                                            onClick={() => handleProcessRefund(request.id)}
                                            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                        >
                                            Process Refund
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RefundRequestList;