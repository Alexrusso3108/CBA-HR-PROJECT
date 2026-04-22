/* eslint-disable react-refresh/only-export-components -- context module exports useAuth hook */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
<<<<<<< HEAD
import { login as storeLogin, getEmployee, getNotifications, ensurePersonalCelebrationNotifications } from '../store/dataStore';
=======
import { supabase } from '../lib/supabase';
>>>>>>> d7bbb1ccf3a402a99d95a3f02adfbfcc1fecc004

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('rw_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
<<<<<<< HEAD
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
=======

  const [notifications, setNotifications] = useState([]);
  const [inactivityTimer, setInactivityTimer] = useState(null);
>>>>>>> d7bbb1ccf3a402a99d95a3f02adfbfcc1fecc004

  // ── Notifications from Supabase ──────────────────────────────────
  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('employee_id', user.id)
        .eq('company_id', user.company_id)
        .order('created_at', { ascending: false })
        .limit(30);
      setNotifications(data || []);
    } catch {
      setNotifications([]);
    }
  }, [user]);

  // ── Refresh user from Supabase (after profile edit) ──────────────
  const refreshUser = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('employees')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) {
        setUser(data);
        sessionStorage.setItem('rw_session', JSON.stringify(data));
      }
    } catch { /* silent */ }
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('rw_session');
    setNotifications([]);
  }, []);

  // ── Inactivity auto‑logout (30 min) ──────────────────────────────
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

<<<<<<< HEAD
  function login(idOrEmail, password) {
    const emp = storeLogin(idOrEmail, password);
    if (emp) {
      ensurePersonalCelebrationNotifications(emp.id);
=======
  // ── Login via Supabase RPC ────────────────────────────────────────
  // Accepts Employee Code (EMP001) OR email
  async function login(idOrEmail, password) {
    try {
      const { data, error } = await supabase.rpc('login_employee', {
        id_or_email: idOrEmail.trim(),
        plain_password: password,
      });
      if (error) throw error;
      if (!data || data.length === 0) {
        return { success: false, message: 'Invalid credentials or account is inactive.' };
      }
      const emp = data[0];
>>>>>>> d7bbb1ccf3a402a99d95a3f02adfbfcc1fecc004
      setUser(emp);
      sessionStorage.setItem('rw_session', JSON.stringify(emp));
      await refreshNotifications();
      return { success: true, role: emp.role };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: err?.message || 'Login failed. Please try again.' };
    }
  }

<<<<<<< HEAD
  const unreadCount = notifications.filter((n) => !n.read).length;
=======
  // ── Register Company (first‑time admin setup) ─────────────────────
  async function registerCompany(companyName, adminName, adminEmail, password) {
    try {
      const { data, error } = await supabase.rpc('register_company', {
        company_name: companyName,
        admin_name: adminName,
        admin_email: adminEmail,
        plain_password: password,
      });
      if (error) throw error;
      if (!data || data.length === 0) {
        return { success: false, message: 'Registration failed. Please try again.' };
      }
      const emp = data[0];
      setUser(emp);
      sessionStorage.setItem('rw_session', JSON.stringify(emp));
      return { success: true };
    } catch (err) {
      console.error('Register error:', err);
      return { success: false, message: err?.message || 'Registration failed.' };
    }
  }

  // ── Logout ───────────────────────────────────────────────────────
  function logout() {
    setUser(null);
    setNotifications([]);
    sessionStorage.removeItem('rw_session');
  }

  const unreadCount = notifications.filter(n => !n.read).length;
>>>>>>> d7bbb1ccf3a402a99d95a3f02adfbfcc1fecc004

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      registerCompany,
      notifications,
      unreadCount,
      refreshNotifications,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
