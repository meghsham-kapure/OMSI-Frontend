import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const toast = useToast();

  // user: { userId, sessionId, role } | null
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('omseva_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Listen for 401 events from api.js — show error popup instead of logging out
  const handleUnauthorized = useCallback(() => {
    toast.error('Access denied — you are not authorized to perform this action.');
    navigate('/osi-console/dashboard', { replace: true });
  }, [navigate, toast]);

  useEffect(() => {
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [handleUnauthorized]);

  async function login(email, password) {
    setIsLoading(true);
    try {
      const res = await api.post('/user/loginUser', { email, password });
      // res.data = { userId, sessionId, role, accessToken }
      const userData = {
        userId: res.data.userId,
        sessionId: res.data.sessionId,
        role: res.data.role,
      };
      sessionStorage.setItem('omseva_admin_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await api.post('/user/logoutUser', {});
    } catch {
      // best-effort
    } finally {
      sessionStorage.removeItem('omseva_admin_user');
      setUser(null);
      navigate('/osi-console/login', { replace: true });
    }
  }

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
