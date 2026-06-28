import { NavLink, useNavigate } from 'react-router-dom';
import {
    FaBox,
    FaChartBar,
    FaChevronDown,
    FaCog,
    FaMoneyBillWave,
    FaShoppingCart,
    FaSignOutAlt,
    FaTachometerAlt,
    FaUserTie,
    FaUsers
} from 'react-icons/fa';

const Sidebar = ({ role }) => {
    const navigate = useNavigate();
    const storedUser = JSON.parse(localStorage.getItem('user')) || { username: 'User', role: role || 'user' };

    const menuItems = role === 'admin' ? [
        { path: '/admin', label: 'Dashboard', icon: <FaTachometerAlt /> },
        { path: '/admin/users', label: 'Users', icon: <FaUsers /> }
    ] : [
        { path: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
        { path: '/customers', label: 'Customers', icon: <FaUserTie /> },
        { path: '/products', label: 'Products', icon: <FaBox /> },
        { path: '/sales', label: 'Sales', icon: <FaShoppingCart /> },
        { path: '/debts', label: 'Debt', icon: <FaMoneyBillWave /> },
        { path: '/reports', label: 'Reports', icon: <FaChartBar /> },
        { path: '/settings', label: 'Settings', icon: <FaCog /> }
    ];

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <span className="brand-mark">
                    <FaShoppingCart />
                </span>
                <span>IMS POS</span>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-text">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer-card">
                <div className="user-avatar">
                    {(storedUser.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                    <span className="user-name">{storedUser.username}</span>
                    <span className="user-role">{storedUser.role || role}</span>
                </div>
                <button onClick={handleLogout} className="sidebar-footer-action" title="Logout" type="button">
                    <FaSignOutAlt />
                </button>
                <FaChevronDown className="sidebar-footer-chevron" />
            </div>
        </aside>
    );
};

export default Sidebar;