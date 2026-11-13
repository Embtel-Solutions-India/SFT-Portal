import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api, TOKEN_KEY, USER_KEY } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string, requiredRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  authError: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const readStoredUser = (): User | null => {
  try {
    if (!localStorage.getItem(TOKEN_KEY)) return null;
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [authError, setAuthError] = useState<string | null>(null);

  // Re-validate the stored session with the server on load (token may be expired or revoked).
  useEffect(() => {
    if (!user) return;
    api.auth.me()
      .then(res => (res.user ? setUser(res.user) : logout()))
      .catch(() => logout());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_KEY);
    } catch { /* ignore */ }
  }, [user]);

  const login = async (email: string, pass: string, requiredRole?: UserRole) => {
    setAuthError(null);
    try {
      const res = await api.auth.login(email.trim().toLowerCase(), pass, requiredRole);
      localStorage.setItem(TOKEN_KEY, res.token);
      setUser(res.user);
      return { success: true };
    } catch (err: any) {
      const msg = err?.message?.includes('Failed to fetch') ? 'Cannot reach the server. Please try again.' : err.message;
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch { /* ignore */ }
    setUser(null);
    setAuthError(null);
  };

  const requestPasswordReset = async (email: string) => {
    try {
      await api.auth.forgotPassword(email.trim());
      return true;
    } catch {
      return false;
    }
  };

  const resetPassword = async (token: string, newPass: string) => {
    try {
      await api.auth.resetPassword(token, newPass);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        requestPasswordReset,
        resetPassword,
        authError,
        clearError: () => setAuthError(null)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
