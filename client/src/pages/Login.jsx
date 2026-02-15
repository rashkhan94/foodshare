import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await login(email, password);
            navigate('/feed');
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };

    return (
        <div className="auth-page">
            <div className="auth-card card fade-in">
                <h1>Welcome Back 👋</h1>
                <p className="subtitle">Sign in to continue sharing and saving food</p>
                {error && <div className="toast toast-error" style={{ position: 'relative', marginBottom: 16 }}>{error}</div>}
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email</label>
                        <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                    </div>
                    <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                        {loading ? 'Signing in...' : 'Sign In →'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)' }}>
                    Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Sign up free</Link>
                </p>
                <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <strong>Demo accounts:</strong><br />
                    Donor: sarah@foodshare.com<br />
                    Buyer: mike@foodshare.com<br />
                    Admin: admin@foodshare.com<br />
                    Password: password123
                </div>
            </div>
        </div>
    );
}
