import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import DashboardPage from './pages/Dashboard';
import PatientPage from './pages/Patients';
import AppointmentsPage from './pages/Appointments';
import MedicalActsPage from './pages/MedicalActs';
import AssistantPage from './pages/Assistant';
import AnalyticsPage from './pages/Analytics';
import NotificationsPage from './pages/Notifications';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/patients" element={<PatientPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/medical-acts" element={<MedicalActsPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
