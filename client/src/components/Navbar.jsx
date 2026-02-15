import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const socket = useSocket();
    const location = useLocation();
    const navigate = useNavigate();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [notifications, setNotifications] = useState([]);
    const [showNotifs, setShowNotifs] = useState(false);
    const [unread, setUnread] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        if (socket) {
            socket.on('notification', (n) => {
                setNotifications(prev => [n, ...prev]);
                setUnread(prev => prev + 1);
            });
        }
    }, [socket]);

    useEffect(() => {
        if (user) {
            const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
            fetch(`${SERVER_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
                .then(r => r.json())
                .then(d => { setNotifications(d.notifications || []); setUnread(d.unreadCount || 0); })
                .catch(() => { });
        }
    }, [user]);

    const markAllRead = () => {
        const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
        fetch(`${SERVER_URL}/api/notifications/read`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(() => setUnread(0)).catch(() => { });
    };

    const isLanding = location.pathname === '/' && !user;

    return (
        <nav className="navbar" style={isLanding ? { background: 'rgba(15,23,42,0.8)' } : {}}>
            <div className="container">
                <Link to="/" className="nav-brand">
                    <span>🍽️</span>
                    <span>FoodShare</span>
                </Link>
                <div className="nav-links">
                    {user ? (
                        <>
                            {/* Desktop/Tablet Links */}
                            <div className="nav-links-desktop">
                                <Link to="/feed" className={location.pathname === '/feed' ? 'active' : ''}>🔍 Explore</Link>
                                {(user.role === 'donor' || user.role === 'ngo' || user.role === 'admin') && (
                                    <Link to="/create" className={location.pathname === '/create' ? 'active' : ''}>➕ Share</Link>
                                )}
                                <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>📊 Dash</Link>
                                <Link to="/chat" className={location.pathname.startsWith('/chat') ? 'active' : ''}>💬 Chat</Link>
                            </div>

                            {/* Icons (Always Visible) */}
                            <div className="notif-bell" onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) markAllRead(); }}>
                                🔔
                                {unread > 0 && <span className="notif-count">{unread}</span>}
                                {showNotifs && (
                                    <div className="notif-dropdown" onClick={e => e.stopPropagation()}>
                                        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>Notifications</div>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No notifications yet</div>
                                        ) : notifications.slice(0, 10).map((n, i) => (
                                            <div key={i} className={`notif-item ${!n.read ? 'unread' : ''}`} onClick={() => { if (n.link) navigate(n.link); setShowNotifs(false); }}>
                                                <h4>{n.title}</h4>
                                                <p>{n.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Link to={`/profile/${user._id}`}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                                    {user.name?.charAt(0)}
                                </div>
                            </Link>

                            {/* Desktop Logout (Hidden on Mobile) */}
                            <button className="btn-ghost btn-sm desktop-only" onClick={() => { logout(); navigate('/'); }} style={{ cursor: 'pointer' }}>Logout</button>

                            {/* Mobile Hamburger */}
                            <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                {isMenuOpen ? '✕' : '☰'}
                            </button>

                            {/* Mobile Menu Overlay */}
                            <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                                <Link to="/feed" onClick={() => setIsMenuOpen(false)}>🔍 Explore</Link>
                                {(user.role === 'donor' || user.role === 'ngo' || user.role === 'admin') && (
                                    <Link to="/create" onClick={() => setIsMenuOpen(false)}>➕ Share Food</Link>
                                )}
                                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>📊 Dashboard</Link>
                                <Link to="/chat" onClick={() => setIsMenuOpen(false)}>💬 Chat</Link>
                                <Link to={`/profile/${user._id}`} onClick={() => setIsMenuOpen(false)}>👤 Profile</Link>
                                <button className="btn btn-ghost" onClick={() => { logout(); navigate('/'); setIsMenuOpen(false); }} style={{ justifyContent: 'flex-start', color: 'var(--danger)' }}>
                                    🚪 Logout
                                </button>
                                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Theme</span>
                                    <button className="theme-toggle" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
                                        {theme === 'dark' ? '☀️' : '🌙'}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/feed">Explore</Link>
                            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
                        </>
                    )}

                    {/* Desktop Theme Toggle (Hidden on Mobile) */}
                    <button className="theme-toggle desktop-only" style={{ display: isMenuOpen ? 'none' : 'flex' }} onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>
            </div>
        </nav>
    );
}
