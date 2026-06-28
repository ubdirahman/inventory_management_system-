import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const Reports = () => {
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashboardRes, productsRes, salesRes] = await Promise.all([
                    api.get('/dashboard'),
                    api.get('/products'),
                    api.get('/sales')
                ]);

                setStats(dashboardRes.data);
                setProducts(productsRes.data);
                setSales(salesRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading || !stats) return <Layout>Loading...</Layout>;

    // Prepare Data for Charts

    // 1. Stock Levels (Bar Chart)
    const stockData = products.map(p => ({
        name: p.name,
        stock: p.stock
    }));

    // 2. Sales by Product (Pie Chart)
    // Aggregate sales quantities by product name
    const salesByProduct = sales.reduce((acc, curr) => {
        const productName = curr.product?.name || 'Unknown';
        if (!acc[productName]) {
            acc[productName] = 0;
        }
        acc[productName] += curr.quantity;
        return acc;
    }, {});

    const salesData = Object.keys(salesByProduct).map(key => ({
        name: key,
        value: salesByProduct[key]
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    return (
        <Layout>
            <h1>Reports & Analysis</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Sales Analysis</h3>
                    <div style={{ marginTop: '1rem' }}>
                        <p>Total Sales Count: <strong>{stats.totalSalesCount}</strong></p>
                        <p>Total Revenue: <strong style={{ color: '#10b981' }}>${stats.totalSalesAmount}</strong></p>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Debt Analysis</h3>
                    <div style={{ marginTop: '1rem' }}>
                        <p>Total Debt Records: <strong>{stats.totalDebtCount}</strong></p>
                        <p>Total Unpaid Amount: <strong style={{ color: '#ef4444' }}>${stats.totalDebtAmount}</strong></p>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Inventory Analysis</h3>
                    <div style={{ marginTop: '1rem' }}>
                        <p>Total Products in Stock: <strong>{stats.totalProducts}</strong></p>
                        <p>Total Customers: <strong>{stats.totalCustomers}</strong></p>
                    </div>
                </div>
            </div>

            {/* CHARTS SECTION */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>

                {/* Chart 1: Stock Levels */}
                <div className="glass-panel" style={{ padding: '1.5rem', height: '400px' }}>
                    <h3>Product Stock Levels</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={stockData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="name" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend />
                            <Bar dataKey="stock" fill="#8884d8" name="Stock Quantity" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Chart 2: Sales Distribution */}
                <div className="glass-panel" style={{ padding: '1.5rem', height: '400px' }}>
                    <h3>Sales Distribution (Quantity)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={salesData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {salesData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </Layout>
    );
};

export default Reports;
