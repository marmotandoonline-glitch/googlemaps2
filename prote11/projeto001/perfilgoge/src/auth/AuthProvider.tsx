import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

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
  /**
   * Utility function for making authenticated API calls.
   * Replaces the need for global fetch monkey-patching.
   */
  apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

const TOKEN_KEY = 'perfilpro_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap: restore token from localStorage
  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) setToken(t);
    else setLoading(false);
  }, []);

  // Validate token when it changes
  useEffect(() => {
    if (!token) {
      setLoading(false);
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      return;
    }

    // Validate token by fetching /api/auth/me
    (async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          localStorage.setItem(TOKEN_KEY, token);
        } else {
          // Invalid token — clear state
          setToken(null);
          setUser(null);
          localStorage.removeItem(TOKEN_KEY);
        }
      } catch (err) {
        console.error('Auth /me validation failed', err);
        setUser(null);
        setToken(null);
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const apiFetch = useCallback(async (url: string, options?: RequestInit): Promise<Response> => {
    const headers = new Headers(options?.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    const res = await fetch(url, { ...options, headers });
    return res;
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    let lastError = 'Não foi possível conectar ao servidor de autenticação.';

    // Render pode devolver 502/503 durante o cold start. Repetir apenas erros transitórios.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const raw = await res.text();
        let payload: any = {};
        try { payload = raw ? JSON.parse(raw) : {}; } catch { /* Render pode devolver HTML em 502 */ }

        if (res.ok && payload.token && payload.user) {
          setToken(payload.token);
          setUser(payload.user);
          localStorage.setItem(TOKEN_KEY, payload.token);
          setLoading(false);
          return;
        }

        lastError = payload.error || (res.status >= 500
          ? 'O servidor está iniciando ou temporariamente indisponível. Tente novamente em alguns segundos.'
          : 'E-mail ou senha inválidos.');
        if (![502, 503, 504].includes(res.status)) break;
      } catch (err: any) {
        lastError = 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
      }
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }

    setLoading(false);
    throw new Error(lastError);
  };

  const register = async (agencyName: string, adminEmail: string, adminPassword: string, adminName?: string) => {
    setLoading(true);
    const res = await fetch('/api/auth/register', {
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
    localStorage.setItem(TOKEN_KEY, data.token);
    setLoading(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
};
