import React, { useState } from 'react';

const HRMenu = () => {
    const [activeMenu, setActiveMenu] = useState('hr');
    const [activeSubmenu, setActiveSubmenu] = useState('view-staff');

    const menuItems = [
        {
            id: 'hr',
            name: 'HR Management',
            icon: '📊',
            submenus: [
                { id: 'view-staff', name: 'View Staff', icon: '👥' },
                { id: 'add-staff', name: 'Add Staff', icon: '➕' },
                { id: 'position', name: 'Position', icon: '💼' },
                { id: 'department', name: 'Department', icon: '🏢' },
                { id: 'roles', name: 'Roles', icon: '🔐' }
            ]
        },
        {
            id: 'payroll',
            name: 'Payroll',
            icon: '💰'
        },
        {
            id: 'reports',
            name: 'Reports',
            icon: '📈'
        }
    ];

    const renderContent = () => {
        switch (activeSubmenu) {
            case 'view-staff':
                return (
                    <div>
                        <h3>Staff Directory</h3>
                        <table className="staff-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Position</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>EMP001</td>
                                    <td>John Smith</td>
                                    <td>Software Engineer</td>
                                    <td>IT</td>
                                    <td><span className="status-active">Active</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );
            case 'add-staff':
                return (
                    <div>
                        <h3>Add New Staff</h3>
                        <form className="staff-form">
                            <input type="text" placeholder="Full Name" />
                            <input type="email" placeholder="Email" />
                            <select>
                                <option>Select Position</option>
                                <option>Software Engineer</option>
                            </select>
                            <button type="submit">Add Staff</button>
                        </form>
                    </div>
                );
            case 'position':
                return <div><h3>Position Management</h3></div>;
            case 'department':
                return <div><h3>Department Management</h3></div>;
            case 'roles':
                return <div><h3>Roles and Permissions</h3></div>;
            default:
                return <div>Select a menu item</div>;
        }
    };

    return (
        <div className="hr-container">
            <div className="sidebar">
                <div className="logo">
                    <h2>HR System</h2>
                </div>
                {menuItems.map(item => (
                    <div key={item.id}>
                        <div
                            className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
                            onClick={() => setActiveMenu(item.id)}
                        >
                            <span className="icon">{item.icon}</span>
                            {item.name}
                        </div>
                        {item.submenus && activeMenu === item.id && (
                            <div className="submenu">
                                {item.submenus.map(sub => (
                                    <div
                                        key={sub.id}
                                        className={`submenu-item ${activeSubmenu === sub.id ? 'active' : ''}`}
                                        onClick={() => setActiveSubmenu(sub.id)}
                                    >
                                        <span className="icon">{sub.icon}</span>
                                        {sub.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="content">
                <div className="content-area">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default HRMenu;