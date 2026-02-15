import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
const API = `${SERVER_URL}/api`;

export default function CreateListing() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '', description: '', category: 'meals', type: 'donation', price: '',
        quantity: 1, unit: 'servings', expiresAt: '', address: '',
        latitude: '40.7484', longitude: '-73.9857',
        pickupInstructions: '', pickupTimeStart: '', pickupTimeEnd: '',
        dietaryInfo: [], tags: ''
    });
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const toggleDietary = (d) => {
        setForm(f => ({
            ...f,
            dietaryInfo: f.dietaryInfo.includes(d) ? f.dietaryInfo.filter(x => x !== d) : [...f.dietaryInfo, d]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => {
            if (k === 'dietaryInfo') v.forEach(d => fd.append('dietaryInfo', d));
            else fd.append(k, v);
        });
        images.forEach(img => fd.append('images', img));

        try {
            const res = await fetch(`${API}/listings`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
            const listing = await res.json();
            navigate(`/listing/${listing._id}`);
        } catch (e) { setError(e.message); }
        setLoading(false);
    };

    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 16);

    return (
        <div className="page container" style={{ maxWidth: 720, margin: '0 auto' }}>
            <div className="page-header fade-in">
                <h1>Share Food 🍽️</h1>
                <p className="text-muted">Create a listing to donate or sell your surplus food</p>
            </div>

            {error && <div className="toast toast-error" style={{ position: 'relative', marginBottom: 16 }}>{error}</div>}

            <form className="card fade-in" style={{ padding: 32 }} onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Type selector */}
                    <div className="input-group">
                        <label>Listing Type</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {['donation', 'sale'].map(t => (
                                <button key={t} type="button" className={`btn ${form.type === t ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => update('type', t)}>
                                    {t === 'donation' ? '🎁 Free Donation' : '💰 Sell at Reduced Price'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Title *</label>
                        <input className="input" value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Fresh Vegetable Curry & Rice" required />
                    </div>

                    <div className="input-group">
                        <label>Description *</label>
                        <textarea className="input" value={form.description} onChange={e => update('description', e.target.value)} placeholder="Describe the food, ingredients, and how many it can serve..." required rows={4} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="input-group">
                            <label>Category *</label>
                            <select className="input" value={form.category} onChange={e => update('category', e.target.value)}>
                                {['meals', 'groceries', 'bakery', 'produce', 'dairy', 'beverages', 'other'].map(c => (
                                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        {form.type === 'sale' && (
                            <div className="input-group">
                                <label>Price ($) *</label>
                                <input className="input" type="number" min="0" step="0.01" value={form.price} onChange={e => update('price', e.target.value)} required />
                            </div>
                        )}
                        <div className="input-group">
                            <label>Quantity *</label>
                            <input className="input" type="number" min="1" value={form.quantity} onChange={e => update('quantity', e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label>Unit</label>
                            <select className="input" value={form.unit} onChange={e => update('unit', e.target.value)}>
                                {['servings', 'pieces', 'loaves', 'boxes', 'packs', 'bowls', 'bundles', 'kg', 'lbs'].map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Expires At *</label>
                        <input className="input" type="datetime-local" value={form.expiresAt} onChange={e => update('expiresAt', e.target.value)} min={new Date().toISOString().slice(0, 16)} required />
                    </div>

                    <div className="input-group">
                        <label>Address *</label>
                        <input className="input" value={form.address} onChange={e => update('address', e.target.value)} placeholder="123 Main St, Downtown" required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="input-group">
                            <label>Pickup Time Start</label>
                            <input className="input" type="time" value={form.pickupTimeStart} onChange={e => update('pickupTimeStart', e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label>Pickup Time End</label>
                            <input className="input" type="time" value={form.pickupTimeEnd} onChange={e => update('pickupTimeEnd', e.target.value)} />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Pickup Instructions</label>
                        <textarea className="input" rows={2} value={form.pickupInstructions} onChange={e => update('pickupInstructions', e.target.value)} placeholder="e.g. Ring the back door bell" />
                    </div>

                    <div className="input-group">
                        <label>Dietary Information</label>
                        <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                            {['vegetarian', 'vegan', 'halal', 'kosher', 'gluten-free', 'nut-free'].map(d => (
                                <button key={d} type="button"
                                    className={`btn btn-sm ${form.dietaryInfo.includes(d) ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => toggleDietary(d)}>
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Images</label>
                        <input className="input" type="file" accept="image/*" multiple onChange={e => setImages([...e.target.files])} />
                    </div>

                    <div className="input-group">
                        <label>Tags (comma separated)</label>
                        <input className="input" value={form.tags} onChange={e => update('tags', e.target.value)} placeholder="curry, rice, homemade" />
                    </div>

                    <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                        {loading ? 'Creating...' : '🚀 Publish Listing'}
                    </button>
                </div>
            </form>
        </div>
    );
}
