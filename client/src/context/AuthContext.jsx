import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const API = 'http://localhost:5000/api';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.ok ? r.json() : Promise.reject())
                .then(u => { setUser(u); setLoading(false); })
                .catch(() => { localStorage.removeItem('token'); setToken(null); setUser(null); setLoading(false); });
        } else { setLoading(false); }
    }, [token]);

    const login = async (email, password) => {
        const res = await fetch(`${API}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        localStorage.setItem('token', data.token);
        setToken(data.token); setUser(data.user);
        return data;
    };

    const register = async (formData) => {
        const res = await fetch(`${API}/auth/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        localStorage.setItem('token', data.token);
        setToken(data.token); setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null); setUser(null);
    };

    const updateUser = (updates) => setUser(prev => ({ ...prev, ...updates }));

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}
