import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) localStorage.setItem('auth_user', JSON.stringify(user));
    else localStorage.removeItem('auth_user');
  }, [user]);

  // attempt to restore user on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Just calling /me. If access token is expired, 
        // the api interceptor will automatically handle refresh via cookies.
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        console.log('No active session found');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async ({ email, password }) => {
    // Backend sets HTTP-only cookies automatically
    const res = await api.post('/auth/login', { email, password });
    const userData = res.data.user;
    setUser(userData);
    return userData;
  };

  const register = async ({ name, email, password }) => {
    // Backend sets HTTP-only cookies automatically on registration
    const res = await api.post('/auth/register', { name, email, password });
    return res.data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const value = { user, login, logout, register, loading };

  if (loading) return <LoadingSpinner fullScreen text="Verifying session..." />;

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
