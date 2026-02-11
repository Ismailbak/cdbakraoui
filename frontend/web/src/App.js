import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/common';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import DashboardPage from './pages/Dashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminAnalytics from './pages/Admin/AdminAnalytics';
import AdminSecurity from './pages/Admin/AdminSecurity';
import AdminSettings from './pages/Admin/AdminSettings';
import PatientPage from './pages/Patients';
import PatientDetailPage from './pages/Patients/PatientDetailPage';
import AppointmentsPage from './pages/Appointments';
import MedicalActsPage from './pages/MedicalActs';
import AssistantPage from './pages/Assistant';
import AnalyticsPage from './pages/Analytics';
import NotificationsPage from './pages/Notifications';
import ProfilePage from './pages/Profile';
import { TermsPage, PrivacyPage } from './pages/Legal';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/security" element={<AdminSecurity />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/patients" element={<PatientPage />} />
        <Route path="/patients/:id" element={<PatientDetailPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/medical-acts" element={<MedicalActsPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
