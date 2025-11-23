import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminNegotiationManagement = () => {
    const [negotiations, setNegotiations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNegotiation, setSelectedNegotiation] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchNegotiations();
    }, []);

    const fetchNegotiations = async () => {
        try {
            const response = await axios.get('/api/price-negotiations/');
            setNegotiations(response.data);
        } catch (error) {
            console.error('Error fetching negotiations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (negotiationId, counterPrice = null) => {
        setActionLoading(true);
        try {
            await axios.post(`/api/price-negotiations/${negotiationId}/approve/`, {
                counter_price: counterPrice,
                admin_notes: 'Approved by admin'
            });
            fetchNegotiations();
        } catch (error) {
            console.error('Error approving negotiation:', error);
        } finally {
            setActionLoading(false);
            setSelectedNegotiation(null);
        }
    };

    const handleReject = async (negotiationId) => {
        setActionLoading(true);
        try {
            await axios.post(`/api/price-negotiations/${negotiationId}/reject/`, {
                admin_notes: 'Rejected by admin'
            });
            fetchNegotiations();
        } catch (error) {
            console.error('Error rejecting negotiation:', error);
        } finally {
            setActionLoading(false);
            setSelectedNegotiation(null);
        }
    };

    if (loading) return <div>Loading negotiations...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Price Negotiation Management</h1>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Current Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Requested Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {negotiations.map((negotiation) => (
                            <tr key={negotiation.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {negotiation.product_name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {negotiation.customer}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        ${negotiation.current_price}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        ${negotiation.requested_price}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${negotiation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        negotiation.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            negotiation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-blue-100 text-blue-800'
                                        }`}>
                                        {negotiation.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {negotiation.status === 'pending' && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleApprove(negotiation.id)}
                                                disabled={actionLoading}
                                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(negotiation.id)}
                                                disabled={actionLoading}
                                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => setSelectedNegotiation(negotiation)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Counter Offer
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Counter Offer Modal */}
            {selectedNegotiation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-bold mb-4">Make Counter Offer</h3>
                        <p className="mb-4">
                            Current: ${selectedNegotiation.current_price}<br />
                            Requested: ${selectedNegotiation.requested_price}
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => handleApprove(selectedNegotiation.id, selectedNegotiation.current_price * 0.9)}
                                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                            >
                                Offer 10% Off
                            </button>
                            <button
                                onClick={() => handleApprove(selectedNegotiation.id, selectedNegotiation.current_price * 0.85)}
                                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                            >
                                Offer 15% Off
                            </button>
                            <button
                                onClick={() => setSelectedNegotiation(null)}
                                className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNegotiationManagement;