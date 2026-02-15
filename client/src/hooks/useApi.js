import { useAuth } from '../context/AuthContext';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
const API = `${SERVER_URL}/api`;

export function useApi() {
    const { token } = useAuth();

    const headers = () => {
        const h = { 'Content-Type': 'application/json' };
        if (token) h.Authorization = `Bearer ${token}`;
        return h;
    };

    const get = async (url) => {
        const res = await fetch(`${API}${url}`, { headers: headers() });
        if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
        return res.json();
    };

    const post = async (url, body, isFormData = false) => {
        const opts = { method: 'POST' };
        if (isFormData) {
            opts.headers = token ? { Authorization: `Bearer ${token}` } : {};
            opts.body = body;
        } else {
            opts.headers = headers();
            opts.body = JSON.stringify(body);
        }
        const res = await fetch(`${API}${url}`, opts);
        if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
        return res.json();
    };

    const put = async (url, body) => {
        const res = await fetch(`${API}${url}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) });
        if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
        return res.json();
    };

    const del = async (url) => {
        const res = await fetch(`${API}${url}`, { method: 'DELETE', headers: headers() });
        if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
        return res.json();
    };

    return { get, post, put, del };
}
