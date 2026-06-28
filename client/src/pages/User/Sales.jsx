import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState({ product: '', quantity: '', price: '', customer: '', paymentMode: 'cash' });
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPayModal, setShowPayModal] = useState(false);
    const [payData, setPayData] = useState({ phone: '', amount: '', description: '', saleName: '' });
    const [payLoading, setPayLoading] = useState(false);
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    const fetchSales = async () => {
        const { data } = await api.get('/sales');
        setSales(data);
    };

    const fetchProducts = async () => {
        const { data } = await api.get('/products');
        setProducts(data);
    };

    const fetchCustomers = async () => {
        const { data } = await api.get('/customers');
        setCustomers(data);
    };

    useEffect(() => {
        fetchSales();
        fetchProducts();
        fetchCustomers();
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
        try {
            const product = products.find(p => p._id === formData.product);

            if (formData.paymentMode === 'waafi') {
                // Find customer phone
                const customer = customers.find(c => c._id === formData.customer);
                if (!customer || !customer.phone) {
                    showToast({ type: 'error', title: 'WaafiPay Error', message: 'Customer phone number is required for WaafiPay payment.' });
                    return;
                }
                const total = Number(formData.quantity) * Number(formData.price);
                setPayData({
                    phone: customer.phone,
                    amount: total.toString(),
                    description: `Sale: ${product?.name || 'Product'} x${formData.quantity}`,
                    saleName: product?.name || 'Product'
                });
                setShowPayModal(true);
                return;
            }

            if (editId) {
                await api.put(`/sales/${editId}`, formData);
                showToast({ type: 'update', title: 'Sale updated', message: `Si guul leh ayaad u bedeshay iibka: ${product?.name}` });
                setEditId(null);
            } else {
                await api.post('/sales', formData);
                showToast({ type: 'save', title: 'Sale saved', message: `Si guul leh ayaad u diwaangelisay iibka: ${product?.name}` });
            }
            setFormData({ product: '', quantity: '', price: '', customer: '', paymentMode: 'cash' });
            fetchSales();
            fetchProducts();
        } catch (error) {
            showToast({ type: 'error', title: 'Sale failed', message: error.response?.data?.message || 'Hubi stock-ka ama xogta iibka, kadib mar kale isku day.' });
        }
    };

    const handleWaafiPaySubmit = async () => {
        if (!payData.phone || !payData.amount) {
            showToast({ type: 'error', title: 'Validation', message: 'Phone iyo Amount waa lagama maarmaan.' });
            return;
        }
        setPayLoading(true);
        try {
            // First process WaafiPay payment
            await api.post('/payments/sale', {
                accountNo: payData.phone,
                amount: Number(payData.amount),
                description: payData.description
            });

            // Then record the sale
            await api.post('/sales', { ...formData, paymentMode: 'waafi' });

            showToast({ type: 'save', title: 'WaafiPay Success', message: `$${payData.amount} lacag bixinta waa lagu guuleystay - ${payData.saleName}` });
            setShowPayModal(false);
            setFormData({ product: '', quantity: '', price: '', customer: '', paymentMode: 'cash' });
            fetchSales();
            fetchProducts();
        } catch (err) {
            showToast({ type: 'error', title: 'Payment Failed', message: err.response?.data?.message || 'WaafiPay payment failed. Sale not recorded.' });
        } finally {
            setPayLoading(false);
        }
    };

    const handleEdit = (sale) => {
        setFormData({
            product: sale.product?._id || '',
            quantity: sale.quantity,
            price: sale.price,
            customer: '',
            paymentMode: 'cash'
        });
        setEditId(sale._id);
    };

    const handleDelete = async (id) => {
        const sale = sales.find(s => s._id === id);
        const approved = await confirm({
            title: 'Delete sale?',
            message: `${sale?.product?.name || 'This sale'} will be deleted and stock will be restored.`,
            confirmText: 'Delete',
            tone: 'danger'
        });
        if (!approved) return;
        await api.delete(`/sales/${id}`);
        showToast({ type: 'delete', title: 'Sale deleted', message: `Si guul leh ayaad u tirtirtay iibkii: ${sale?.product?.name}` });
        fetchSales();
        fetchProducts();
    };

    const filteredSales = sales.filter(s =>
        s.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalRevenue = filteredSales.reduce((acc, s) => acc + (s.total || 0), 0);

    return (
        <Layout>
            <div style={{ marginBottom: '1.25rem' }}>
                <h1 style={{ marginBottom: '0.25rem' }}>Transaction History</h1>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Review and manage point-of-sale transactions.</p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.25rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>{editId ? 'Modify Transaction' : 'Record New Sale'}</h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                    <div className="form-group">
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Selected Product</label>
                        <select required value={formData.product} onChange={handleProductChange} disabled={!!editId}>
                            <option value="">Choose item...</option>
                            {products.map(p => (
                                <option key={p._id} value={p._id}>{p.name} (Available: {p.stock})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Sale Quantity</label>
                        <input type="number" placeholder="0" required value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} onKeyPress={handleNumberKeyPress} disabled={!!editId} />
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Effective Price ($)</label>
                        <input type="number" placeholder="0.00" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} onKeyPress={handleNumberKeyPress} />
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Payment Method</label>
                        <select value={formData.paymentMode} onChange={e => setFormData({ ...formData, paymentMode: e.target.value })}>
                            <option value="cash">💵 Cash</option>
                            <option value="waafi">💳 WaafiPay (EVC)</option>
                        </select>
                    </div>
                    {formData.paymentMode === 'waafi' && !editId && (
                        <div className="form-group">
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Customer</label>
                            <select value={formData.customer} onChange={e => setFormData({ ...formData, customer: e.target.value })} required>
                                <option value="">Select customer...</option>
                                {customers.map(c => (
                                    <option key={c._id} value={c._id}>{c.customer_name} ({c.phone})</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                            {editId ? 'Save Changes' : formData.paymentMode === 'waafi' ? '💳 Pay & Record' : 'Confirm Sale'}
                        </button>
                        {editId && <button type="button" className="btn btn-secondary" onClick={() => { setEditId(null); setFormData({ product: '', quantity: '', price: '', customer: '', paymentMode: 'cash' }); }}>Cancel</button>}
                    </div>
                </form>
                {editId && <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#f59e0b', fontStyle: 'italic' }}>Note: Only price can be modified for existing sales.</div>}
            </div>

            {/* Summary & Search */}
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <input
                        type="text"
                        placeholder="Search sales by product name..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ padding: '0.75rem 1rem', width: '100%', maxWidth: '400px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}
                    />
                </div>
                <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Revenue:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>${totalRevenue.toFixed(2)}</span>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>PRODUCT</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>QTY / UNIT</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>TOTAL SETTLEMENT</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>DATE RECORDED</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSales.map(s => (
                            <tr key={s._id} className="table-row-hover">
                                <td style={{ padding: '1.25rem 1rem', fontWeight: 600 }}>{s.product?.name || 'Archived Product'}</td>
                                <td style={{ padding: '1.25rem 1rem' }}>
                                    <span style={{ fontWeight: 500 }}>{s.quantity}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.25rem' }}>x ${s.price}</span>
                                </td>
                                <td style={{ padding: '1.25rem 1rem', fontWeight: 700, color: 'var(--primary)' }}>${s.total}</td>
                                <td style={{ padding: '1.25rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button className="logout-btn" style={{ color: 'var(--primary)', borderColor: 'rgba(99, 102, 241, 0.2)' }} onClick={() => handleEdit(s)}>Edit</button>
                                        <button className="logout-btn" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => handleDelete(s._id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredSales.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No sales found.</div>
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
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sale: {payData.saleName}</p>
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
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Description</label>
                                <input type="text" value={payData.description} onChange={e => setPayData({ ...payData, description: e.target.value })} />
                            </div>
                        </div>

                        <div style={{ background: 'rgba(16, 185, 129, 0.06)', borderRadius: '12px', padding: '0.75rem 1rem', marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Customer-ka wuxuu helayaa push notification phone-kiisa. Markuu oggolaado, lacagta waa la transfer gareenayaa.
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button className="btn btn-secondary" onClick={() => setShowPayModal(false)} disabled={payLoading}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleWaafiPaySubmit} disabled={payLoading} style={{ background: '#10b981' }}>
                                {payLoading ? 'Processing...' : `Pay $${payData.amount || '0'}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Sales;
