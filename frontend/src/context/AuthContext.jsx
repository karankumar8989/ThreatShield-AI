import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { TOKEN_KEY, USER_EMAIL_KEY } from '../utils/constants';
import { isTokenExpired } from '../utils/helpers';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
    setUser(null);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authService.login(email, password);
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_EMAIL_KEY, email);
    setUser({ email, token: data.access_token });
    return data;
  }, []);

  const signup = useCallback(async (email, password) => {
    const { data } = await authService.signup(email, password);
    return data;
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const email = localStorage.getItem(USER_EMAIL_KEY);

    if (token && email && !isTokenExpired(token)) {
      setUser({ email, token });
    } else if (token) {
      logout();
    }
    setLoading(false);
  }, [logout]);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token && isTokenExpired(token)) {
        logout();
        window.location.href = '/login';
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
