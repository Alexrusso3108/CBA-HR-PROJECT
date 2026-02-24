// Rev Workforce - Central Data Store
// Simulates a backend database with localStorage persistence

const initialData = {
  departments: [
    { id: 'dept-1', name: 'Engineering' },
    { id: 'dept-2', name: 'Human Resources' },
    { id: 'dept-3', name: 'Finance' },
    { id: 'dept-4', name: 'Marketing' },
    { id: 'dept-5', name: 'Operations' },
    { id: 'dept-6', name: 'Product' },
  ],
  designations: [
    { id: 'des-1', name: 'Software Engineer', deptId: 'dept-1' },
    { id: 'des-2', name: 'Senior Software Engineer', deptId: 'dept-1' },
    { id: 'des-3', name: 'Engineering Manager', deptId: 'dept-1' },
    { id: 'des-4', name: 'HR Executive', deptId: 'dept-2' },
    { id: 'des-5', name: 'HR Manager', deptId: 'dept-2' },
    { id: 'des-6', name: 'Finance Analyst', deptId: 'dept-3' },
    { id: 'des-7', name: 'Marketing Specialist', deptId: 'dept-4' },
    { id: 'des-8', name: 'Operations Lead', deptId: 'dept-5' },
    { id: 'des-9', name: 'Product Manager', deptId: 'dept-6' },
    { id: 'des-10', name: 'Admin', deptId: 'dept-2' },
  ],
  employees: [
    {
      id: 'EMP001',
      name: 'Admin User',
      email: 'admin@revworkforce.com',
      password: 'admin123',
      phone: '9876543210',
      address: '1 Corporate Tower, Bangalore',
      dob: '1985-03-15',
      joiningDate: '2018-01-01',
      departmentId: 'dept-2',
      designationId: 'des-10',
      managerId: null,
      role: 'admin',
      salary: 150000,
      status: 'active',
      emergencyContact: '9876543211',
      avatar: 'AU',
    },
    {
      id: 'EMP002',
      name: 'Sarah Mitchell',
      email: 'sarah.mitchell@revworkforce.com',
      password: 'password123',
      phone: '9876543212',
      address: '23 MG Road, Bangalore',
      dob: '1988-07-22',
      joiningDate: '2020-03-15',
      departmentId: 'dept-1',
      designationId: 'des-3',
      managerId: 'EMP001',
      role: 'manager',
      salary: 120000,
      status: 'active',
      emergencyContact: '9876543213',
      avatar: 'SM',
    },
    {
      id: 'EMP003',
      name: 'James Carter',
      email: 'james.carter@revworkforce.com',
      password: 'password123',
      phone: '9876543214',
      address: '45 Whitefield, Bangalore',
      dob: '1992-11-08',
      joiningDate: '2021-06-01',
      departmentId: 'dept-1',
      designationId: 'des-1',
      managerId: 'EMP002',
      role: 'employee',
      salary: 75000,
      status: 'active',
      emergencyContact: '9876543215',
      avatar: 'JC',
    },
    {
      id: 'EMP004',
      name: 'Priya Sharma',
      email: 'priya.sharma@revworkforce.com',
      password: 'password123',
      phone: '9876543216',
      address: '67 Koramangala, Bangalore',
      dob: '1994-02-14',
      joiningDate: '2022-01-10',
      departmentId: 'dept-1',
      designationId: 'des-2',
      managerId: 'EMP002',
      role: 'employee',
      salary: 95000,
      status: 'active',
      emergencyContact: '9876543217',
      avatar: 'PS',
    },
    {
      id: 'EMP005',
      name: 'Rahul Verma',
      email: 'rahul.verma@revworkforce.com',
      password: 'password123',
      phone: '9876543218',
      address: '89 HSR Layout, Bangalore',
      dob: '1990-05-30',
      joiningDate: '2019-08-20',
      departmentId: 'dept-4',
      designationId: 'des-7',
      managerId: null,
      role: 'employee',
      salary: 65000,
      status: 'active',
      emergencyContact: '9876543219',
      avatar: 'RV',
    },
    {
      id: 'EMP006',
      name: 'Lisa Wang',
      email: 'lisa.wang@revworkforce.com',
      password: 'password123',
      phone: '9876543220',
      address: '12 Indiranagar, Bangalore',
      dob: '1991-09-19',
      joiningDate: '2021-11-01',
      departmentId: 'dept-3',
      designationId: 'des-6',
      managerId: 'EMP001',
      role: 'employee',
      salary: 80000,
      status: 'active',
      emergencyContact: '9876543221',
      avatar: 'LW',
    },
    {
      id: 'EMP007',
      name: 'Ananya Nair',
      email: 'ananya.nair@revworkforce.com',
      password: 'hr@1234',
      phone: '9876543222',
      address: '34 Sadashivanagar, Bangalore',
      dob: '1989-06-12',
      joiningDate: '2019-04-01',
      departmentId: 'dept-2',
      designationId: 'des-5',
      managerId: 'EMP001',
      role: 'hr',
      salary: 110000,
      status: 'active',
      emergencyContact: '9876543223',
      avatar: 'AN',
    },
  ],
  leaveBalances: {
    EMP002: { CL: 12, SL: 10, PL: 15 },
    EMP003: { CL: 10, SL: 8, PL: 12 },
    EMP004: { CL: 11, SL: 9, PL: 13 },
    EMP005: { CL: 12, SL: 10, PL: 15 },
    EMP006: { CL: 9, SL: 7, PL: 11 },
    EMP007: { CL: 12, SL: 10, PL: 15 },
  },
  leaveApplications: [
    {
      id: 'LEAVE001',
      employeeId: 'EMP003',
      type: 'CL',
      fromDate: '2026-03-10',
      toDate: '2026-03-12',
      reason: 'Personal work',
      status: 'approved',
      managerComment: 'Approved. Enjoy!',
      appliedOn: '2026-03-01',
    },
    {
      id: 'LEAVE002',
      employeeId: 'EMP004',
      type: 'SL',
      fromDate: '2026-02-20',
      toDate: '2026-02-21',
      reason: 'Fever and flu',
      status: 'approved',
      managerComment: 'Take care!',
      appliedOn: '2026-02-19',
    },
    {
      id: 'LEAVE003',
      employeeId: 'EMP003',
      type: 'PL',
      fromDate: '2026-04-01',
      toDate: '2026-04-05',
      reason: 'Family vacation',
      status: 'pending',
      managerComment: '',
      appliedOn: '2026-03-15',
    },
  ],
  holidays: [
    { id: 'HOL001', name: 'Republic Day', date: '2026-01-26', type: 'national' },
    { id: 'HOL002', name: 'Holi', date: '2026-03-25', type: 'festival' },
    { id: 'HOL003', name: 'Good Friday', date: '2026-04-03', type: 'national' },
    { id: 'HOL004', name: 'Eid ul-Fitr', date: '2026-03-31', type: 'festival' },
    { id: 'HOL005', name: 'Independence Day', date: '2026-08-15', type: 'national' },
    { id: 'HOL006', name: 'Gandhi Jayanti', date: '2026-10-02', type: 'national' },
    { id: 'HOL007', name: 'Diwali', date: '2026-10-20', type: 'festival' },
    { id: 'HOL008', name: 'Christmas', date: '2026-12-25', type: 'national' },
  ],
  performanceReviews: [
    {
      id: 'PR001',
      employeeId: 'EMP003',
      year: 2025,
      status: 'reviewed',
      deliverables: 'Delivered the API gateway migration on time. Completed 3 major feature modules.',
      accomplishments: 'Reduced API latency by 40%. Mentored 2 junior developers.',
      improvements: 'Need to improve documentation practices and cross-team communication.',
      selfRating: 4,
      managerFeedback: 'James has shown excellent technical growth this year. Continue to improve soft skills.',
      managerRating: 4,
      submittedOn: '2026-01-10',
      reviewedOn: '2026-01-20',
    },
    {
      id: 'PR002',
      employeeId: 'EMP004',
      year: 2025,
      status: 'submitted',
      deliverables: 'Led the frontend rebuild using React. Delivered the design system.',
      accomplishments: 'Improved page load speed by 60%. Introduced component storybook.',
      improvements: 'Improve backend knowledge and DevOps familiarity.',
      selfRating: 5,
      managerFeedback: '',
      managerRating: null,
      submittedOn: '2026-01-12',
      reviewedOn: null,
    },
  ],
  goals: [
    {
      id: 'GOAL001',
      employeeId: 'EMP003',
      description: 'Complete AWS Solutions Architect certification',
      deadline: '2026-06-30',
      priority: 'high',
      successMetrics: 'Pass the SAA-C03 exam with 80%+ score',
      progress: 60,
      status: 'in_progress',
      year: 2026,
    },
    {
      id: 'GOAL002',
      employeeId: 'EMP003',
      description: 'Lead the microservices migration project',
      deadline: '2026-09-30',
      priority: 'high',
      successMetrics: 'Migrate 5 core services to microservices architecture',
      progress: 20,
      status: 'in_progress',
      year: 2026,
    },
    {
      id: 'GOAL003',
      employeeId: 'EMP004',
      description: 'Launch the new design system v2.0',
      deadline: '2026-05-31',
      priority: 'medium',
      successMetrics: 'All 50+ components documented and published to npm',
      progress: 75,
      status: 'in_progress',
      year: 2026,
    },
  ],
  notifications: [
    {
      id: 'NOTIF001',
      userId: 'EMP003',
      type: 'leave_approved',
      message: 'Your Casual Leave application (Mar 10-12) has been approved.',
      read: false,
      createdAt: '2026-03-02T10:30:00Z',
    },
    {
      id: 'NOTIF002',
      userId: 'EMP002',
      type: 'leave_applied',
      message: 'James Carter has applied for Paid Leave (Apr 1-5). Action required.',
      read: false,
      createdAt: '2026-03-15T09:00:00Z',
    },
    {
      id: 'NOTIF003',
      userId: 'EMP002',
      type: 'review_submitted',
      message: 'Priya Sharma has submitted her 2025 Performance Review.',
      read: false,
      createdAt: '2026-01-12T14:00:00Z',
    },
    {
      id: 'NOTIF004',
      userId: 'EMP004',
      type: 'review_feedback',
      message: 'Your 2025 Performance Review is pending manager feedback.',
      read: false,
      createdAt: '2026-01-13T08:00:00Z',
    },
  ],
  announcements: [
    {
      id: 'ANN001',
      title: 'Office Renovation - Floor 3 Closed',
      content: 'Floor 3 will be closed for renovation from March 20-25. Please work from floors 1 or 2.',
      date: '2026-03-10',
      priority: 'high',
    },
    {
      id: 'ANN002',
      title: 'Q1 2026 All Hands Meeting',
      content: 'Join us for the Q1 All Hands Meeting on March 28th at 3 PM in the main auditorium.',
      date: '2026-03-05',
      priority: 'medium',
    },
    {
      id: 'ANN003',
      title: 'New Health Insurance Benefits',
      content: 'Enhanced health coverage is now available. Check the HR portal for details and enrollment.',
      date: '2026-02-28',
      priority: 'low',
    },
  ],
};

