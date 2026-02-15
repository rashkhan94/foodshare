import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
const API = `${SERVER_URL}/api`;

export default function Chat() {
    const { id } = useParams();
    const { user, token } = useAuth();
    const socket = useSocket();
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [typing, setTyping] = useState('');
    const [loading, setLoading] = useState(true);
    const msgEndRef = useRef(null);
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetch(`${API}/chat`, { headers }).then(r => r.json()).then(d => {
            setChats(d || []);
            setLoading(false);
            if (id) loadChat(id);
        }).catch(() => setLoading(false));
    }, [token, id]);

    const loadChat = async (chatId) => {
        try {
            const res = await fetch(`${API}/chat/${chatId}`, { headers });
            const chat = await res.json();
            setActiveChat(chat);
            setMessages(chat.messages || []);
            if (socket) {
                socket.emit('join-chat', chatId);
            }
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (socket && activeChat) {
            socket.on('chat-message', (data) => {
                if (data.chatId === activeChat._id) {
                    setMessages(prev => [...prev, data.message]);
                }
                setChats(prev => prev.map(c => c._id === data.chatId ? { ...c, lastMessage: data.message.text } : c));
            });
            socket.on('typing', (data) => {
                if (data.chatId === activeChat._id) setTyping(`${data.name} is typing...`);
            });
            socket.on('stop-typing', (data) => {
                if (data.chatId === activeChat._id) setTyping('');
            });
            return () => { socket.off('chat-message'); socket.off('typing'); socket.off('stop-typing'); };
        }
    }, [socket, activeChat]);

    useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMsg.trim() || !socket || !activeChat) return;
        socket.emit('send-message', { chatId: activeChat._id, text: newMsg });
        socket.emit('stop-typing', { chatId: activeChat._id });
        setNewMsg('');
    };

    const handleTyping = (e) => {
        setNewMsg(e.target.value);
        if (socket && activeChat) {
            socket.emit('typing', { chatId: activeChat._id });
            clearTimeout(window._typingTimeout);
            window._typingTimeout = setTimeout(() => socket.emit('stop-typing', { chatId: activeChat._id }), 2000);
        }
    };

    const getOtherUser = (chat) => chat.participants?.find(p => p._id !== user._id) || {};

    const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (loading) return <div className="page"><div className="loader"><div className="spinner"></div></div></div>;

    return (
        <div className="chat-layout" style={{ paddingTop: 'var(--nav-height)' }}>
            {/* Sidebar: Hidden on mobile when chat is active */}
            <div className={`chat-sidebar ${activeChat ? 'hidden' : ''}`}>
                <div className="chat-sidebar-header">💬 Messages</div>
                {chats.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No conversations yet</div>
                ) : chats.map(c => {
                    const other = getOtherUser(c);
                    return (
                        <div key={c._id} className={`chat-item ${activeChat?._id === c._id ? 'active' : ''}`} onClick={() => loadChat(c._id)}>
                            <div className="avatar">{other.name?.charAt(0) || '?'}</div>
                            <div className="chat-item-info">
                                <h4>{other.name || 'User'}</h4>
                                <p>{c.lastMessage || 'Start chatting...'}</p>
                            </div>
                            {other.online && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }}></div>}
                        </div>
                    );
                })}
            </div>

            {/* Main Chat: Hidden on mobile when no chat is active */}
            <div className={`chat-main ${!activeChat ? 'hidden' : ''}`}>
                {activeChat ? (
                    <>
                        <div className="chat-header">
                            <button className="btn-icon btn-ghost" onClick={() => setActiveChat(null)} style={{ marginRight: 8, display: 'none' }} className="mobile-only-back">
                                ⬅️
                            </button>
                            <div className="avatar" style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                {getOtherUser(activeChat).name?.charAt(0)}
                            </div>
                            <div>
                                <h4 style={{ fontWeight: 600 }}>{getOtherUser(activeChat).name}</h4>
                                <span className="text-sm text-muted">{getOtherUser(activeChat).online ? '🟢 Online' : '⚪ Offline'}</span>
                            </div>
                        </div>
                        <div className="chat-messages">
                            {messages.map((m, i) => (
                                <div key={i} className={`chat-msg ${(m.sender?._id || m.sender) === user._id ? 'sent' : 'received'}`}>
                                    {m.text}
                                    <div className="time">{formatTime(m.createdAt)}</div>
                                </div>
                            ))}
                            {typing && <div className="typing-indicator">{typing}</div>}
                            <div ref={msgEndRef} />
                        </div>
                        <form className="chat-input-bar" onSubmit={sendMessage}>
                            <input className="input" style={{ flex: 1 }} value={newMsg} onChange={handleTyping} placeholder="Type a message..." autoFocus />
                            <button className="btn btn-primary" type="submit">Send</button>
                        </form>
                    </>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 16 }}>💬</div>
                            <h3>Select a conversation</h3>
                            <p>Or start chatting from a food listing</p>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                @media (max-width: 768px) {
                    .mobile-only-back { display: inline-flex !important; }
                }
            `}</style>
        </div>
    );
}
