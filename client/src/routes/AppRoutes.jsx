import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Pages
import SignInPage from '../pages/SignInPage';
import SignUpPage from '../pages/SignUpPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import AttendancePage from '../pages/AttendancePage';
import LeavePage from '../pages/LeavePage';
import PayrollPage from '../pages/PayrollPage';
import EmployeeListPage from '../pages/EmployeeListPage';
import EmployeeDetailPage from '../pages/EmployeeDetailPage';
import SettingsPage from '../pages/SettingsPage';
import ChangePasswordPage from '../pages/ChangePasswordPage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>

      {/* Protected app shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/leave" element={<LeavePage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Admin-only */}
          <Route element={<AdminRoute />}>
            <Route path="/onboarding/new-employee" element={<SignUpPage />} />
            <Route path="/employees" element={<EmployeeListPage />} />
            <Route path="/employees/:id" element={<EmployeeDetailPage />} />
            <Route path="/payroll" element={<PayrollPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
