import React, { useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './components/common';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import DashboardPage from './pages/Dashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminAnalytics from './pages/Admin/AdminAnalytics';
import AdminSecurity from './pages/Admin/AdminSecurity';
import AdminSettings from './pages/Admin/AdminSettings';
import AdminUserDetail from './pages/Admin/AdminUserDetail';
import FormBuilder from './pages/Admin/FormBuilder';
import PatientPage from './pages/Patients';
import PatientDetailPage from './pages/Patients/PatientDetailPage';
import AppointmentsPage from './pages/Appointments';
import MedicalActsPage from './pages/MedicalActs';
import AssistantPage from './pages/Assistant';
import ChatPage from './pages/Chat/ChatPage';
import AnalyticsPage from './pages/Analytics';
import NotificationsPage from './pages/Notifications';
import ProfilePage from './pages/Profile';
import { TermsPage, PrivacyPage } from './pages/Legal';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function InactivityGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef(null);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  }, [navigate]);

  const resetTimer = useCallback(() => {
    if (!localStorage.getItem('token')) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logout, INACTIVITY_TIMEOUT);
  }, [logout]);

  useEffect(() => {
    // Skip on public pages
    if (location.pathname === '/' || location.pathname === '/signup') return;
    if (!localStorage.getItem('token')) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [location.pathname, resetTimer]);

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
      <InactivityGuard>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/:id" element={<AdminUserDetail />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/security" element={<AdminSecurity />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/form-builder" element={<FormBuilder />} />
        <Route path="/patients" element={<PatientPage />} />
        <Route path="/patients/:id" element={<PatientDetailPage />} />
        <Route path="/patients/:patientId/chat" element={<ChatPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/medical-acts" element={<MedicalActsPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Routes>
      </InactivityGuard>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
