import { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tasksphere_token');
    const stored = localStorage.getItem('tasksphere_user');
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // ignore malformed cache
      }
    }
    setLoading(false);
  }, []);

  function persistUser(authResponse) {
    const nextUser = {
      id: authResponse.userId,
      fullName: authResponse.fullName,
      email: authResponse.email,
      role: authResponse.role,
    };
    localStorage.setItem('tasksphere_user', JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  }

  async function login(credentials) {
    const res = await authApi.login(credentials);
    return persistUser(res);
  }

  async function register(payload) {
    const res = await authApi.register(payload);
    return persistUser(res);
  }

  function logout() {
    authApi.logout();
    localStorage.removeItem('tasksphere_user');
    setUser(null);
  }

  const value = { user, loading, login, register, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
