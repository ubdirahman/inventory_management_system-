import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const Debt = () => {
    const [debts, setDebts] = useState([]);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState({ customer: '', product: '', quantity: '', price: '', status: 'unpaid' });
    const [editId, setEditId] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentData, setPaymentData] = useState({ id: null, total: 0, paid: 0, remaining: 0, amount: '', customer: '', phone: '' });
    const [showWaafiModal, setShowWaafiModal] = useState(false);
    const [waafiData, setWaafiData] = useState({ debtId: '', phone: '', amount: '', remaining: 0, customerName: '', productName: '' });
    const [waafiLoading, setWaafiLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    const fetchData = async () => {
        const [debtRes, prodRes, custRes] = await Promise.all([
            api.get('/debts'),
            api.get('/products'),
            api.get('/customers')
        ]);
        setDebts(debtRes.data);
        setProducts(prodRes.data);
        setCustomers(custRes.data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleNumberKeyPress = (e) => {
        if (!/[0-9.]/.test(e.key)) e.preventDefault();
    };

    const handleProductChange = (e) => {
        const productId = e.target.value;
        const product = products.find(p => p._id === productId);
        setFormData({
            ...formData,
            product: productId,
            price: product ? product.price : ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const customer = customers.find(c => c._id === formData.customer);
        if (editId) {
            await api.put(`/debts/${editId}`, formData);
            showToast({ type: 'update', title: 'Debt updated', message: `Si guul leh ayaad u bedeshay deyta: ${customer?.customer_name}` });
            setEditId(null);
        } else {
            await api.post('/debts', formData);
            showToast({ type: 'save', title: 'Debt saved', message: `Si guul leh ayaad u diwaangelisay deyta: ${customer?.customer_name}` });
        }
        setFormData({ customer: '', product: '', quantity: '', price: '', status: 'unpaid' });
        fetchData();
    };

    const handleEdit = (debt) => {
        setFormData({
            customer: debt.customer?._id || '',
            product: debt.product?._id || '',
            quantity: debt.quantity,
            price: debt.price,
            status: debt.status
        });
        setEditId(debt._id);
    };

    const handleDelete = async (id) => {
        const debt = debts.find(d => d._id === id);
        const approved = await confirm({
            title: 'Delete debt record?',
            message: `${debt?.customer?.customer_name || 'This debt record'} will be removed from the ledger.`,
            confirmText: 'Delete',
            tone: 'danger'
        });
        if (!approved) return;
        await api.delete(`/debts/${id}`);
        showToast({ type: 'delete', title: 'Debt deleted', message: `Si guul leh ayaad u tirtirtay deyta: ${debt?.customer?.customer_name}` });
        fetchData();
    };

    // Cash payment modal
    const handlePayment = (debt) => {
        const total = debt.quantity * debt.price;
        const paid = debt.paidAmount || 0;
        setPaymentData({
            id: debt._id,
            total: total,
            paid: paid,
            remaining: total - paid,
            amount: '',
            customer: debt.customer?.customer_name,
            phone: debt.customer?.phone || ''
        });
        setShowPaymentModal(true);
    };

    const confirmPayment = async () => {
        if (paymentData.amount) {
            const newStatus = (paymentData.remaining - paymentData.amount) <= 0 ? 'paid' : 'unpaid';
            await api.put(`/debts/${paymentData.id}`, { status: newStatus, amount: paymentData.amount });
            showToast({ type: 'update', title: 'Payment saved', message: `Lacag bixin ayaa loo sameeyey: ${paymentData.customer}` });
            setShowPaymentModal(false);
            fetchData();
        }
    };

    // WaafiPay payment modal
    const openWaafiModal = (debt) => {
        const total = debt.quantity * debt.price;
        const paid = debt.paidAmount || 0;
        const remaining = total - paid;
        setWaafiData({
            debtId: debt._id,
            phone: debt.customer?.phone || '',
            amount: remaining.toFixed(2),
            remaining: remaining,
            customerName: debt.customer?.customer_name || 'Customer',
            productName: debt.product?.name || 'Product'
        });
        setShowWaafiModal(true);
    };

    const handleWaafiPay = async () => {
        if (!waafiData.phone || !waafiData.amount) {
            showToast({ type: 'error', title: 'Validation', message: 'Phone iyo Amount waa lagama maarmaan.' });
            return;
        }
        if (Number(waafiData.amount) > waafiData.remaining) {
            showToast({ type: 'error', title: 'Validation', message: `Amount-ku waa inuusan ka badnaan $${waafiData.remaining.toFixed(2)}` });
            return;
        }
        setWaafiLoading(true);
        try {
            const res = await api.post(`/payments/debt/${waafiData.debtId}`, {
                accountNo: waafiData.phone,
                amount: Number(waafiData.amount)
            });
            showToast({
                type: 'save',
                title: 'WaafiPay Success',
                message: `$${waafiData.amount} waa lagu bixiyey ${waafiData.customerName} - ${waafiData.productName}`
            });
            setShowWaafiModal(false);
            fetchData();
        } catch (err) {
            showToast({ type: 'error', title: 'Payment Failed', message: err.response?.data?.message || 'WaafiPay payment failed.' });
        } finally {
            setWaafiLoading(false);
        }
    };

    const filteredDebts = debts.filter(d =>
        d.customer?.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalDue = filteredDebts.reduce((acc, d) => {
        if (d.status === 'paid') return acc;
        return acc + ((d.quantity * d.price) - (d.paidAmount || 0));
    }, 0);

    return (
        <Layout>
            <div style={{ marginBottom: '1.25rem' }}>
                <h1 style={{ marginBottom: '0.25rem' }}>Debt Ledger</h1>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Track and finalize outstanding credit transactions.</p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.25rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>{editId ? 'Modify Ledger Entry' : 'Record Credit Sale'}</h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                    <div className="form-group">
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Customer</label>
                        <select required value={formData.customer} onChange={e => setFormData({ ...formData, customer: e.target.value })}>
                            <option value="">Select recipient...</option>
                            {customers.map(c => <option key={c._id} value={c._id}>{c.customer_name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Product</label>
                        <select required value={formData.product} onChange={handleProductChange}>
                            <option value="">Choose item...</option>
                            {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Qty</label>
                        <input type="number" placeholder="0" required value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} onKeyPress={handleNumberKeyPress} />
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Price</label>
                        <input type="number" placeholder="0.00" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} onKeyPress={handleNumberKeyPress} />
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Payment Status</label>
                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                            <option value="unpaid">Unpaid / Credit</option>
                            <option value="paid">Settled / Closed</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editId ? 'Save Edits' : 'Post to Ledger'}</button>
                        {editId && <button type="button" className="btn btn-secondary" onClick={() => { setEditId(null); setFormData({ customer: '', product: '', quantity: '', price: '', status: 'unpaid' }); }}>Cancel</button>}
                    </div>
                </form>
            </div>

            {/* Search & Summary */}
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Filter by Client Name</label>
                    <input type="text" placeholder="Search accounts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ padding: '0.75rem', width: '100%', maxWidth: '400px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }} />
                </div>
                <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Aggregate Exposure:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444' }}>${totalDue.toFixed(2)}</span>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>DEBTOR RECORD</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>PRODUCT DETAILS</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>TOTAL VALUE</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>REMAINING OBLIGATION</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>STATUS</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDebts.map(d => {
                            const total = d.quantity * d.price;
                            const paid = d.paidAmount || 0;
                            const remaining = total - paid;
                            return (
                                <tr key={d._id} className="table-row-hover">
                                    <td style={{ padding: '1.25rem 1rem' }}>
                                        <div style={{ fontWeight: 600 }}>{d.customer?.customer_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(d.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1rem' }}>
                                        <div style={{ fontSize: '0.9rem' }}>{d.product?.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.quantity} unit{d.quantity > 1 ? 's' : ''}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1rem', fontWeight: 500 }}>${total.toFixed(2)}</td>
                                    <td style={{ padding: '1.25rem 1rem' }}>
                                        <div style={{ color: remaining > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>${remaining.toFixed(2)}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Settled: ${paid.toFixed(2)}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1rem' }}>
                                        <span style={{
                                            padding: '0.3rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            background: d.status === 'paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: d.status === 'paid' ? '#10b981' : '#ef4444',
                                            textTransform: 'uppercase'
                                        }}>
                                            {d.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                            {remaining > 0 && (
                                                <>
                                                    <button className="logout-btn" style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)', fontSize: '0.8rem', padding: '0.4rem 0.65rem' }} onClick={() => openWaafiModal(d)}>
                                                        💳 WaafiPay
                                                    </button>
                                                    <button className="logout-btn" style={{ color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.2)', fontSize: '0.8rem', padding: '0.4rem 0.65rem' }} onClick={() => handlePayment(d)}>
                                                        💵 Cash
                                                    </button>
                                                </>
                                            )}
                                            <button className="logout-btn" style={{ color: 'var(--primary)', borderColor: 'rgba(99, 102, 241, 0.2)' }} onClick={() => handleEdit(d)}>Edit</button>
                                            <button className="logout-btn" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => handleDelete(d._id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                {filteredDebts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No debt records found.</div>
                )}
            </div>

            {/* Cash Payment Modal */}
            {showPaymentModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '440px', maxWidth: '92%', background: '#fff', borderRadius: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '1.2rem' }}>💵</div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Cash Payment</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer: {paymentData.customer}</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <div style={{ background: 'rgba(99, 102, 241, 0.06)', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total</div>
                                <div style={{ fontWeight: 700, fontSize: '1rem' }}>${paymentData.total.toFixed(2)}</div>
                            </div>
                            <div style={{ background: 'rgba(16, 185, 129, 0.06)', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Paid</div>
                                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#10b981' }}>${paymentData.paid.toFixed(2)}</div>
                            </div>
                            <div style={{ background: 'rgba(239, 68, 68, 0.06)', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Due</div>
                                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ef4444' }}>${paymentData.remaining.toFixed(2)}</div>
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Payment Amount</label>
                            <input type="number" placeholder="Enter amount..." value={paymentData.amount} onChange={e => setPaymentData({ ...paymentData, amount: e.target.value })} onKeyPress={handleNumberKeyPress} min="0.01" step="0.01" />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={confirmPayment} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>Submit Payment</button>
                        </div>
                    </div>
                </div>
            )}

            {/* WaafiPay Payment Modal */}
            {showWaafiModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '440px', maxWidth: '92%', background: '#fff', borderRadius: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '1.2rem' }}>💳</div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>WaafiPay - Debt Payment</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{waafiData.customerName} — {waafiData.productName}</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Phone Number</label>
                                <input type="text" value={waafiData.phone} onChange={e => setWaafiData({ ...waafiData, phone: e.target.value })} placeholder="252XXXXXXXXX" />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Amount (USD) — Max: ${waafiData.remaining.toFixed(2)}</label>
                                <input type="number" value={waafiData.amount} onChange={e => setWaafiData({ ...waafiData, amount: e.target.value })} placeholder="0.00" min="0.01" max={waafiData.remaining} step="0.01" />
                            </div>
                        </div>

                        <div style={{ background: 'rgba(16, 185, 129, 0.06)', borderRadius: '12px', padding: '0.75rem 1rem', marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Customer-ka wuxuu helayaa push notification phone-kiisa. Markuu oggolaado, lacagta waa la transfer gareenayaa oo deynta waa la update gareenayaa.
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button className="btn btn-secondary" onClick={() => setShowWaafiModal(false)} disabled={waafiLoading}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleWaafiPay} disabled={waafiLoading} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                                {waafiLoading ? 'Processing...' : `Pay $${waafiData.amount || '0'}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Debt;
