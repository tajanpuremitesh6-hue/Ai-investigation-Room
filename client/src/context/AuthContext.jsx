import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(authService.tokenKey);
    if (!token) { setLoading(false); return; }
    authService.me(token).then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => localStorage.removeItem(authService.tokenKey))
      .finally(() => setLoading(false));
  }, []);

  async function signIn(credentials) {
    const result = await authService.login(credentials);
    localStorage.setItem(authService.tokenKey, result.token);
    setUser(result.user);
    return result.user;
  }

  async function signUp(details) {
    const result = await authService.register(details);
    localStorage.setItem(authService.tokenKey, result.token);
    setUser(result.user);
    return result.user;
  }

  function signOut() {
    localStorage.removeItem(authService.tokenKey);
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, signIn, signUp, signOut }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