const STORAGE_KEY = 'rev_workforce_data_v2';

function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { }
  return JSON.parse(JSON.stringify(initialData));
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let store = loadData();

function persist() {
  saveData(store);
}

// ---- Auth ----
export function login(employeeIdOrEmail, password) {
  const emp = store.employees.find(
    (e) =>
      (e.id === employeeIdOrEmail || e.email === employeeIdOrEmail) &&
      e.password === password &&
      e.status === 'active'
  );
  if (!emp) return null;
  return { ...emp };
}

export function changePassword(employeeId, currentPassword, newPassword) {
  const idx = store.employees.findIndex((e) => e.id === employeeId && e.password === currentPassword);
  if (idx === -1) return { success: false, message: 'Current password is incorrect.' };
  store.employees[idx].password = newPassword;
  persist();
  return { success: true };
}

// ---- Employees ----
export function getEmployees() {
  return store.employees.map((e) => ({ ...e }));
}

export function getEmployee(id) {
  const emp = store.employees.find((e) => e.id === id);
  return emp ? { ...emp } : null;
}

export function addEmployee(data) {
  const newEmp = {
    ...data,
    id: 'EMP' + String(Date.now()).slice(-6),
    status: 'active',
    avatar: data.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
  };
  store.employees.push(newEmp);
  store.leaveBalances[newEmp.id] = { CL: 12, SL: 10, PL: 15 };
  persist();
  return { ...newEmp };
}

