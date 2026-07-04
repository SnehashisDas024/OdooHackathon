import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app boot, try to hydrate user from the httpOnly cookie via /auth/me
  const fetchMe = useCallback(async () => {
    try {
      const res = await authService.me();
      // Backend returns { success: true, data: { id, loginId, email, role, ... } }
      setUser(res.data?.data || res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const signIn = async (credentials) => {
    // Backend returns { success: true, data: { user, mustChangePassword } }
    const res = await authService.signIn(credentials);
    const payload = res.data?.data || res.data;
    const userData = payload?.user || payload;
    setUser(userData);
    return { user: userData, mustChangePassword: payload?.mustChangePassword };
  };

  const signOut = async () => {
    try { await authService.signOut(); } catch { /* ignore */ }
    setUser(null);
  };

  // Backend role is 'ADMIN' or 'EMPLOYEE' (uppercase)
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAdmin,
      signIn,
      signOut,
      refetchUser: fetchMe,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
