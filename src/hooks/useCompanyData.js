/**
 * useCompanyData – central hook that loads ALL company data from Supabase.
 * Import only the slices you need:
 *   const { employees, departments, loading, reload } = useCompanyData();
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useCompanyData() {
  const { user } = useAuth();
  const companyId = user?.company_id;

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState({});  // { employee_id: {CL,SL,PL} }
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const [empR, deptR, desR, balR, leaveR, holR] = await Promise.all([
        supabase.from('employees').select('*').eq('company_id', companyId).order('created_at'),
        supabase.from('departments').select('*').eq('company_id', companyId).order('name'),
        supabase.from('designations').select('*').eq('company_id', companyId).order('name'),
        supabase.from('leave_balances').select('*').eq('company_id', companyId),
        supabase.from('leave_applications').select('*').eq('company_id', companyId).order('applied_on', { ascending: false }),
        supabase.from('holidays').select('*').eq('company_id', companyId).order('date'),
      ]);

      for (const r of [empR, deptR, desR, balR, leaveR, holR]) {
        if (r.error) throw r.error;
      }

      // ── Normalise employees ──────────────────────────────────────
      const emps = (empR.data || []).map(e => ({
        id: e.id,
        employeeCode: e.employee_code,
        name: e.name,
        email: e.email,
        phone: e.phone,
        address: e.address,
        dob: e.dob,
        joiningDate: e.joining_date,
        departmentId: e.department_id,
        designationId: e.designation_id,
        managerId: e.manager_id,
        role: e.role,
        salary: e.salary,
        status: e.status,
        emergencyContact: e.emergency_contact,
        avatar: e.avatar,
        company_id: e.company_id,
        createdAt: e.created_at,
      }));

      // ── Normalise designations ───────────────────────────────────
      const dess = (desR.data || []).map(d => ({
        id: d.id,
        name: d.name,
        deptId: d.dept_id,
      }));

      // ── Build leaveBalances map ──────────────────────────────────
      const balMap = {};
      (balR.data || []).forEach(b => {
        balMap[b.employee_id] = { CL: b.cl ?? 12, SL: b.sl ?? 10, PL: b.pl ?? 15, _id: b.id };
      });

      // ── Normalise leave applications ─────────────────────────────
      const leaves = (leaveR.data || []).map(l => ({
        id: l.id,
        employeeId: l.employee_id,
        type: l.type,
        fromDate: l.from_date,
        toDate: l.to_date,
        reason: l.reason,
        status: l.status,
        managerComment: l.manager_comment || '',
        appliedOn: l.applied_on,
      }));

      setEmployees(emps);
      setDepartments(deptR.data || []);
      setDesignations(dess);
      setLeaveBalances(balMap);
      setLeaveApplications(leaves);
      setHolidays(holR.data || []);
    } catch (err) {
      console.error('useCompanyData error:', err);
      setError(err?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  // ── Helper look-ups ──────────────────────────────────────────────
  const deptName = id => (departments.find(d => d.id === id)?.name || '—');
  const desName = id => (designations.find(d => d.id === id)?.name || '—');
  const empName = id => (employees.find(e => e.id === id)?.name || '—');
  const leaveBal = id => (leaveBalances[id] || { CL: 0, SL: 0, PL: 0 });

  return {
    // raw data
    employees,
    departments,
    designations,
    leaveBalances,
    leaveApplications,
    holidays,
    // state
    loading,
    error,
    reload: load,
    // helpers
    deptName,
    desName,
    empName,
    leaveBal,
  };
}
