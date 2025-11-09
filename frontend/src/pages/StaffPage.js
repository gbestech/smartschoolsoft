import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Download,
    Upload,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Filter,
    Eye
} from 'lucide-react';

const StaffPage = () => {
    const [staff, setStaff] = useState([]);
    const [filteredStaff, setFilteredStaff] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [loading, setLoading] = useState(false);

    // Sample initial data
    const initialStaff = [
        {
            id: 1,
            employeeId: 'EMP001',
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@company.com',
            phone: '+1 (555) 123-4567',
            position: 'Software Engineer',
            department: 'Information Technology',
            hireDate: '2023-01-15',
            status: 'active',
            salary: 75000,
            address: '123 Main St, New York, NY',
            passport: {
                number: 'A12345678',
                expiryDate: '2025-12-31',
                nationality: 'American',
                issueDate: '2020-01-15',
                issueCountry: 'United States',
                scanFile: 'passport_emp001.pdf'
            }
        },
        {
            id: 2,
            employeeId: 'EMP002',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.johnson@company.com',
            phone: '+1 (555) 987-6543',
            position: 'HR Manager',
            department: 'Human Resources',
            hireDate: '2022-03-10',
            status: 'active',
            salary: 68000,
            address: '456 Oak Ave, Los Angeles, CA',
            passport: {
                number: 'B87654321',
                expiryDate: '2024-08-15',
                nationality: 'Canadian',
                issueDate: '2019-08-20',
                issueCountry: 'Canada',
                scanFile: 'passport_emp002.pdf'
            }
        }
    ];

    useEffect(() => {
        setStaff(initialStaff);
        setFilteredStaff(initialStaff);
    }, []);

    // Filter staff based on search and department
    useEffect(() => {
        let filtered = staff;

        if (searchTerm) {
            filtered = filtered.filter(employee =>
                `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedDepartment !== 'all') {
            filtered = filtered.filter(employee => employee.department === selectedDepartment);
        }

        setFilteredStaff(filtered);
    }, [searchTerm, selectedDepartment, staff]);

    const departments = ['all', 'Human Resources', 'Information Technology', 'Sales', 'Marketing', 'Finance'];

    const statusColors = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-red-100 text-red-800',
        on_leave: 'bg-yellow-100 text-yellow-800'
    };

    const [newStaff, setNewStaff] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        hireDate: '',
        salary: '',
        address: '',
        passport: {
            number: '',
            expiryDate: '',
            nationality: '',
            issueDate: '',
            issueCountry: '',
            scanFile: null
        }
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewStaff(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePassportChange = (e) => {
        const { name, value } = e.target;
        setNewStaff(prev => ({
            ...prev,
            passport: {
                ...prev.passport,
                [name]: value
            }
        }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewStaff(prev => ({
                ...prev,
                passport: {
                    ...prev.passport,
                    scanFile: file
                }
            }));
        }
    };

    const handleAddStaff = (e) => {
        e.preventDefault();
        const staffMember = {
            ...newStaff,
            id: staff.length + 1,
            employeeId: `EMP${String(staff.length + 1).padStart(3, '0')}`,
            status: 'active'
        };

        setStaff(prev => [...prev, staffMember]);
        setIsAddModalOpen(false);
        setNewStaff({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            position: '',
            department: '',
            hireDate: '',
            salary: '',
            address: '',
            passport: {
                number: '',
                expiryDate: '',
                nationality: '',
                issueDate: '',
                issueCountry: '',
                scanFile: null
            }
        });
    };

    const handleViewStaff = (staffMember) => {
        setSelectedStaff(staffMember);
        setIsViewModalOpen(true);
    };

    const handleDeleteStaff = (id) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            setStaff(prev => prev.filter(employee => employee.id !== id));
        }
    };

    const exportToCSV = () => {
        const headers = ['Employee ID', 'Name', 'Email', 'Position', 'Department', 'Status', 'Hire Date', 'Passport Number', 'Passport Expiry'];
        const csvData = filteredStaff.map(employee => [
            employee.employeeId,
            `${employee.firstName} ${employee.lastName}`,
            employee.email,
            employee.position,
            employee.department,
            employee.status,
            employee.hireDate,
            employee.passport.number,
            employee.passport.expiryDate
        ]);

        const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'staff_data.csv';
        link.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Management</h1>
                <p className="text-gray-600">Manage your organization's staff members and their information</p>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search staff by name, email, or position..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Department Filter */}
                        <select
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                        >
                            {departments.map(dept => (
                                <option key={dept} value={dept}>
                                    {dept === 'all' ? 'All Departments' : dept}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 w-full lg:w-auto">
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Staff
                        </button>
                    </div>
                </div>
            </div>

            {/* Staff Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Position
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Passport
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredStaff.map((employee) => (
                                <tr key={employee.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {employee.firstName} {employee.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500">{employee.email}</div>
                                                <div className="text-xs text-gray-400">{employee.employeeId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{employee.position}</div>
                                        <div className="text-sm text-gray-500">${employee.salary.toLocaleString()}/year</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {employee.department}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {employee.passport.number}
                                        </div>
                                        <div className={`text-xs ${new Date(employee.passport.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) ? 'text-red-600' : 'text-gray-500'}`}>
                                            Expires: {new Date(employee.passport.expiryDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[employee.status]}`}>
                                            {employee.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleViewStaff(employee)}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="text-gray-600 hover:text-gray-900 p-1 rounded">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStaff(employee.id)}
                                                className="text-red-600 hover:text-red-900 p-1 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredStaff.length === 0 && (
                    <div className="text-center py-12">
                        <User className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No staff members found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Try adjusting your search or filter to find what you're looking for.
                        </p>
                    </div>
                )}
            </div>

            {/* Add Staff Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4">Add New Staff Member</h2>
                            <form onSubmit={handleAddStaff} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={newStaff.firstName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={newStaff.lastName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={newStaff.email}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={newStaff.phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Position *
                                        </label>
                                        <input
                                            type="text"
                                            name="position"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={newStaff.position}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Department *
                                        </label>
                                        <select
                                            name="department"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={newStaff.department}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Department</option>
                                            {departments.filter(dept => dept !== 'all').map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Hire Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="hireDate"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={newStaff.hireDate}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Salary *
                                        </label>
                                        <input
                                            type="number"
                                            name="salary"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={newStaff.salary}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                {/* Passport Information */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold mb-4">Passport Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Passport Number *
                                            </label>
                                            <input
                                                type="text"
                                                name="number"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={newStaff.passport.number}
                                                onChange={handlePassportChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nationality *
                                            </label>
                                            <input
                                                type="text"
                                                name="nationality"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={newStaff.passport.nationality}
                                                onChange={handlePassportChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Issue Date *
                                            </label>
                                            <input
                                                type="date"
                                                name="issueDate"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={newStaff.passport.issueDate}
                                                onChange={handlePassportChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Expiry Date *
                                            </label>
                                            <input
                                                type="date"
                                                name="expiryDate"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={newStaff.passport.expiryDate}
                                                onChange={handlePassportChange}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Issue Country *
                                            </label>
                                            <input
                                                type="text"
                                                name="issueCountry"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={newStaff.passport.issueCountry}
                                                onChange={handlePassportChange}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Passport Scan
                                            </label>
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                onChange={handleFileUpload}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Upload passport scan (PDF, JPG, PNG, max 5MB)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Add Staff Member
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Staff Modal */}
            {isViewModalOpen && selectedStaff && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Staff Details</h2>
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Personal Information */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <User className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Full Name</p>
                                                <p className="font-medium">{selectedStaff.firstName} {selectedStaff.lastName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                <p className="font-medium">{selectedStaff.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Phone</p>
                                                <p className="font-medium">{selectedStaff.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Address</p>
                                                <p className="font-medium">{selectedStaff.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Employment Information */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Employment Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Employee ID</p>
                                            <p className="font-medium">{selectedStaff.employeeId}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Position</p>
                                            <p className="font-medium">{selectedStaff.position}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Department</p>
                                            <p className="font-medium">{selectedStaff.department}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Salary</p>
                                            <p className="font-medium">${selectedStaff.salary.toLocaleString()}/year</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Hire Date</p>
                                            <p className="font-medium">{new Date(selectedStaff.hireDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Status</p>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[selectedStaff.status]}`}>
                                                {selectedStaff.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Passport Information */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Passport Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Passport Number</p>
                                            <p className="font-medium">{selectedStaff.passport.number}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Nationality</p>
                                            <p className="font-medium">{selectedStaff.passport.nationality}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Issue Date</p>
                                            <p className="font-medium">{new Date(selectedStaff.passport.issueDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Expiry Date</p>
                                            <p className={`font-medium ${new Date(selectedStaff.passport.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) ? 'text-red-600' : ''}`}>
                                                {new Date(selectedStaff.passport.expiryDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-sm text-gray-500">Issue Country</p>
                                            <p className="font-medium">{selectedStaff.passport.issueCountry}</p>
                                        </div>
                                        {selectedStaff.passport.scanFile && (
                                            <div className="md:col-span-2">
                                                <p className="text-sm text-gray-500">Passport Scan</p>
                                                <a
                                                    href="#"
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        // Handle file download/view
                                                        alert('Downloading passport file: ' + selectedStaff.passport.scanFile);
                                                    }}
                                                >
                                                    {selectedStaff.passport.scanFile}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Close
                                </button>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    Edit Information
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffPage;