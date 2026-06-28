import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import { FaBox, FaShoppingCart, FaUserTie, FaMoneyBillWave, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatCard = ({ title, value, icon, color, trend }) => (
    <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
                width: '45px',
                height: '45px',
                borderRadius: '12px',
                background: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                color: '#fff',
                boxShadow: `0 8px 16px -4px ${color}66`
            }}>
                {icon}
            </div>
            {trend && <span style={{
                fontSize: '0.8rem',
                padding: '0.25rem 0.6rem',
                borderRadius: '20px',
                background: trend > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: trend > 0 ? '#10b981' : '#ef4444',
                fontWeight: 600
            }}>
                {trend > 0 ? '+' : ''}{trend}%
            </span>}
        </div>
        <div>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500, margin: '0 0 0.25rem 0' }}>{title}</h3>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{value}</p>
        </div>
    </div >
);



const UserDashboard = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalSalesCount: 0,
        totalSalesAmount: 0,
        totalCustomers: 0,
        totalDebtCount: 0,
        totalDebtAmount: 0,
        totalPaidAmount: 0,
        totalPendingDebt: 0,
        salesByDate: [],
        productsByCategory: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/dashboard');
                setStats(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchStats();
    }, []);

    const COLORS = ['#6366f1', '#ec4899', '#06b6d4', '#f59e0b', '#10b981'];

    return (
        <Layout>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ marginBottom: '0.25rem' }}>Good morning!</h1>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Here's what's happening with your store today.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.75rem', marginBottom: '1.5rem' }}>
                <StatCard
                    title="Total Products"
                    value={stats.totalProducts}
                    icon={<FaBox />}
                    color="#6366f1"
                    trend={12}
                />
                <StatCard
                    title="Total Customers"
                    value={stats.totalCustomers}
                    icon={<FaUserTie />}
                    color="#10b981"
                    trend={5}
                />
                <StatCard
                    title="Revenue"
                    value={`$${stats.totalSalesAmount}`}
                    icon={<FaShoppingCart />}
                    color="#f59e0b"
                    trend={8}
                />
                <StatCard
                    title="Total Paid"
                    value={`$${stats.totalPaidAmount}`}
                    icon={<FaCheckCircle />}
                    color="#10b981"
                    trend={15}
                />
                <StatCard
                    title="Pending Debt"
                    value={`$${stats.totalPendingDebt}`}
                    icon={<FaExclamationCircle />}
                    color="#ef4444"
                    trend={-2}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>Revenue Overview</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.salesByDate}>
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-glass)" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <Tooltip
                                cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                contentStyle={{
                                    background: 'var(--bg-card)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid var(--border-glass)',
                                    borderRadius: '12px',
                                    boxShadow: 'var(--shadow-premium)'
                                }}
                            />
                            <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} name="Sales" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>Inventory Mix</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={stats.productsByCategory}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                fill="#8884d8"
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {stats.productsByCategory?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-card)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid var(--border-glass)',
                                    borderRadius: '12px'
                                }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Quick Actions</h3>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Fast access to common tasks.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <a href="/sales" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                        <FaShoppingCart /> New Transaction
                    </a>
                    <a href="/products" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                        <FaBox /> Inventory Management
                    </a>
                </div>
            </div>
        </Layout>
    );
};

export default UserDashboard;