export function updateEmployee(id, updates) {
  const idx = store.employees.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  store.employees[idx] = { ...store.employees[idx], ...updates };
  persist();
  return { ...store.employees[idx] };
}

export function deactivateEmployee(id) {
  return updateEmployee(id, { status: 'inactive' });
}

export function reactivateEmployee(id) {
  return updateEmployee(id, { status: 'active' });
}

export function getTeamMembers(managerId) {
  return store.employees.filter((e) => e.managerId === managerId).map((e) => ({ ...e }));
}

// ---- Departments & Designations ----
export function getDepartments() {
  return [...store.departments];
}

export function getDesignations() {
  return [...store.designations];
}

export function addDepartment(name) {
  const dept = { id: 'dept-' + Date.now(), name };
  store.departments.push(dept);
  persist();
  return dept;
}

export function addDesignation(name, deptId) {
  const des = { id: 'des-' + Date.now(), name, deptId };
  store.designations.push(des);
  persist();
  return des;
}

// ---- Leave Balances ----
export function getLeaveBalance(employeeId) {
  return store.leaveBalances[employeeId] || { CL: 0, SL: 0, PL: 0 };
}

export function updateLeaveBalance(employeeId, type, delta) {
  if (!store.leaveBalances[employeeId]) store.leaveBalances[employeeId] = { CL: 0, SL: 0, PL: 0 };
  store.leaveBalances[employeeId][type] = Math.max(0, (store.leaveBalances[employeeId][type] || 0) + delta);
  persist();
}

