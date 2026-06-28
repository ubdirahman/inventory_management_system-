import { useEffect, useMemo, useState } from 'react';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import { useToast } from '../../context/ToastContext';
import {
    FaBan,
    FaCheckCircle,
    FaExclamationCircle,
    FaKey,
    FaPlus,
    FaSearch,
    FaShieldAlt,
    FaTrashAlt,
    FaUserCheck,
    FaUserPlus,
    FaUsers
} from 'react-icons/fa';

const emptyForm = {
    full_name: '',
    username: '',
    phone: '',
    password: '',
    role: 'user'
};

const UserStatCard = ({ label, value, icon, tone, helper }) => (
    <div className={`users-stat-card ${tone}`}>
        <div className="users-stat-top">
            <span className="users-stat-icon">{icon}</span>
            <span className="users-stat-helper">{helper}</span>
        </div>
        <span className="users-stat-label">{label}</span>
        <strong>{value}</strong>
        <div className="users-stat-line" />
    </div>
);

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRegister, setShowRegister] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState(emptyForm);
    const [pendingDelete, setPendingDelete] = useState(null);
    const [passwordModal, setPasswordModal] = useState({ user: null, password: '' });
    const { showToast } = useToast();

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data);
        } catch (error) {
            console.error(error);
            showToast({ type: 'error', title: 'Users not loaded', message: 'Cillad ayaa dhacday markii users-ka la soo qaaday.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        if (!keyword) return users;

        return users.filter((user) => [
            user.full_name,
            user.username,
            user.phone,
            user.role
        ].some((value) => value?.toLowerCase().includes(keyword)));
    }, [searchTerm, users]);

    const stats = useMemo(() => {
        const todayKey = new Date().toDateString();

        return {
            total: users.length,
            active: users.filter((user) => !user.isBlocked).length,
            blocked: users.filter((user) => user.isBlocked).length,
            admins: users.filter((user) => user.role === 'admin').length,
            newToday: users.filter((user) => user.createdAt && new Date(user.createdAt).toDateString() === todayKey).length
        };
    }, [users]);

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            await api.post('/admin/register', formData);
            showToast({ type: 'save', title: 'User saved', message: `${formData.username} si guul leh ayaa loo diwaangeliyay.` });
            setShowRegister(false);
            setFormData(emptyForm);
            fetchUsers();
        } catch (error) {
            console.error(error);
            showToast({ type: 'error', title: 'Registration failed', message: error.response?.data?.message || 'Waa la diiday diwaangelinta.' });
        }
    };

    const toggleBlock = async (user) => {
        try {
            const { data } = await api.put(`/admin/users/${user._id}/block`);
            const blocked = data.isBlocked;
            showToast({
                type: blocked ? 'warning' : 'success',
                title: blocked ? 'User blocked' : 'User activated',
                message: blocked ? `Waxaad block-gareysay ${user.username}.` : `Waxaad unblock-gareysay ${user.username}.`
            });
            fetchUsers();
        } catch (error) {
            console.error(error);
            showToast({ type: 'error', title: 'Action failed', message: 'Cillad ayaa dhacday markii la isku dayay isbedelka.' });
        }
    };

    const confirmDelete = async () => {
        if (!pendingDelete) return;

        try {
            await api.delete(`/admin/users/${pendingDelete._id}`);
            showToast({ type: 'delete', title: 'User deleted', message: `${pendingDelete.username} si guul leh ayaa loo tirtiray.` });
            setPendingDelete(null);
            fetchUsers();
        } catch (error) {
            console.error(error);
            showToast({ type: 'error', title: 'Delete failed', message: 'User-ka lama tirtirin. Mar kale isku day.' });
        }
    };

    const updatePassword = async (e) => {
        e.preventDefault();

        if (!passwordModal.user || !passwordModal.password.trim()) {
            showToast({ type: 'error', title: 'Password required', message: 'Fadlan geli password cusub.' });
            return;
        }

        try {
            await api.put(`/admin/users/${passwordModal.user._id}/password`, { password: passwordModal.password });
            showToast({ type: 'update', title: 'Password updated', message: `Password-ka ${passwordModal.user.username} waa la bedelay.` });
            setPasswordModal({ user: null, password: '' });
        } catch (error) {
            console.error(error);
            showToast({ type: 'error', title: 'Update failed', message: 'Password-ka lama bedelin. Mar kale isku day.' });
        }
    };

    const getInitial = (user) => (user.full_name || user.username || 'U').charAt(0).toUpperCase();

    return (
        <Layout>
            <div className="users-page">
                <section className="users-hero">
                    <div>
                        <h1>Users</h1>
                        <p>Manage system access, security status, and user credentials.</p>
                    </div>
                    <button
                        className="btn btn-primary users-primary-action"
                        type="button"
                        onClick={() => setShowRegister((value) => !value)}
                    >
                        {showRegister ? <FaBan /> : <FaPlus />}
                        {showRegister ? 'Cancel' : 'Add New User'}
                    </button>
                </section>

                <section className="users-stat-grid">
                    <UserStatCard label="Total Users" value={stats.total} helper={`+ ${stats.newToday} today`} tone="tone-blue" icon={<FaUsers />} />
                    <UserStatCard label="Active Users" value={stats.active} helper="Allowed" tone="tone-green" icon={<FaUserCheck />} />
                    <UserStatCard label="Admins" value={stats.admins} helper="Protected" tone="tone-orange" icon={<FaShieldAlt />} />
                    <UserStatCard label="Blocked" value={stats.blocked} helper="Disabled" tone="tone-red" icon={<FaExclamationCircle />} />
                </section>

                <section className={`users-workspace ${showRegister ? 'with-form' : ''}`}>
                    {showRegister && (
                        <div className="users-card user-form-card">
                            <div className="users-card-header">
                                <div>
                                    <span className="section-kicker">New account</span>
                                    <h2>Register User</h2>
                                </div>
                                <span className="soft-icon green"><FaUserPlus /></span>
                            </div>

                            <form onSubmit={handleRegister} className="users-form">
                                <label>
                                    Full Name
                                    <input
                                        type="text"
                                        placeholder="e.g. Ahmed Ali"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        required
                                    />
                                </label>
                                <label>
                                    Username
                                    <input
                                        type="text"
                                        placeholder="username"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                    />
                                </label>
                                <label>
                                    Phone
                                    <input
                                        type="text"
                                        placeholder="61xxxxxxx"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </label>
                                <label>
                                    Password
                                    <input
                                        type="password"
                                        placeholder="Create password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </label>
                                <label>
                                    Role
                                    <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </label>
                                <button type="submit" className="btn btn-primary full-width">
                                    <FaUserPlus /> Save User
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="users-card users-table-card">
                        <div className="users-card-header table-header">
                            <div>
                                <span className="section-kicker">Access list</span>
                                <h2>System Users</h2>
                            </div>
                            <label className="users-search">
                                <FaSearch />
                                <input
                                    type="search"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </label>
                        </div>

                        <div className="users-table-wrap">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>User Identity</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id}>
                                            <td>
                                                <div className="identity-cell">
                                                    <span className="identity-avatar">{getInitial(user)}</span>
                                                    <div>
                                                        <strong>{user.full_name || user.username}</strong>
                                                        <span>@{user.username}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`role-pill ${user.role === 'admin' ? 'admin' : 'user'}`}>{user.role}</span>
                                            </td>
                                            <td>
                                                <span className={`status-pill ${user.isBlocked ? 'blocked' : 'active'}`}>
                                                    {user.isBlocked ? 'Disabled' : 'Active'}
                                                </span>
                                            </td>
                                            <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</td>
                                            <td>
                                                <div className="row-actions">
                                                    <button
                                                        type="button"
                                                        className={`table-icon-button ${user.isBlocked ? 'success' : 'warning'}`}
                                                        title={user.isBlocked ? 'Enable access' : 'Disable access'}
                                                        onClick={() => toggleBlock(user)}
                                                    >
                                                        {user.isBlocked ? <FaCheckCircle /> : <FaBan />}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="table-icon-button primary"
                                                        title="Reset Password"
                                                        onClick={() => setPasswordModal({ user, password: '' })}
                                                    >
                                                        <FaKey />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="table-icon-button danger"
                                                        title="Delete User"
                                                        onClick={() => setPendingDelete(user)}
                                                    >
                                                        <FaTrashAlt />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {loading && <div className="table-empty-state">Loading users...</div>}
                            {!loading && filteredUsers.length === 0 && (
                                <div className="table-empty-state">
                                    <FaUsers />
                                    <p>No users found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            {pendingDelete && (
                <div className="modal-backdrop">
                    <div className="confirm-card">
                        <span className="soft-icon red"><FaTrashAlt /></span>
                        <h3>Delete user?</h3>
                        <p>{pendingDelete.username} will be removed from the system.</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" type="button" onClick={() => setPendingDelete(null)}>Cancel</button>
                            <button className="btn danger-button" type="button" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {passwordModal.user && (
                <div className="modal-backdrop">
                    <form className="confirm-card" onSubmit={updatePassword}>
                        <span className="soft-icon blue"><FaKey /></span>
                        <h3>Reset password</h3>
                        <p>Set a new password for {passwordModal.user.username}.</p>
                        <input
                            type="password"
                            placeholder="New password"
                            value={passwordModal.password}
                            onChange={(e) => setPasswordModal({ ...passwordModal, password: e.target.value })}
                            autoFocus
                        />
                        <div className="modal-actions">
                            <button className="btn btn-secondary" type="button" onClick={() => setPasswordModal({ user: null, password: '' })}>Cancel</button>
                            <button className="btn btn-primary" type="submit">Update</button>
                        </div>
                    </form>
                </div>
            )}
        </Layout>
    );
};

export default AdminUsers;