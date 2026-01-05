import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" />;

    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'pm') return <Navigate to="/pm" />;
    return <Navigate to="/team" />;
}