export function setLeaveBalance(employeeId, balances) {
  store.leaveBalances[employeeId] = { ...balances };
  persist();
}

// ---- Leave Applications ----
export function getLeaveApplications(filters = {}) {
  let apps = store.leaveApplications.map((a) => ({ ...a }));
  if (filters.employeeId) apps = apps.filter((a) => a.employeeId === filters.employeeId);
  if (filters.status) apps = apps.filter((a) => a.status === filters.status);
  if (filters.teamIds) apps = apps.filter((a) => filters.teamIds.includes(a.employeeId));
  return apps.sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));
}

export function applyLeave(data) {
  const app = {
    ...data,
    id: 'LEAVE' + String(Date.now()).slice(-6),
    status: 'pending',
    managerComment: '',
    appliedOn: new Date().toISOString().split('T')[0],
  };
  store.leaveApplications.push(app);
  // Notify manager
  const emp = getEmployee(data.employeeId);
  if (emp && emp.managerId) {
    addNotification(emp.managerId, 'leave_applied', `${emp.name} has applied for ${data.type} leave (${data.fromDate} to ${data.toDate}). Action required.`);
  }
  persist();
  return { ...app };
}

export function cancelLeave(leaveId, employeeId) {
  const idx = store.leaveApplications.findIndex((a) => a.id === leaveId && a.employeeId === employeeId && a.status === 'pending');
  if (idx === -1) return false;
  store.leaveApplications.splice(idx, 1);
  persist();
  return true;
}

export function reviewLeave(leaveId, status, comment) {
  const idx = store.leaveApplications.findIndex((a) => a.id === leaveId);
  if (idx === -1) return null;
  const app = store.leaveApplications[idx];
  app.status = status;
  app.managerComment = comment;
  // Notify employee
  const action = status === 'approved' ? 'approved' : 'rejected';
  addNotification(app.employeeId, `leave_${action}`, `Your ${app.type} leave application (${app.fromDate} to ${app.toDate}) has been ${action}. ${comment ? 'Comment: ' + comment : ''}`);
  persist();
  return { ...app };
}

// ---- Holidays ----
export function getHolidays() {
  return [...store.holidays].sort((a, b) => new Date(a.date) - new Date(b.date));
}

export function addHoliday(data) {
  const hol = { ...data, id: 'HOL' + Date.now() };
  store.holidays.push(hol);
  persist();
  return hol;
}

export function removeHoliday(id) {
  store.holidays = store.holidays.filter((h) => h.id !== id);
  persist();
}

