import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
const API = `${SERVER_URL}/api`;

export default function ListingDetail() {
    const { id } = useParams();
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orderForm, setOrderForm] = useState({ quantity: 1, notes: '' });
    const [ordering, setOrdering] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch(`${API}/listings/${id}`)
            .then(r => r.json())
            .then(d => { setListing(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [id]);

    const handleOrder = async () => {
        if (!user) return navigate('/login');
        setOrdering(true);
        try {
            await fetch(`${API}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ listingId: id, quantity: orderForm.quantity, notes: orderForm.notes })
            });
            setMessage('✅ Pickup requested! Check your dashboard for updates.');
            setListing(prev => ({ ...prev, status: 'reserved' }));
        } catch (e) { setMessage('❌ ' + e.message); }
        setOrdering(false);
    };

    const startChat = async () => {
        if (!user) return navigate('/login');
        try {
            const res = await fetch(`${API}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ userId: listing.donor._id, listingId: id, message: `Hi! I'm interested in "${listing.title}"` })
            });
            const chat = await res.json();
            navigate(`/chat/${chat._id}`);
        } catch (e) { console.error(e); }
    };

    if (loading) return <div className="page container"><div className="loader"><div className="spinner"></div></div></div>;
    if (!listing) return <div className="page container"><div className="empty-state"><h3>Listing not found</h3></div></div>;

    return (
        <div className="page container">
            <div className="detail-page fade-in">
                <div>
                    <div className="detail-images card">
                        <img src={listing.images?.[0] ? `${SERVER_URL}${listing.images[0]}` : `https://placehold.co/800x400/10B981/white?text=${encodeURIComponent(listing.title)}`} alt={listing.title} />
                    </div>
                    <div className="detail-info" style={{ marginTop: 24 }}>
                        <div className="flex items-center gap-sm">
                            <span className={`badge ${listing.type === 'donation' ? 'badge-donation' : 'badge-sale'}`}>
                                {listing.type === 'donation' ? '🎁 Free Donation' : '💰 For Sale'}
                            </span>
                            <span className={`badge badge-${listing.status}`}>{listing.status}</span>
                            <span className="badge" style={{ background: 'var(--bg-secondary)' }}>{listing.category}</span>
                        </div>
                        <h1>{listing.title}</h1>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>{listing.description}</p>

                        <div className="grid grid-2" style={{ gap: 12 }}>
                            <div className="card" style={{ padding: 16 }}><strong>📦 Quantity</strong><br />{listing.quantity} {listing.unit}</div>
                            <div className="card" style={{ padding: 16 }}><strong>💰 Price</strong><br />{listing.type === 'donation' ? 'FREE' : `$${listing.price.toFixed(2)}`}</div>
                            <div className="card" style={{ padding: 16 }}><strong>⏰ Pickup</strong><br />{listing.pickupTimeStart || '—'} - {listing.pickupTimeEnd || '—'}</div>
                            <div className="card" style={{ padding: 16 }}><strong>📍 Address</strong><br />{listing.address}</div>
                        </div>

                        {listing.dietaryInfo?.length > 0 && (
                            <div><strong>Dietary Info:</strong> <div className="flex gap-sm" style={{ marginTop: 8 }}>{listing.dietaryInfo.map(d => <span key={d} className="badge" style={{ background: 'var(--bg-secondary)' }}>{d}</span>)}</div></div>
                        )}
                        {listing.pickupInstructions && <div className="card" style={{ padding: 16, background: 'rgba(16,185,129,0.05)', borderColor: 'var(--primary)' }}><strong>📋 Pickup Instructions:</strong><br />{listing.pickupInstructions}</div>}
                        <p className="text-sm text-muted">👁️ {listing.viewCount} views · 📦 {listing.orderCount} orders</p>
                    </div>
                </div>

                <div className="detail-sidebar">
                    {/* Donor Card */}
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ marginBottom: 16 }}>Shared by</h3>
                        <Link to={`/profile/${listing.donor?._id}`} className="flex items-center gap-md" style={{ color: 'inherit', textDecoration: 'none' }}>
                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
                                {listing.donor?.name?.charAt(0)}
                            </div>
                            <div>
                                <h4>{listing.donor?.name}</h4>
                                <span style={{ color: 'var(--accent)' }}>{'⭐'.repeat(Math.round(listing.donor?.rating || 0))}</span>
                                <span className="text-sm text-muted"> ({listing.donor?.reviewCount || 0} reviews)</span>
                            </div>
                        </Link>
                        {listing.donor?.bio && <p style={{ marginTop: 12, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{listing.donor.bio}</p>}
                        <div className="flex gap-sm" style={{ marginTop: 16 }}>
                            <span className="text-sm">🍽️ {listing.donor?.totalDonations || 0} donations</span>
                            <span className="text-sm">💚 {listing.donor?.totalMealsSaved || 0} meals saved</span>
                        </div>
                    </div>

                    {/* Order Card */}
                    {listing.status === 'available' && user && user._id !== listing.donor?._id && (
                        <div className="card" style={{ padding: 24 }}>
                            <h3 style={{ marginBottom: 16 }}>Request Pickup</h3>
                            <div className="input-group" style={{ marginBottom: 12 }}>
                                <label>Quantity</label>
                                <input className="input" type="number" min={1} max={listing.quantity} value={orderForm.quantity} onChange={e => setOrderForm(f => ({ ...f, quantity: e.target.value }))} />
                            </div>
                            <div className="input-group" style={{ marginBottom: 16 }}>
                                <label>Note to donor (optional)</label>
                                <textarea className="input" rows={2} value={orderForm.notes} onChange={e => setOrderForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any special requests..." />
                            </div>
                            {listing.type === 'sale' && (
                                <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: 16, fontWeight: 700, fontSize: '1.1rem' }}>
                                    Total: ${(listing.price * (orderForm.quantity || 1)).toFixed(2)}
                                </div>
                            )}
                            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleOrder} disabled={ordering}>
                                {ordering ? 'Requesting...' : listing.type === 'donation' ? '🎁 Request Free Pickup' : `💰 Order — $${(listing.price * (orderForm.quantity || 1)).toFixed(2)}`}
                            </button>
                        </div>
                    )}

                    {message && <div className="card" style={{ padding: 16, background: message.startsWith('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>{message}</div>}

                    {/* Chat Button */}
                    {user && user._id !== listing.donor?._id && (
                        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={startChat}>
                            💬 Message {listing.donor?.name}
                        </button>
                    )}
                    {!user && (
                        <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
                            Sign in to request pickup
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
