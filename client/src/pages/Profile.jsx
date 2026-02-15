import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
const API = `${SERVER_URL}/api`;

export default function Profile() {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const [u, r, l] = await Promise.all([
                    fetch(`${API}/auth/user/${id}`, { headers }).then(r => r.json()),
                    fetch(`${API}/reviews/user/${id}`).then(r => r.json()),
                    fetch(`${API}/listings?donor=${id}`).then(r => r.json())
                ]);
                setProfile(u);
                setReviews(r || []);
                setListings(l.listings || []);
            } catch (e) { console.error(e); }
            setLoading(false);
        };
        load();
    }, [id]);

    if (loading) return <div className="page container"><div className="loader"><div className="spinner"></div></div></div>;
    if (!profile) return <div className="page container"><div className="empty-state"><h3>User not found</h3></div></div>;

    return (
        <div className="page container" style={{ maxWidth: 800, margin: '0 auto' }}>
            <div className="card fade-in" style={{ padding: 32 }}>
                <div className="profile-header">
                    <div className="profile-avatar">{profile.name?.charAt(0)}</div>
                    <div className="profile-info">
                        <h2>{profile.name}</h2>
                        <div className="flex items-center gap-sm">
                            <span className="badge" style={{ background: 'var(--bg-secondary)' }}>{profile.role}</span>
                            <span style={{ color: 'var(--accent)' }}>{'⭐'.repeat(Math.round(profile.rating || 0))}</span>
                            <span className="text-sm text-muted">({profile.reviewCount || 0} reviews)</span>
                        </div>
                        {profile.bio && <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>{profile.bio}</p>}
                    </div>
                </div>

                <div className="grid grid-3" style={{ marginBottom: 32 }}>
                    <div className="card stats-card">
                        <div className="icon green">🍽️</div>
                        <div><div className="value">{profile.totalDonations || 0}</div><div className="stat-label">Donations</div></div>
                    </div>
                    <div className="card stats-card">
                        <div className="icon amber">💚</div>
                        <div><div className="value">{profile.totalMealsSaved || 0}</div><div className="stat-label">Meals Saved</div></div>
                    </div>
                    <div className="card stats-card">
                        <div className="icon blue">📅</div>
                        <div><div className="value">{new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div><div className="stat-label">Joined</div></div>
                    </div>
                </div>

                {/* Reviews */}
                <h3 style={{ marginBottom: 16 }}>Reviews ({reviews.length})</h3>
                {reviews.length === 0 ? (
                    <p className="text-muted">No reviews yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {reviews.map(r => (
                            <div key={r._id} className="card" style={{ padding: 16 }}>
                                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                                    <div className="flex items-center gap-sm">
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                                            {r.reviewer?.name?.charAt(0)}
                                        </div>
                                        <strong>{r.reviewer?.name}</strong>
                                    </div>
                                    <span style={{ color: 'var(--accent)' }}>{'⭐'.repeat(r.rating)}</span>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', wordWrap: 'break-word', overflowWrap: 'anywhere' }}>{r.comment}</p>
                                {r.listing && <Link to={`/listing/${r.listing._id}`} className="text-sm">Re: {r.listing.title}</Link>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
