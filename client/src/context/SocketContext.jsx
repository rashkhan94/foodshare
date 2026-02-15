import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }) {
    const { token } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (token) {
            const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
            const s = io(SERVER_URL, {
                auth: { token },
            });
            s.on('connect', () => console.log('Socket connected'));
            s.on('disconnect', () => console.log('Socket disconnected'));
            setSocket(s);
            return () => s.disconnect();
        }
    }, [token]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}
