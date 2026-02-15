import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Profile from './pages/Profile';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="loader"><div className="spinner"></div></div>;
    return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
    const { user } = useAuth();
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={user ? <Navigate to="/feed" /> : <Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/listing/:id" element={<ListingDetail />} />
                <Route path="/create" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="*" element={<div className="page container text-center"><h1>404</h1><p>Page not found</p></div>} />
            </Routes>
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <SocketProvider>
                    <AppRoutes />
                </SocketProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
