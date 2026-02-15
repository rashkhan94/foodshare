import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer', phone: '', bio: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await register(form);
            navigate('/feed');
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };

    const roles = [
        { value: 'donor', label: '🍳 Donor', desc: 'Share surplus food' },
        { value: 'buyer', label: '🛒 Buyer', desc: 'Find affordable meals' },
        { value: 'ngo', label: '🏛️ NGO', desc: 'Collect for shelters' },
        { value: 'admin', label: '⚙️ Admin', desc: 'Manage platform' }
    ];

    return (
        <div className="auth-page">
            <div className="auth-card card fade-in">
                <h1>Join FoodShare 🌱</h1>
                <p className="subtitle">Create your account and start making a difference</p>
                {error && <div className="toast toast-error" style={{ position: 'relative', marginBottom: 16 }}>{error}</div>}
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Full Name</label>
                        <input className="input" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your name" required />
                    </div>
                    <div className="input-group">
                        <label>Email</label>
                        <input className="input" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="your@email.com" required />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input className="input" type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="Min 6 characters" required minLength={6} />
                    </div>
                    <div className="input-group">
                        <label>I want to...</label>
                        <div className="role-selector">
                            {roles.map(r => (
                                <div key={r.value} className={`role-option ${form.role === r.value ? 'selected' : ''}`} onClick={() => update('role', r.value)}>
                                    {r.label}<br /><span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>{r.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Phone (optional)</label>
                        <input className="input" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+1-555-0000" />
                    </div>
                    <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                        {loading ? 'Creating account...' : 'Create Account →'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
