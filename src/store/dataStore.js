// Rev Workforce - Data Store API adapter
// This file preserves the original synchronous function signatures used across the UI
// by calling the NestJS backend using synchronous XHR requests.
//
// Configure backend base URL with Vite env var:
//   VITE_API_BASE_URL=http://localhost:3000/api

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:3000/api';

function request(method, path, body) {
  const url = `${API_BASE}${path}`;
  const xhr = new XMLHttpRequest();
  xhr.open(method, url, false); // sync
  xhr.setRequestHeader('Content-Type', 'application/json');
  try {
    xhr.send(body === undefined ? null : JSON.stringify(body));
  } catch {
    throw new Error(`Backend not reachable at ${API_BASE}`);
  }
  const text = xhr.responseText || '';
  if (xhr.status >= 200 && xhr.status < 300) {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  let msg = text;
  try {
    const parsed = JSON.parse(text);
    msg = parsed?.message || parsed?.error || text;
  } catch {
    // ignore
  }
  throw new Error(`${method} ${url} failed (${xhr.status}): ${msg}`);
}

// ---- Auth ----
export function login(employeeIdOrEmail, password) {
  return request('POST', '/auth/login', { employeeIdOrEmail, password });
}

export function changePassword(employeeId, currentPassword, newPassword) {
  return request('POST', '/auth/change-password', { employeeId, currentPassword, newPassword });
}

// ---- Employees ----
export function getEmployees() {
  return request('GET', '/employees') || [];
}

export function getEmployee(id) {
  return request('GET', `/employees/${encodeURIComponent(id)}`);
}

export function addEmployee(data) {
  return request('POST', '/employees', data);
}

export function updateEmployee(id, updates) {
  return request('PUT', `/employees/${encodeURIComponent(id)}`, updates);
}

export function deactivateEmployee(id) {
  return request('POST', `/employees/${encodeURIComponent(id)}/deactivate`);
}

export function reactivateEmployee(id) {
  return request('POST', `/employees/${encodeURIComponent(id)}/reactivate`);
}

export function getTeamMembers(managerId) {
  return request('GET', `/managers/${encodeURIComponent(managerId)}/team`) || [];
}

// ---- Departments & Designations ----
export function getDepartments() {
  return request('GET', '/departments') || [];
}

export function getDesignations() {
  return request('GET', '/designations') || [];
}

export function addDepartment(name) {
  return request('POST', '/departments', { name });
}

export function addDesignation(name, deptId) {
  return request('POST', '/designations', { name, deptId });
}

// ---- Leave Balances ----
export function getLeaveBalance(employeeId) {
  return request('GET', `/leave/balances/${encodeURIComponent(employeeId)}`) || { CL: 0, SL: 0, PL: 0 };
}

export function updateLeaveBalance(employeeId, type, delta) {
  request('POST', `/leave/balances/${encodeURIComponent(employeeId)}/update`, { type, delta });
}

export function setLeaveBalance(employeeId, balances) {
  request('POST', `/leave/balances/${encodeURIComponent(employeeId)}/set`, balances);
}

// ---- Leave Applications ----
export function getLeaveApplications(filters = {}) {
  const params = new URLSearchParams();
  if (filters.employeeId) params.set('employeeId', filters.employeeId);
  if (filters.status) params.set('status', filters.status);
  if (filters.teamIds) params.set('teamIds', filters.teamIds.join(','));
  const qs = params.toString() ? `?${params.toString()}` : '';
  return request('GET', `/leave/applications${qs}`) || [];
}

export function applyLeave(data) {
  return request('POST', '/leave/applications', data);
}

export function cancelLeave(leaveId, employeeId) {
  const res = request('POST', `/leave/applications/${encodeURIComponent(leaveId)}/cancel`, { employeeId });
  return !!res?.success;
}

export function reviewLeave(leaveId, status, comment) {
  return request('POST', `/leave/applications/${encodeURIComponent(leaveId)}/review`, { status, comment });
}

export function revokeLeave(leaveId, reason) {
  return request('POST', `/leave/applications/${encodeURIComponent(leaveId)}/revoke`, { reason });
}

// ---- Holidays ----
export function getHolidays() {
  return request('GET', '/holidays') || [];
}

export function addHoliday(data) {
  return request('POST', '/holidays', data);
}

export function removeHoliday(id) {
  request('DELETE', `/holidays/${encodeURIComponent(id)}`);
}

// ---- Performance Reviews ----
export function getPerformanceReviews(filters = {}) {
  const params = new URLSearchParams();
  if (filters.employeeId) params.set('employeeId', filters.employeeId);
  if (filters.year) params.set('year', String(filters.year));
  if (filters.teamIds) params.set('teamIds', filters.teamIds.join(','));
  const qs = params.toString() ? `?${params.toString()}` : '';
  return request('GET', `/reviews${qs}`) || [];
}

export function submitPerformanceReview(data) {
  return request('POST', '/reviews/submit', data);
}

export function submitManagerReview(reviewId, feedback, rating) {
  return request('POST', `/reviews/${encodeURIComponent(reviewId)}/manager`, { feedback, rating });
}

// ---- Goals ----
export function getGoals(filters = {}) {
  const params = new URLSearchParams();
  if (filters.employeeId) params.set('employeeId', filters.employeeId);
  if (filters.year) params.set('year', String(filters.year));
  if (filters.teamIds) params.set('teamIds', filters.teamIds.join(','));
  const qs = params.toString() ? `?${params.toString()}` : '';
  return request('GET', `/goals${qs}`) || [];
}

export function addGoal(data) {
  return request('POST', '/goals', data);
}

export function updateGoal(id, updates) {
  return request('PUT', `/goals/${encodeURIComponent(id)}`, updates);
}

export function deleteGoal(id) {
  request('DELETE', `/goals/${encodeURIComponent(id)}`);
}

// ---- Notifications ----
export function getNotifications(userId) {
  return request('GET', `/notifications/${encodeURIComponent(userId)}`) || [];
}

export function addNotification(userId, type, message) {
  // Server generates notifications internally; keep as a no-op to preserve old API.
  // If you want a public endpoint later, we can add it.
  void userId;
  void type;
  void message;
}

export function ensurePersonalCelebrationNotifications(employeeId) {
  request('POST', `/notifications/${encodeURIComponent(employeeId)}/ensure-celebrations`);
}

export function markNotificationRead(id) {
  request('POST', `/notifications/${encodeURIComponent(id)}/read`);
}

export function markAllNotificationsRead(userId) {
  request('POST', `/notifications/${encodeURIComponent(userId)}/read-all`);
}

// ---- Announcements ----
export function getAnnouncements() {
  return request('GET', '/announcements') || [];
}

export function addAnnouncement(data) {
  return request('POST', '/announcements', data);
}

export function removeAnnouncement(id) {
  request('DELETE', `/announcements/${encodeURIComponent(id)}`);
}

// ---- Performance Review Configuration ----
export function getReviewConfig() {
  return request('GET', '/review-config');
}

export function setActiveReviewYear(year) {
  return request('POST', '/review-config/active-year', { year });
}

// ---- Utility ----
export function resetData() {
  request('POST', '/admin/reset-data');
}

