// import React, { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import axios from 'axios';

// const API_BASE = 'http://localhost:8000/reports/api';

// const ViewCustomerReport = () => {
//     const [reports, setReports] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);

//     const fetchReports = async () => {
//         try {
//             const response = await axios.get(`${API_BASE}/reports/`);
//             const reportsData = response.data.results || response.data;
//             setReports(Array.isArray(reportsData) ? reportsData : []);
//         } catch (error) {
//             console.error('Error fetching reports:', error);
//             toast.error('Failed to load reports. Please try again.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchReports();
//     }, []);

//     const formatDate = (dateString) => {
//         return new Date(dateString).toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric'
//         });
//     };

//     if (isLoading) {
//         return (
//             <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
//             <div className="max-w-7xl mx-auto">
//                 <div className="bg-white shadow rounded-lg">
//                     <div className="px-6 py-4 border-b border-gray-200">
//                         <h1 className="text-2xl font-semibold text-gray-900">Customer Reports</h1>
//                         <p className="mt-1 text-sm text-gray-600">
//                             Total: {reports.length} reports
//                         </p>
//                     </div>

//                     {reports.length === 0 ? (
//                         <div className="text-center py-12">
//                             <div className="text-4xl mb-4">📋</div>
//                             <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
//                             <p className="text-gray-500">No customer reports have been created yet.</p>
//                         </div>
//                     ) : (
//                         <div className="overflow-x-auto">
//                             <table className="min-w-full divide-y divide-gray-200">
//                                 <thead className="bg-gray-50">
//                                     <tr>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                             Customer Name
//                                         </th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                             Report Date
//                                         </th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                             Message
//                                         </th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                             Created
//                                         </th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="bg-white divide-y divide-gray-200">
//                                     {reports.map((report) => (
//                                         <tr key={report.id} className="hover:bg-gray-50">
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <div className="text-sm font-medium text-gray-900">
//                                                     {report.customer_name}
//                                                 </div>
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <div className="text-sm text-gray-900">
//                                                     {formatDate(report.report_date)}
//                                                 </div>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <div className="text-sm text-gray-900 max-w-md truncate">
//                                                     {report.message}
//                                                 </div>
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <div className="text-sm text-gray-500">
//                                                     {formatDate(report.created_at)}
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ViewCustomerReport;

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/reports/api';

const ViewCustomerReport = () => {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedReport, setExpandedReport] = useState(null); // For toggling item details

    const fetchReports = async () => {
        try {
            const response = await axios.get(`${API_BASE}/reports/`);
            const reportsData = response.data.results || response.data;
            setReports(Array.isArray(reportsData) ? reportsData : []);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to load reports. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const toggleExpand = (id) => {
        setExpandedReport(expandedReport === id ? null : id);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h1 className="text-2xl font-semibold text-gray-900">Customer Reports</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Total: {reports.length} reports
                        </p>
                    </div>

                    {reports.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-4">📋</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                            <p className="text-gray-500">No customer reports have been created yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Report Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Message
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Products
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {reports.map((report) => (
                                        <React.Fragment key={report.id}>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {report.customer_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(report.report_date)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 max-w-md whitespace-pre-line">
                                                    {report.message.length > 20
                                                        ? `${report.message.slice(0, 20)}\n${report.message.slice(20)}`
                                                        : report.message}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                                                    {report.products.join(', ')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(report.created_at)}
                                                </td>
                                                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 cursor-pointer"
                                                    onClick={() => toggleExpand(report.id)}>
                                                    {expandedReport === report.id ? 'Hide Items ▲' : 'View Items ▼'}
                                                </td> */}
                                            </tr>

                                            {expandedReport === report.id && report.items && report.items.length > 0 && (
                                                <tr className="bg-gray-50">
                                                    <td colSpan="5" className="px-6 py-4">
                                                        <div className="text-sm text-gray-700 mb-2 font-semibold">Items Selected:</div>
                                                        <table className="min-w-full border border-gray-200 rounded">
                                                            <thead className="bg-gray-100">
                                                                <tr>
                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {report.items.map((item) => (
                                                                    <tr key={item.id} className="border-t">
                                                                        <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                                                                        <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                                                                        <td className="px-4 py-2 text-sm text-gray-900">₦{item.price}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewCustomerReport;
