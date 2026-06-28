import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useToast } from '../../context/ToastContext';

const Settings = () => {
    const { showToast } = useToast();
    const [businessName, setBusinessName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        const settings = JSON.parse(localStorage.getItem('businessSettings')) || {};
        setBusinessName(settings.businessName || '');
        setPhone(settings.phone || '');
        setAddress(settings.address || '');
    }, []);

    const handleSave = (e) => {
        e.preventDefault();
        const settings = { businessName, phone, address };
        localStorage.setItem('businessSettings', JSON.stringify(settings));
        showToast({ type: 'save', title: 'Settings saved', message: 'Business settings waa la kaydiyay.' });
    };

    return (
        <Layout>
            <h1>Settings</h1>
            <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px' }}>
                <h3>Business Information</h3>
                <form onSubmit={handleSave}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Business Name</label>
                        <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Phone</label>
                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Address</label>
                        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary">Save Settings</button>
                </form>
            </div>
        </Layout>
    );
};

export default Settings;
