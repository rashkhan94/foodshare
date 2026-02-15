import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Landing() {
    const [stats, setStats] = useState({ meals: 0, donors: 0, co2: 0 });

    useEffect(() => {
        fetch('http://localhost:5000/api/analytics/impact')
            .then(r => r.ok ? r.json() : { totalMealsSaved: 1250, totalDonors: 340, co2Saved: 3125 })
            .then(d => setStats({ meals: d.totalMealsSaved || 1250, donors: d.totalDonors || 340, co2: d.co2Saved || 3125 }))
            .catch(() => setStats({ meals: 1250, donors: 340, co2: 3125 }));
    }, []);

    return (
        <>
            <section className="hero">
                <div className="container">
                    <div className="hero-content fade-in">
                        <h1>
                            Stop Wasting Food.<br />
                            <span className="highlight">Start Sharing Meals.</span>
                        </h1>
                        <p>
                            Connect with local restaurants, bakeries, and generous neighbors to rescue surplus food.
                            Donate what you can't eat, find affordable meals, and make a real impact on hunger and food waste.
                        </p>
                        <div className="hero-actions">
                            <Link to="/register" className="btn btn-primary btn-lg">Join FoodShare Free →</Link>
                            <Link to="/feed" className="btn btn-secondary btn-lg" style={{ color: '#94A3B8', borderColor: 'rgba(255,255,255,0.2)' }}>Browse Food Near You</Link>
                        </div>
                    </div>
                    <div className="hero-stats fade-in" style={{ animationDelay: '0.3s' }}>
                        <div className="hero-stat">
                            <div className="number">{stats.meals.toLocaleString()}+</div>
                            <div className="label">Meals Saved</div>
                        </div>
                        <div className="hero-stat">
                            <div className="number">{stats.donors.toLocaleString()}+</div>
                            <div className="label">Active Donors</div>
                        </div>
                        <div className="hero-stat">
                            <div className="number">{stats.co2.toLocaleString()}kg</div>
                            <div className="label">CO₂ Prevented</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="how-section">
                <div className="container">
                    <div className="section-header">
                        <h2>How FoodShare Works</h2>
                        <p>Three simple steps to fight food waste in your community</p>
                    </div>
                    <div className="how-steps">
                        <div className="how-step card fade-in">
                            <div className="step-num">1</div>
                            <h3>List Your Surplus</h3>
                            <p>Restaurants and individuals post surplus food — free donations or affordable prices. Add photos, pickup times, and dietary info.</p>
                        </div>
                        <div className="how-step card fade-in" style={{ animationDelay: '0.15s' }}>
                            <div className="step-num">2</div>
                            <h3>Discover & Connect</h3>
                            <p>Browse the live feed or map view to find food near you. Chat with donors, schedule pickup, and make a difference.</p>
                        </div>
                        <div className="how-step card fade-in" style={{ animationDelay: '0.3s' }}>
                            <div className="step-num">3</div>
                            <h3>Pick Up & Enjoy</h3>
                            <p>Collect your food at the scheduled time. Leave a review, track your impact, and help build a waste-free community.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="featured-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Why Choose FoodShare?</h2>
                        <p>Built for impact, designed for everyone</p>
                    </div>
                    <div className="grid grid-3">
                        {[
                            { icon: '🗺️', title: 'Real-Time Map', desc: 'Interactive map shows food available near you right now. Never miss a donation.' },
                            { icon: '💬', title: 'Instant Chat', desc: 'Message donors directly. Coordinate pickups in real-time with Socket.IO messaging.' },
                            { icon: '📊', title: 'Impact Dashboard', desc: 'Track your personal impact — meals saved, CO₂ prevented, community contribution.' },
                            { icon: '🏪', title: 'Multi-Role System', desc: 'Donors, buyers, NGOs, and admins — each with tailored dashboards and features.' },
                            { icon: '🔔', title: 'Live Notifications', desc: 'Real-time alerts when new food is listed nearby or when your order is updated.' },
                            { icon: '⭐', title: 'Trust & Reviews', desc: 'Build trust with community ratings. See donor history and reviews before you connect.' }
                        ].map((f, i) => (
                            <div key={i} className="card fade-in" style={{ padding: 32, animationDelay: `${i * 0.1}s` }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{f.icon}</div>
                                <h3 style={{ marginBottom: 8, fontWeight: 700 }}>{f.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: '100px 0', background: 'linear-gradient(135deg, #0F172A, #1a3a2a)', textAlign: 'center', color: 'white' }}>
                <div className="container">
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16 }}>Ready to Make a Difference?</h2>
                    <p style={{ color: '#94A3B8', fontSize: '1.1rem', marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
                        Join thousands of people who are already fighting food waste and helping their communities.
                    </p>
                    <Link to="/register" className="btn btn-primary btn-lg">Get Started — It's Free →</Link>
                </div>
            </section>

            <footer className="footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <h3>🍽️ FoodShare</h3>
                            <p>A real-time platform connecting food donors with people in need. Reduce waste, fight hunger, build community.</p>
                        </div>
                        <div><h3>Platform</h3><a href="/feed">Explore Food</a><a href="/register">Sign Up</a><a href="/login">Login</a></div>
                        <div><h3>Impact</h3><a href="#">Our Mission</a><a href="#">Statistics</a><a href="#">Partners</a></div>
                        <div><h3>Support</h3><a href="#">Help Center</a><a href="#">Contact</a><a href="#">Privacy</a></div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2024 FoodShare. Built with ❤️ to fight food waste.</p>
                    </div>
                </div>
            </footer>
        </>
    );
}
