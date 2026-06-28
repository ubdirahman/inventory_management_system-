import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { FaBars, FaBell, FaCalendarAlt, FaChevronDown, FaSearch } from 'react-icons/fa';
import Sidebar from './Sidebar';

const pageLabels = {
    '/admin': 'Dashboard',
    '/admin/users': 'Users',
    '/dashboard': 'Dashboard',
    '/customers': 'Customers',
    '/products': 'Products',
    '/sales': 'Sales',
    '/debts': 'Debt',
    '/reports': 'Reports',
    '/settings': 'Settings'
};

const Layout = ({ children }) => {
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user')) || { username: 'User', role: 'user' };
    const role = user.role || 'user';

    const pageTitle = pageLabels[location.pathname] || 'Dashboard';
    const formattedDate = useMemo(() => new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }), []);

    return (
        <div className="dashboard-layout app-shell">
            <Sidebar role={role} />
            <div className="workspace-shell">
                <header className="topbar">
                    <div className="topbar-left">
                        <button className="icon-button" type="button" aria-label="Open menu">
                            <FaBars />
                        </button>
                        <span className="breadcrumb-separator">/</span>
                        <span className="topbar-crumb">{pageTitle}</span>
                    </div>

                    <div className="topbar-actions">
                        <label className="topbar-search">
                            <FaSearch />
                            <input type="search" placeholder="Search..." aria-label="Search" />
                        </label>
                        <button className="notification-button" type="button" aria-label="Notifications">
                            <FaBell />
                            <span>3</span>
                        </button>
                        <div className="topbar-avatar" title={user.username}>
                            {(user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <main className="main-content">
                    <div className="page-date-pill">
                        <FaCalendarAlt />
                        <span>{formattedDate}</span>
                        <FaChevronDown />
                    </div>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;