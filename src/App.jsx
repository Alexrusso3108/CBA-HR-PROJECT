import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import LeaveManagement from './pages/LeaveManagement';
import Goals from './pages/Goals';
import PerformanceReview from './pages/PerformanceReview';
import Directory from './pages/Directory';
import Announcements from './pages/Announcements';
import Holidays from './pages/Holidays';

// Manager
import TeamLeaves from './pages/manager/TeamLeaves';
import TeamPerformance from './pages/manager/TeamPerformance';
import TeamDashboard from './pages/manager/TeamDashboard';

// HR
import HRDashboard from './pages/hr/HRDashboard';
import HRLeaveOversight from './pages/hr/HRLeaveOversight';
import HREmployees from './pages/hr/HREmployees';
import HRPerformance from './pages/hr/HRPerformance';
import HRReports from './pages/hr/HRReports';

// Admin
import EmployeeManagement from './pages/admin/EmployeeManagement';
import LeaveAdmin from './pages/admin/LeaveAdmin';
import SystemConfig from './pages/admin/SystemConfig';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

      {/* Common */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/leaves" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
      <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
      <Route path="/performance" element={<ProtectedRoute><PerformanceReview /></ProtectedRoute>} />
      <Route path="/directory" element={<ProtectedRoute><Directory /></ProtectedRoute>} />
      <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
      <Route path="/holidays" element={<ProtectedRoute><Holidays /></ProtectedRoute>} />

      {/* Manager */}
      <Route path="/team-leaves" element={<ProtectedRoute roles={['manager', 'admin']}><TeamLeaves /></ProtectedRoute>} />
      <Route path="/team-performance" element={<ProtectedRoute roles={['manager', 'admin']}><TeamPerformance /></ProtectedRoute>} />
      <Route path="/team-dashboard" element={<ProtectedRoute roles={['manager', 'admin']}><TeamDashboard /></ProtectedRoute>} />

      {/* HR */}
      <Route path="/hr/dashboard" element={<ProtectedRoute roles={['hr', 'admin']}><HRDashboard /></ProtectedRoute>} />
      <Route path="/hr/leaves" element={<ProtectedRoute roles={['hr', 'admin']}><HRLeaveOversight /></ProtectedRoute>} />
      <Route path="/hr/employees" element={<ProtectedRoute roles={['hr', 'admin']}><HREmployees /></ProtectedRoute>} />
      <Route path="/hr/performance" element={<ProtectedRoute roles={['hr', 'admin']}><HRPerformance /></ProtectedRoute>} />
      <Route path="/hr/reports" element={<ProtectedRoute roles={['hr', 'admin']}><HRReports /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/employees" element={<ProtectedRoute roles={['admin']}><EmployeeManagement /></ProtectedRoute>} />
      <Route path="/admin/leaves" element={<ProtectedRoute roles={['admin']}><LeaveAdmin /></ProtectedRoute>} />
      <Route path="/admin/config" element={<ProtectedRoute roles={['admin']}><SystemConfig /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
