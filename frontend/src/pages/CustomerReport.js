import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/reports/api';

const CustomerReportForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        customer_name: '',
        report_date: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.customer_name.trim() || !formData.report_date || !formData.message.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post(`${API_BASE}/create-report/`, formData);

            toast.success('🎉 Report submitted successfully!');

            // Reset form
            setFormData({
                customer_name: '',
                report_date: '',
                message: ''
            });

            // Notify parent component
            if (onSuccess) {
                onSuccess();
            }

        } catch (error) {
            console.error('Error submitting report:', error);

            const errorMessage = error.response?.data?.message ||
                error.response?.data?.errors?.message?.[0] ||
                'Failed to submit report. Please try again.';

            toast.error(`❌ ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">📊</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Create Customer Report
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Fill in customer details and report information
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Customer Name Field */}
                        <div>
                            <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-2">
                                <span className="mr-2">👤</span>
                                Customer Name
                            </label>
                            <input
                                type="text"
                                id="customer_name"
                                name="customer_name"
                                value={formData.customer_name}
                                onChange={handleChange}
                                required
                                placeholder="Enter customer full name"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                            />
                        </div>

                        {/* Date Field */}
                        <div>
                            <label htmlFor="report_date" className="block text-sm font-medium text-gray-700 mb-2">
                                <span className="mr-2">📅</span>
                                Report Date
                            </label>
                            <input
                                type="date"
                                id="report_date"
                                name="report_date"
                                value={formData.report_date}
                                onChange={handleChange}
                                max={today}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                            />
                        </div>

                        {/* Message Field */}
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                <span className="mr-2">💬</span>
                                Report Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="4"
                                placeholder="Describe the issue, feedback, or report details..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-colors duration-200"
                            />
                            <div className="flex justify-between items-center mt-2">
                                <span className={`text-xs ${formData.message.length > 500 ? 'text-red-500' : 'text-gray-500'
                                    }`}>
                                    {formData.message.length} characters
                                </span>
                                {formData.message.length > 500 && (
                                    <span className="text-xs text-red-500">
                                        Maximum 500 characters recommended
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${isSubmitting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                }`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Submitting...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center space-x-2">
                                    <span>📤</span>
                                    <span>Submit Report</span>
                                </div>
                            )}
                        </button>
                    </form>

                    {/* Additional Info */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            Customer report will be securely stored and accessible to authorized team members.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerReportForm;