import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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

  const [notifications, setNotifications] = useState([]);
  const [inactivityTimer, setInactivityTimer] = useState(null);

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

  useEffect(() => {
    if (user) refreshNotifications();
  }, [user, refreshNotifications]);

  // ── Inactivity auto‑logout (30 min) ──────────────────────────────
  useEffect(() => {
    if (!user) return;
    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      const t = setTimeout(() => logout(), 30 * 60 * 1000);
      setInactivityTimer(t);
    };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [user]);

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
      setUser(emp);
      sessionStorage.setItem('rw_session', JSON.stringify(emp));
      await refreshNotifications();
      return { success: true, role: emp.role };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: err?.message || 'Login failed. Please try again.' };
    }
  }

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
