import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
const API = `${SERVER_URL}/api`;

export default function Dashboard() {
    const { user, token } = useAuth();
    const socket = useSocket();
    const [tab, setTab] = useState('listings');
    const [listings, setListings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [listRes, buyerOrders, donorOrders] = await Promise.all([
                    fetch(`${API}/listings/my`, { headers }).then(r => r.json()),
                    fetch(`${API}/orders/my?role=buyer`, { headers }).then(r => r.json()),
                    fetch(`${API}/orders/my?role=donor`, { headers }).then(r => r.json())
                ]);
                setListings(listRes || []);
                setOrders([...(donorOrders || []), ...(buyerOrders || [])]);

                if (user.role === 'admin') {
                    const s = await fetch(`${API}/analytics/dashboard`, { headers }).then(r => r.json());
                    setStats(s);
                }
            } catch (e) { console.error(e); }
            setLoading(false);
        };
        fetchData();
    }, [token]);

    useEffect(() => {
        if (socket) {
            socket.on('order-update', (updated) => setOrders(prev => prev.map(o => o._id === updated._id ? { ...o, ...updated } : o)));
        }
    }, [socket]);

    const updateOrderStatus = async (orderId, status) => {
        try {
            const res = await fetch(`${API}/orders/${orderId}/status`, {
                method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const updated = await res.json();
            setOrders(prev => prev.map(o => o._id === orderId ? updated : o));
        } catch (e) { console.error(e); }
    };

    const deleteListing = async (id) => {
        if (!confirm('Delete this listing?')) return;
        await fetch(`${API}/listings/${id}`, { method: 'DELETE', headers });
        setListings(prev => prev.filter(l => l._id !== id));
    };

    if (loading) return <div className="page container"><div className="loader"><div className="spinner"></div></div></div>;

    return (
        <div className="page container">
            <div className="page-header fade-in">
                <h1>Dashboard 📊</h1>
                <p className="text-muted">Welcome back, {user.name}!</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-4 fade-in" style={{ marginBottom: 32 }}>
                <div className="card stats-card">
                    <div className="icon green">🍽️</div>
                    <div><div className="value">{user.totalDonations || listings.length}</div><div className="stat-label">Listings</div></div>
                </div>
                <div className="card stats-card">
                    <div className="icon amber">📦</div>
                    <div><div className="value">{orders.length}</div><div className="stat-label">Orders</div></div>
                </div>
                <div className="card stats-card">
                    <div className="icon blue">💚</div>
                    <div><div className="value">{user.totalMealsSaved || 0}</div><div className="stat-label">Meals Saved</div></div>
                </div>
                <div className="card stats-card">
                    <div className="icon red">⭐</div>
                    <div><div className="value">{user.rating || '—'}</div><div className="stat-label">Rating</div></div>
                </div>
            </div>

            {/* Admin Stats */}
            {stats && user.role === 'admin' && (
                <div className="card fade-in" style={{ padding: 24, marginBottom: 32 }}>
                    <h3 style={{ marginBottom: 16 }}>🔧 Admin Dashboard</h3>
                    <div className="grid grid-4">
                        <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.stats?.totalUsers}</div><div className="text-sm text-muted">Users</div>
                        </div>
                        <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.stats?.activeListings}</div><div className="text-sm text-muted">Active Listings</div>
                        </div>
                        <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.stats?.totalMealsSaved}</div><div className="text-sm text-muted">Meals Saved</div>
                        </div>
                        <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.stats?.co2Saved}kg</div><div className="text-sm text-muted">CO₂ Saved</div>
                        </div>
                    </div>
                    {stats.topDonors?.length > 0 && (
                        <div style={{ marginTop: 20 }}>
                            <h4 style={{ marginBottom: 8 }}>🏆 Top Donors</h4>
                            {stats.topDonors.map(d => (
                                <div key={d._id} className="flex items-center gap-md" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                    <div className="avatar" style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>{d.name?.charAt(0)}</div>
                                    <div style={{ flex: 1 }}><strong>{d.name}</strong></div>
                                    <span className="text-sm">{d.totalDonations} donations · {d.totalMealsSaved} meals</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tabs */}
            <div className="dashboard-tabs fade-in">
                {['listings', 'orders'].map(t => (
                    <button key={t} className={`dashboard-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                        {t === 'listings' ? `📋 My Listings (${listings.length})` : `📦 Orders (${orders.length})`}
                    </button>
                ))}
            </div>

            {/* Listings Tab */}
            {tab === 'listings' && (
                <div className="fade-in">
                    {listings.length === 0 ? (
                        <div className="empty-state"><h3>No listings yet</h3><p>Start sharing food with your community!</p>
                            <Link to="/create" className="btn btn-primary">➕ Create Listing</Link></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {listings.map(l => (
                                <div key={l._id} className="card order-card">
                                    <img src={l.images?.[0] ? `${SERVER_URL}${l.images[0]}` : `https://placehold.co/64x64/10B981/white?text=${l.title?.charAt(0)}`} alt="" />
                                    <div className="order-info">
                                        <h4><Link to={`/listing/${l._id}`}>{l.title}</Link></h4>
                                        <span className="text-sm text-muted">{l.quantity} {l.unit} · {l.category}</span>
                                    </div>
                                    <span className={`badge badge-${l.status === 'available' ? 'completed' : l.status}`}>{l.status}</span>
                                    <div className="order-actions">
                                        <button className="btn btn-ghost btn-sm" onClick={() => deleteListing(l._id)}>🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Orders Tab */}
            {tab === 'orders' && (
                <div className="fade-in">
                    {orders.length === 0 ? (
                        <div className="empty-state"><h3>No orders yet</h3><p>Browse the feed to find available food!</p>
                            <Link to="/feed" className="btn btn-primary">🔍 Browse Food</Link></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {orders.map(o => (
                                <div key={o._id} className="card order-card">
                                    <img src={o.listing?.images?.[0] ? `${SERVER_URL}${o.listing.images[0]}` : `https://placehold.co/64x64/10B981/white?text=F`} alt="" />
                                    <div className="order-info">
                                        <h4>{o.listing?.title || 'Listing'}</h4>
                                        <span className="text-sm text-muted">
                                            {o.donor?._id === user._id ? `From: ${o.buyer?.name}` : `To: ${o.donor?.name}`}
                                            {o.totalPrice > 0 ? ` · $${o.totalPrice.toFixed(2)}` : ' · Free'}
                                        </span>
                                    </div>
                                    <span className={`badge badge-${o.status}`}>{o.status}</span>
                                    <div className="order-actions">
                                        {o.donor?._id === user._id && o.status === 'pending' && (
                                            <>
                                                <button className="btn btn-primary btn-sm" onClick={() => updateOrderStatus(o._id, 'accepted')}>✅ Accept</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => updateOrderStatus(o._id, 'cancelled')}>❌</button>
                                            </>
                                        )}
                                        {o.status === 'accepted' && (
                                            <button className="btn btn-primary btn-sm" onClick={() => updateOrderStatus(o._id, 'completed')}>✅ Complete</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
