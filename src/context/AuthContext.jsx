/* eslint-disable react-refresh/only-export-components -- context module exports useAuth hook */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as storeLogin, getEmployee, getNotifications, ensurePersonalCelebrationNotifications } from '../store/dataStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('rw_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [notifications, setNotifications] = useState(() => {
    const saved = sessionStorage.getItem('rw_session');
    if (!saved) return [];
    try {
      const u = JSON.parse(saved);
      return getNotifications(u.id);
    } catch {
      return [];
    }
  });

  const refreshUser = useCallback(() => {
    if (user) {
      const fresh = getEmployee(user.id);
      if (fresh) {
        setUser(fresh);
        sessionStorage.setItem('rw_session', JSON.stringify(fresh));
      }
    }
  }, [user]);

  const refreshNotifications = useCallback(() => {
    if (user) {
      setNotifications(getNotifications(user.id));
    }
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('rw_session');
    setNotifications([]);
  }, []);

  // Inactivity logout after 30 minutes
  useEffect(() => {
    if (!user) return;
    let timeoutId;
    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => logout(), 30 * 60 * 1000);
    };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user, logout]);

  function login(idOrEmail, password) {
    const emp = storeLogin(idOrEmail, password);
    if (emp) {
      ensurePersonalCelebrationNotifications(emp.id);
      setUser(emp);
      sessionStorage.setItem('rw_session', JSON.stringify(emp));
      setNotifications(getNotifications(emp.id));
      return { success: true, role: emp.role };
    }
    return { success: false, message: 'Invalid credentials or account inactive.' };
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider value={{ user, login, logout, notifications, unreadCount, refreshNotifications, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