// ---- Performance Reviews ----
export function getPerformanceReviews(filters = {}) {
  let reviews = store.performanceReviews.map((r) => ({ ...r }));
  if (filters.employeeId) reviews = reviews.filter((r) => r.employeeId === filters.employeeId);
  if (filters.year) reviews = reviews.filter((r) => r.year === filters.year);
  if (filters.teamIds) reviews = reviews.filter((r) => filters.teamIds.includes(r.employeeId));
  return reviews;
}

export function submitPerformanceReview(data) {
  const existing = store.performanceReviews.find((r) => r.employeeId === data.employeeId && r.year === data.year);
  if (existing) {
    Object.assign(existing, data, { status: 'submitted', submittedOn: new Date().toISOString().split('T')[0] });
    const emp = getEmployee(data.employeeId);
    if (emp && emp.managerId) {
      addNotification(emp.managerId, 'review_submitted', `${emp.name} has submitted their ${data.year} Performance Review.`);
    }
    persist();
    return { ...existing };
  }
  const review = {
    ...data,
    id: 'PR' + Date.now(),
    status: 'submitted',
    managerFeedback: '',
    managerRating: null,
    submittedOn: new Date().toISOString().split('T')[0],
    reviewedOn: null,
  };
  store.performanceReviews.push(review);
  const emp = getEmployee(data.employeeId);
  if (emp && emp.managerId) {
    addNotification(emp.managerId, 'review_submitted', `${emp.name} has submitted their ${data.year} Performance Review.`);
  }
  persist();
  return { ...review };
}

export function submitManagerReview(reviewId, feedback, rating) {
  const idx = store.performanceReviews.findIndex((r) => r.id === reviewId);
  if (idx === -1) return null;
  store.performanceReviews[idx].managerFeedback = feedback;
  store.performanceReviews[idx].managerRating = rating;
  store.performanceReviews[idx].status = 'reviewed';
  store.performanceReviews[idx].reviewedOn = new Date().toISOString().split('T')[0];
  addNotification(store.performanceReviews[idx].employeeId, 'review_feedback', `Your manager has provided feedback on your ${store.performanceReviews[idx].year} Performance Review.`);
  persist();
  return { ...store.performanceReviews[idx] };
}

// ---- Goals ----
export function getGoals(filters = {}) {
  let goals = store.goals.map((g) => ({ ...g }));
  if (filters.employeeId) goals = goals.filter((g) => g.employeeId === filters.employeeId);
  if (filters.year) goals = goals.filter((g) => g.year === filters.year);
  if (filters.teamIds) goals = goals.filter((g) => filters.teamIds.includes(g.employeeId));
  return goals;
}

export function addGoal(data) {
  const goal = { ...data, id: 'GOAL' + Date.now(), status: 'in_progress', progress: 0 };
  store.goals.push(goal);
  persist();
  return { ...goal };
}

export function updateGoal(id, updates) {
  const idx = store.goals.findIndex((g) => g.id === id);
  if (idx === -1) return null;
  store.goals[idx] = { ...store.goals[idx], ...updates };
  if (store.goals[idx].progress >= 100) store.goals[idx].status = 'completed';
  persist();
  return { ...store.goals[idx] };
}

export function deleteGoal(id) {
  store.goals = store.goals.filter((g) => g.id !== id);
  persist();
}

// ---- Notifications ----
export function getNotifications(userId) {
  return store.notifications.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function addNotification(userId, type, message) {
  const notif = {
    id: 'NOTIF' + Date.now() + Math.random(),
    userId,
    type,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  };
  store.notifications.push(notif);
  persist();
}

export function markNotificationRead(id) {
  const notif = store.notifications.find((n) => n.id === id);
  if (notif) { notif.read = true; persist(); }
}

export function markAllNotificationsRead(userId) {
  store.notifications.filter((n) => n.userId === userId).forEach((n) => (n.read = true));
  persist();
}

// ---- Announcements ----
export function getAnnouncements() {
  return [...store.announcements].sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function addAnnouncement(data) {
  const ann = { ...data, id: 'ANN' + Date.now() };
  store.announcements.push(ann);
  persist();
  return ann;
}

export function removeAnnouncement(id) {
  store.announcements = store.announcements.filter((a) => a.id !== id);
  persist();
}

// ---- Utility ----
export function resetData() {
  store = JSON.parse(JSON.stringify(initialData));
  persist();
}
