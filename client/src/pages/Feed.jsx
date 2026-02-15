import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
const API = `${SERVER_URL}/api`;

const categories = ['all', 'meals', 'groceries', 'bakery', 'produce', 'dairy', 'beverages', 'other'];
const categoryEmojis = { meals: '🍛', groceries: '🛒', bakery: '🥐', produce: '🥬', dairy: '🧀', beverages: '🥤', other: '📦' };

export default function Feed() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState('');
    const [category, setCategory] = useState('');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('');
    const [view, setView] = useState('grid');
    const socket = useSocket();

    const fetchListings = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (category && category !== 'all') params.append('category', category);
        if (search) params.append('search', search);
        if (sort) params.append('sort', sort);
        try {
            const r = await fetch(`${API}/listings?${params}`);
            const d = await r.json();
            setListings(d.listings || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { fetchListings(); }, [type, category, sort]);

    useEffect(() => {
        if (socket) {
            socket.on('new-listing', (listing) => setListings(prev => [listing, ...prev]));
            socket.on('listing-update', (updated) => setListings(prev => prev.map(l => l._id === updated._id ? updated : l)));
            return () => { socket.off('new-listing'); socket.off('listing-update'); };
        }
    }, [socket]);

    const handleSearch = (e) => { e.preventDefault(); fetchListings(); };

    const getTimeLeft = (expiresAt) => {
        const diff = new Date(expiresAt) - new Date();
        if (diff < 0) return 'Expired';
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) return `${Math.floor(diff / 60000)}m left`;
        if (hours < 24) return `${hours}h left`;
        return `${Math.floor(hours / 24)}d left`;
    };

    return (
        <div className="page container">
            <div className="page-header fade-in">
                <h1>Explore Food Near You 🔍</h1>
                <p className="text-muted">Discover donations and affordable meals from your community</p>
            </div>

            <div className="filters-bar fade-in">
                <form onSubmit={handleSearch} className="search-input">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    <input className="input" placeholder="Search food, categories..." value={search} onChange={e => setSearch(e.target.value)} />
                </form>
                <select className="input" value={type} onChange={e => setType(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="donation">🎁 Donations</option>
                    <option value="sale">💰 For Sale</option>
                </select>
                <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                    {categories.map(c => <option key={c} value={c}>{c === 'all' ? '📋 All Categories' : `${categoryEmojis[c]} ${c.charAt(0).toUpperCase() + c.slice(1)}`}</option>)}
                </select>
                <select className="input" value={sort} onChange={e => setSort(e.target.value)}>
                    <option value="">Newest First</option>
                    <option value="price_low">Price: Low → High</option>
                    <option value="price_high">Price: High → Low</option>
                    <option value="expiring">Expiring Soon</option>
                </select>
                <div style={{ display: 'flex', gap: 4 }}>
                    <button className={`btn btn-sm ${view === 'grid' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('grid')}>⊞</button>
                    <button className={`btn btn-sm ${view === 'map' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('map')}>🗺️</button>
                </div>
            </div>

            {loading ? (
                <div className="loader"><div className="spinner"></div></div>
            ) : listings.length === 0 ? (
                <div className="empty-state fade-in">
                    <h3>No food listings found</h3>
                    <p>Try adjusting your filters or check back later for new listings!</p>
                </div>
            ) : view === 'grid' ? (
                <div className="grid grid-3 fade-in">
                    {listings.map((l, i) => (
                        <Link to={`/listing/${l._id}`} key={l._id} className="card listing-card" style={{ animationDelay: `${i * 0.05}s`, textDecoration: 'none', color: 'inherit' }}>
                            <div className="listing-card-img">
                                <img src={l.images?.[0] ? `${SERVER_URL}${l.images[0]}` : `https://placehold.co/400x300/10B981/white?text=${encodeURIComponent(l.title.substring(0, 12))}`} alt={l.title} />
                                <span className={`badge ${l.type === 'donation' ? 'badge-donation' : 'badge-sale'}`}>
                                    {l.type === 'donation' ? '🎁 Free' : '💰 Sale'}
                                </span>
                                {l.type === 'sale' && <span className="price">${l.price.toFixed(2)}</span>}
                            </div>
                            <div className="listing-card-body">
                                <h3>{l.title}</h3>
                                <p>{l.description}</p>
                                <div className="listing-card-meta">
                                    <div className="listing-card-donor">
                                        <div className="avatar">{l.donor?.name?.charAt(0) || '?'}</div>
                                        <span>{l.donor?.name || 'Anonymous'}</span>
                                    </div>
                                    <span style={{ color: new Date(l.expiresAt) < new Date(Date.now() + 3600000 * 3) ? 'var(--danger)' : 'var(--text-muted)' }}>
                                        ⏰ {getTimeLeft(l.expiresAt)}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="map-container fade-in">
                    <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                        <h3>🗺️ Map View</h3>
                        <p>Map markers would show {listings.length} listings. Enable Leaflet for full map experience.</p>
                        <div style={{ marginTop: 16 }}>
                            {listings.map(l => (
                                <Link key={l._id} to={`/listing/${l._id}`} style={{ display: 'block', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                    📍 {l.title} — {l.address}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
