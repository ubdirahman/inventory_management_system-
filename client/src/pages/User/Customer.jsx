import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const Customer = () => {
    const [customers, setCustomers] = useState([]);
    const [debts, setDebts] = useState([]);
    const [formData, setFormData] = useState({ customer_name: '', phone: '', address: '' });
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPayModal, setShowPayModal] = useState(false);
    const [payData, setPayData] = useState({ customerId: '', phone: '', amount: '', description: '', customerName: '' });
    const [payLoading, setPayLoading] = useState(false);
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    const fetchData = async () => {
        const [custRes, debtRes] = await Promise.all([
            api.get('/customers'),
            api.get('/debts')
        ]);
        setCustomers(custRes.data);
        setDebts(debtRes.data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(formData.customer_name)) {
            showToast({ type: 'error', title: 'Validation error', message: 'Magaca Customer-ka ku qor xarfo kaliya. Lambarada lama oggola.' });
            return;
        }
        if (!/^\d+$/.test(formData.phone)) {
            showToast({ type: 'error', title: 'Validation error', message: 'Phone-ka ku qor lambar kaliya.' });
            return;
        }

        if (editId) {
            await api.put(`/customers/${editId}`, formData);
            showToast({ type: 'update', title: 'Customer updated', message: `Si guul leh ayaad u bedeshay: ${formData.customer_name}` });
            setEditId(null);
        } else {
            await api.post('/customers', formData);
            showToast({ type: 'save', title: 'Customer saved', message: `Si guul leh ayaad u diwaangelisay: ${formData.customer_name}` });
        }
        setFormData({ customer_name: '', phone: '', address: '' });
        fetchData();
    };

    const handleTextKeyPress = (e) => {
        if (/[0-9]/.test(e.key)) e.preventDefault();
    };

    const handlePhoneKeyPress = (e) => {
        if (!/[0-9]/.test(e.key)) e.preventDefault();
    };

    const handleEdit = (customer) => {
        setFormData({ customer_name: customer.customer_name, phone: customer.phone, address: customer.address });
        setEditId(customer._id);
    };

    const handleDelete = async (id) => {
        const customer = customers.find(c => c._id === id);
        const approved = await confirm({
            title: 'Delete customer?',
            message: `${customer?.customer_name || 'This customer'} will be removed from the directory.`,
            confirmText: 'Delete',
            tone: 'danger'
        });
        if (!approved) return;
        await api.delete(`/customers/${id}`);
        showToast({ type: 'delete', title: 'Customer deleted', message: `Si guul leh ayaad u tirtirtay: ${customer?.customer_name}` });
        fetchData();
    };

    const openPayModal = (customer) => {
        setPayData({
            customerId: customer._id,
            phone: customer.phone || '',
            amount: '',
            description: '',
            customerName: customer.customer_name
        });
        setShowPayModal(true);
    };

    const handleWaafiPay = async () => {
        if (!payData.phone || !payData.amount) {
            showToast({ type: 'error', title: 'Validation', message: 'Phone iyo Amount waa lagama maarmaan.' });
            return;
        }
        setPayLoading(true);
        try {
            const res = await api.post(`/payments/customer/${payData.customerId}`, {
                amount: Number(payData.amount),
                description: payData.description || `Payment from ${payData.customerName}`
            });
            showToast({ type: 'save', title: 'Payment Successful', message: `$${payData.amount} WaafiPay waa loo diray ${payData.customerName}` });
            setShowPayModal(false);
        } catch (err) {
            showToast({ type: 'error', title: 'Payment Failed', message: err.response?.data?.message || 'WaafiPay payment failed.' });
        } finally {
            setPayLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    return (
        <Layout>
            <div style={{ marginBottom: '1.25rem' }}>
                <h1 style={{ marginBottom: '0.25rem' }}>Client Directory</h1>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Establish and manage long-term customer relationships.</p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.25rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>{editId ? 'Modify Client' : 'Register New Client'}</h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                    <div className="form-group">
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Client Name</label>
                        <input
                            type="text" placeholder="e.g. Abdurahman Ali" required
                            value={formData.customer_name}
                            onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                            onKeyPress={handleTextKeyPress}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Phone Number</label>
                        <input
                            type="text" placeholder="e.g. 61xxxxxxx" required
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            onKeyPress={handlePhoneKeyPress}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Office/Home Address</label>
                        <input
                            type="text" placeholder="e.g. Mogadishu, Somalia" required
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editId ? 'Save Changes' : 'Register Client'}</button>
                        {editId && <button type="button" className="btn btn-secondary" onClick={() => { setEditId(null); setFormData({ customer_name: '', phone: '', address: '' }); }}>Cancel</button>}
                    </div>
                </form>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder="Search clients by name or phone..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ padding: '0.75rem 1rem', width: '100%', maxWidth: '400px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}
                />
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>CLIENT DETAILS</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>COMMUNICATION</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>FINANCIAL SUMMARY</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map(c => {
                            const customerDebts = debts.filter(d => d.customer?._id === c._id);
                            const totalAmount = customerDebts.reduce((acc, d) => acc + (d.quantity * d.price), 0);
                            const totalDebt = customerDebts.reduce((acc, d) => {
                                if (d.status === 'paid') return acc;
                                return acc + ((d.quantity * d.price) - (d.paidAmount || 0));
                            }, 0);
                            const totalPaid = totalAmount - totalDebt;

                            return (
                                <tr key={c._id} className="table-row-hover">
                                    <td style={{ padding: '1.25rem 1rem' }}>
                                        <div style={{ fontWeight: 600 }}>{c.customer_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.address}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1rem' }}>{c.phone}</td>
                                    <td style={{ padding: '1.25rem 1rem' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Total: ${totalAmount.toFixed(2)}</div>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Paid: ${totalPaid.toFixed(2)}</span>
                                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '8px', background: totalDebt > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: totalDebt > 0 ? '#ef4444' : '#10b981' }}>{totalDebt > 0 ? `Due: $${totalDebt.toFixed(2)}` : 'Clear'}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button className="logout-btn" style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }} onClick={() => openPayModal(c)}>
                                                💳 WaafiPay
                                            </button>
                                            <button className="logout-btn" style={{ color: 'var(--primary)', borderColor: 'rgba(99, 102, 241, 0.2)' }} onClick={() => handleEdit(c)}>Edit</button>
                                            <button className="logout-btn" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => handleDelete(c._id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                {filteredCustomers.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No clients found.</div>
                )}
            </div>

            {/* WaafiPay Payment Modal */}
            {showPayModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '440px', maxWidth: '92%', background: '#fff', borderRadius: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#10b981', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '1.2rem' }}>💳</div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>WaafiPay Payment</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Send to: {payData.customerName}</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Phone Number</label>
                                <input type="text" value={payData.phone} onChange={e => setPayData({ ...payData, phone: e.target.value })} placeholder="252XXXXXXXXX" />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Amount (USD)</label>
                                <input type="number" value={payData.amount} onChange={e => setPayData({ ...payData, amount: e.target.value })} placeholder="0.00" min="0.01" step="0.01" />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Description (optional)</label>
                                <input type="text" value={payData.description} onChange={e => setPayData({ ...payData, description: e.target.value })} placeholder="e.g. Monthly bill" />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button className="btn btn-secondary" onClick={() => setShowPayModal(false)} disabled={payLoading}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleWaafiPay} disabled={payLoading} style={{ background: '#10b981' }}>
                                {payLoading ? 'Processing...' : 'Send Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Customer;
