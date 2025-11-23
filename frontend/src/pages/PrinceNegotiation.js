import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PriceNegotiationModal = ({ product, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        requested_price: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData({
                requested_price: '',
                reason: ''
            });
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post('/api/price-negotiations/', {
                product: product.id,
                requested_price: parseFloat(formData.requested_price),
                reason: formData.reason
            });

            onSuccess();
            onClose();
        } catch (error) {
            setError(error.response?.data?.detail || 'Failed to submit negotiation request');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h2 className="text-xl font-bold mb-4">Negotiate Price for {product.name}</h2>

                <div className="mb-4 p-3 bg-blue-50 rounded">
                    <p className="text-sm text-blue-800">
                        Current Price: <strong>${product.current_price}</strong>
                        {product.min_negotiable_price && (
                            <span className="block mt-1">
                                Minimum Price: <strong>${product.min_negotiable_price}</strong>
                            </span>
                        )}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Your Offered Price *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min={product.min_negotiable_price || 0}
                            max={product.current_price - 0.01}
                            value={formData.requested_price}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                requested_price: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason for Negotiation
                        </label>
                        <textarea
                            value={formData.reason}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                reason: e.target.value
                            }))}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Explain why you're requesting a lower price..."
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Offer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PriceNegotiationModal;