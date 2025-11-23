import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RefundRequestForm = ({ sale, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        reason: '',
        description: '',
        requested_amount: sale?.amount_paid || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const refundReasons = [
        { value: 'defective', label: 'Defective Product' },
        { value: 'wrong_item', label: 'Wrong Item Received' },
        { value: 'not_as_described', label: 'Not as Described' },
        { value: 'customer_change_mind', label: 'Changed Mind' },
        { value: 'late_delivery', label: 'Late Delivery' },
        { value: 'other', label: 'Other' },
    ];

    useEffect(() => {
        if (sale) {
            setFormData({
                reason: '',
                description: '',
                requested_amount: sale.amount_paid
            });
        }
    }, [sale]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!sale) return;

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://127.0.0.1:8000/api/sales/refund-requests/', {
                sale: sale.id,
                reason: formData.reason,
                description: formData.description,
                requested_amount: parseFloat(formData.requested_amount)
            }, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (onSuccess) onSuccess();
        } catch (error) {
            setError(error.response?.data?.detail ||
                error.response?.data?.message ||
                'Failed to submit refund request');
        } finally {
            setLoading(false);
        }
    };

    if (!sale) return null;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Request Refund</h2>

            {/* Sale Information */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-3">Sale Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Customer:</span>
                        <p className="font-medium">{sale.customer_name}</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Sale Date:</span>
                        <p className="font-medium">{new Date(sale.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Total Amount:</span>
                        <p className="font-medium">₦{Number(sale.total).toLocaleString()}</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Amount Paid:</span>
                        <p className="font-medium text-green-600">₦{Number(sale.amount_paid).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Refund Reason *
                    </label>
                    <select
                        value={formData.reason}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            reason: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    >
                        <option value="">Select a reason</option>
                        {refundReasons.map(reason => (
                            <option key={reason.value} value={reason.value}>
                                {reason.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            description: e.target.value
                        }))}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Please provide detailed information about why you're requesting a refund..."
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Requested Refund Amount *
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={sale.amount_paid}
                        value={formData.requested_amount}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            requested_amount: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Maximum refundable: ₦{Number(sale.amount_paid).toLocaleString()}
                    </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RefundRequestForm;