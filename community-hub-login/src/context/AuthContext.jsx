import React, { createContext, useContext, useState, useEffect } from 'react';
import { DB } from '../services/db';

const AuthContext = createContext(null);

// Reads a response safely: returns { data, raw } and never throws on non-JSON bodies.
async function readJson(res) {
  const raw = await res.text();
  try {
    return { data: JSON.parse(raw), raw };
  } catch {
    return { data: null, raw };
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      await DB.fetchUsersFromApi();
      const res = await fetch('/api/me.php', { credentials: 'include' });
      if (res.ok) {
        const { data } = await readJson(res);
        if (data && data.user) {
          setUser(data.user);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error('Auth check error:', err);
    }

    // Check if demo user was saved in localStorage
    const savedDemo = localStorage.getItem('chub_demo_user');
    if (savedDemo) {
      try {
        setUser(JSON.parse(savedDemo));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Global heartbeat interval to maintain accurate online status across pages
  useEffect(() => {
    if (!user) return;

    const sendHeartbeat = () => {
      // Just ping online status — lightweight write only
      fetch(`/api/online.php?action=heartbeat&username=${encodeURIComponent(user.username || '')}`, { credentials: 'include' })
        .catch(() => {});
    };

    const refreshUsers = () => {
      DB.fetchUsersFromApi().catch(() => {});
    };

    sendHeartbeat(); // immediate on login
    refreshUsers();

    const heartbeatInterval = setInterval(sendHeartbeat, 30000); // every 30s
    const refreshInterval = setInterval(refreshUsers, 60000);    // every 60s
    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(refreshInterval);
    };
  }, [user?.id, user?.username]);

  const demoLogin = (role = 'Resident') => {
    const demoUser = role === 'Admin' ? {
      id: 100,
      username: 'Admin Officer',
      email: 'admin@sta-rita.gov.ph',
      role: 'Admin',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    } : {
      id: 101,
      username: 'Juan Dela Cruz',
      email: 'juan@example.com',
      role: 'Resident',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };
    localStorage.setItem('chub_demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
    return demoUser;
  };

  const login = async (loginInput, password) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch('/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: controller.signal,
        body: JSON.stringify({ login: loginInput, password }),
      });
      clearTimeout(timeout);
      const { data, raw } = await readJson(res);

      if (!data) {
        console.error('Non-JSON response from login.php:', res.status, raw.slice(0, 500));
        return {
          success: false,
          error: `Server returned an invalid response (HTTP ${res.status}). Check that PHP is running.`,
        };
      }

      if (res.ok && data.user) {
        localStorage.removeItem('chub_demo_user');
        setUser(data.user);
        try { await DB.fetchUsersFromApi(); } catch (e) {}
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Invalid credentials' };
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        return { success: false, error: 'Server took too long. It may be waking up — please try again.' };
      }
      console.error('Login error:', err);
      return { success: false, error: 'Cannot reach the server. Check your connection.' };
    }
  };

  const register = async (username, email, password, photo = null) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

    try {
      const res = await fetch('/api/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: controller.signal,
        body: JSON.stringify({ username, email, password, photo }),
      });
      clearTimeout(timeout);
      const { data, raw } = await readJson(res);

      if (!data) {
        console.error('Non-JSON response from register.php:', res.status, raw.slice(0, 500));
        return {
          success: false,
          error: `Server returned an invalid response (HTTP ${res.status}). Please try again.`,
        };
      }

      if (res.ok) {
        try { await DB.fetchUsersFromApi(); } catch (e) {}
        return { success: true, user: data?.user };
      }
      return { success: false, error: data.error || data.message || 'Registration failed' };
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        return { success: false, error: 'Server took too long to respond. Please try again in a moment.' };
      }
      console.error('Register error:', err);
      return { success: false, error: 'Cannot reach the server. Check your connection.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/logout.php', { credentials: 'include' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('chub_demo_user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}