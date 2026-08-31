import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin } from '../api/fetchClient';
import { notify, logError } from '../lib/notifications';
import { setAuthToken } from './tokenStore';

type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const refreshTimerRef = React.useRef<number | null>(null);

  // parse JWT to get expiration (seconds)
  function getTokenExpiration(ts: string): number | null {
    try {
      const parts = ts.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1];
      const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      if (json && json.exp) return Number(json.exp) * 1000; // ms
      return null;
    } catch (e) {
      return null;
    }
  }

  async function performRefresh() {
    const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) ?? 'http://localhost:8080';
    try {
      console.info('[Auth] Performing silent refresh (cookie-based)');
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // send HttpOnly refresh cookie
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error(`Refresh failed ${res.status}`);
      const body = await res.json();
      if (body?.token) {
        console.info('[Auth] Refresh succeeded — updating token');
        setToken(body.token);
      } else {
        throw new Error('No token in refresh response');
      }
    } catch (e) {
      // on refresh failure, log out
      logError('Auth refresh', e);
      notify('Your session expired. Please log in again.', 'error');
      setToken(null);
    }
  }

  useEffect(() => {
    // clear previous timer
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    if (token) {
      localStorage.setItem('token', token);
      setAuthToken(token);

      const expMs = getTokenExpiration(token);
      if (expMs) {
        const now = Date.now();
        const refreshBefore = 60 * 1000; // 1 minute before expiry
        let delay = expMs - now - refreshBefore;
        if (delay < 0) delay = 0;
        const scheduledAt = new Date(Date.now() + delay).toISOString();
        console.info(`[Auth] Token expires at ${new Date(expMs).toISOString()}, scheduling refresh at ${scheduledAt} (in ${Math.round(delay/1000)}s)`);
        // schedule refresh
        refreshTimerRef.current = window.setTimeout(() => performRefresh(), delay);
      } else {
        console.warn('[Auth] Could not parse token expiration; silent refresh not scheduled');
      }
    } else {
      localStorage.removeItem('token');
      setAuthToken(null);
      console.info('[Auth] No token present, cleared auth state');
    }

    return () => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [token]);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const resp = await apiLogin(credentials);
      if (resp?.token) {
        setToken(resp.token);
        notify('Logged in successfully.', 'success');
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      logError('Auth login', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    notify('You have been logged out.', 'info');
  };

  const value: AuthContextType = {
    token,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
