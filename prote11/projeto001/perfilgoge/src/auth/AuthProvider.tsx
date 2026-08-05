import React, { createContext, useContext, useEffect, useState } from 'react';

type User = {
  id: string;
  email: string;
  name?: string | null;
  role: 'ADMIN' | 'OPERATOR';
  agencyId?: string | null;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (agencyName: string, adminEmail: string, adminPassword: string, adminName?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [originalFetch, setOriginalFetch] = useState<any>(null);

  useEffect(() => {
    // bootstrap from localStorage
    const t = localStorage.getItem('perfilpro_token');
    if (t) setToken(t);
    else setLoading(false);
  }, []);

  // install global fetch wrapper when token changes
  useEffect(() => {
    // restore original fetch if exists
    if ((window as any).__originalFetch && !originalFetch) setOriginalFetch((window as any).__originalFetch);
    if (!originalFetch) {
      (window as any).__originalFetch = (window as any).fetch;
      setOriginalFetch((window as any).__originalFetch);
    }

    const wrap = async (input: any, init?: any) => {
      const url = typeof input === 'string' ? input : input.url;
      const isApi = typeof url === 'string' && (url.startsWith('/api') || url.includes(window.location.hostname + '/api'));

      const headers = new Headers(init?.headers || (typeof input !== 'string' && input.headers) || {});
      if (token && isApi) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const newInit = { ...(init || {}), headers };
      if (typeof input === 'string') return (window as any).__originalFetch(input, newInit);
      return (window as any).__originalFetch(input, newInit);
    };

    (window as any).fetch = wrap;

    if (token) {
      // validate token by fetching /api/auth/me
      (async () => {
        try {
          const res = await (window as any).__originalFetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
            localStorage.setItem('perfilpro_token', token);
          } else {
            // invalid token
            setToken(null);
            setUser(null);
            localStorage.removeItem('perfilpro_token');
          }
        } catch (err) {
          console.error('Auth /me validation failed', err);
          setUser(null);
          setToken(null);
          localStorage.removeItem('perfilpro_token');
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
      setUser(null);
      localStorage.removeItem('perfilpro_token');
    }

    return () => {
      // restore original fetch on unmount
      if ((window as any).__originalFetch) (window as any).fetch = (window as any).__originalFetch;
    };
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const res = await (window as any).__originalFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      setLoading(false);
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('perfilpro_token', data.token);
    setLoading(false);
  };

  const register = async (agencyName: string, adminEmail: string, adminPassword: string, adminName?: string) => {
    setLoading(true);
    const res = await (window as any).__originalFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agencyName, adminEmail, adminPassword, adminName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Register failed' }));
      setLoading(false);
      throw new Error(err.error || 'Register failed');
    }
    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('perfilpro_token', data.token);
    setLoading(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('perfilpro_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
