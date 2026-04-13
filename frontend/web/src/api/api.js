import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (username, password) =>
  api.post('/auth/login', new URLSearchParams({ username, password }));

export const getCurrentUser = () => api.get('/auth/me');

// Patients
export const getPatients = () => api.get('/patients/');
export const getPatient = (id) => api.get(`/patients/${id}`);
export const createPatient = (data) => api.post('/patients/', data);
export const updatePatient = (id, data) => api.put(`/patients/${id}`, data);
export const deletePatient = (id) => api.delete(`/patients/${id}`);
export const exportPatientDossier = (id) => api.get(`/patients/${id}/dossier`, { responseType: 'blob' });

// Patient Allergies
export const getPatientAllergies = (patientId) => api.get(`/patients/${patientId}/allergies`);
export const createPatientAllergy = (patientId, data) => api.post(`/patients/${patientId}/allergies`, data);
export const updatePatientAllergy = (patientId, allergyId, data) => api.put(`/patients/${patientId}/allergies/${allergyId}`, data);
export const deletePatientAllergy = (patientId, allergyId) => api.delete(`/patients/${patientId}/allergies/${allergyId}`);

// Appointments
export const getAppointments = () => api.get('/appointments/');
export const getAppointment = (id) => api.get(`/appointments/${id}`);
export const createAppointment = (data) => api.post('/appointments/', data);
export const updateAppointment = (id, data) => api.put(`/appointments/${id}`, data);
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`);
export const getTodayAppointments = () => api.get('/appointments/today');
export const getPatientAppointments = (patientId) => api.get(`/appointments/patient/${patientId}`);

// Medical Acts
export const getMedicalActs = () => api.get('/medical-acts/');
export const getMedicalAct = (id) => api.get(`/medical-acts/${id}`);
export const createMedicalAct = (data) => api.post('/medical-acts/', data);
export const updateMedicalAct = (id, data) => api.put(`/medical-acts/${id}`, data);
export const deleteMedicalAct = (id) => api.delete(`/medical-acts/${id}`);
export const getPatientMedicalActs = (patientId) => api.get(`/medical-acts/patient/${patientId}`);
export const getMedicalActTypes = () => api.get('/medical-acts/types');
export const uploadMedicalActDocument = (actId, formData) =>
  api.post(`/medical-acts/${actId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const downloadMedicalActDocument = (actId, docId) =>
  api.get(`/medical-acts/${actId}/documents/${docId}/download`, { responseType: 'blob' });
export const getMedicalActPdf = (actId) =>
  api.get(`/medical-acts/${actId}/pdf`, { responseType: 'blob' });

// Act Results (Lab Tests)
export const getActResults = (actId) => api.get(`/act-results/act/${actId}`);
export const getPatientResults = (patientId) => api.get(`/act-results/patient/${patientId}`);
export const getActResult = (resultId) => api.get(`/act-results/${resultId}`);
export const createActResult = (data) => api.post('/act-results/', data);
export const updateActResult = (resultId, data) => api.put(`/act-results/${resultId}`, data);
export const deleteActResult = (resultId) => api.delete(`/act-results/${resultId}`);

// Chat
export const sendChatMessage = (message, userId, patientId = null, language = 'fr') =>
  api.post('/chat/', { message, patient_id: patientId, language });

export const getChatHistory = (patientId = null, limit = 50) => {
  const params = new URLSearchParams({ limit });
  if (patientId) params.append('patient_id', patientId);
  return api.get(`/chat/history?${params.toString()}`);
};

// Analytics & Notifications
export const getAnalyticsSummary = () => api.get('/analytics/summary');
export const getRecentActivity = () => api.get('/analytics/recent-activity');
export const getNotifications = () => api.get('/notifications/');
export const createNotification = (data) => api.post('/notifications/', data);
export const markNotificationRead = (id) => api.post(`/notifications/read/${id}`);

export const getMedicalActsStats = () => api.get('/medical-acts/stats');

// admin dashbaord
export const getAuditLogs = (limit = 50, skip = 0, filters = {}) => {
  const params = new URLSearchParams({ limit, skip });
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.action) params.append('action', filters.action);
  if (filters.username) params.append('username', filters.username);
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);
  return api.get(`/analytics/audit-logs?${params.toString()}`);
};

export const exportAuditLogsCsv = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.action) params.append('action', filters.action);
  if (filters.username) params.append('username', filters.username);
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);
  return api.get(`/analytics/audit-logs/export?${params.toString()}`, { responseType: 'blob' });
};

export const getAdminStats = () => api.get('/analytics/admin-stats');
export const getAdminUsers = () => api.get('/auth/users');
export const getDoctors = () => api.get('/auth/doctors');
export const toggleUserStatus = (userId) => api.patch(`/auth/users/${userId}/toggle`);
export const createUser = (data) => api.post('/auth/signup', data);
export const updateUser = (userId, data) => api.put(`/auth/users/${userId}`, data);
export const deleteUser = (userId) => api.delete(`/auth/users/${userId}`);
export const resetUserPassword = (userId, newPassword) =>
  api.post(`/auth/users/${userId}/reset-password`, { new_password: newPassword });
export const getUserDetail = (userId) => api.get(`/auth/users/${userId}`);

// Settings
export const getSettings = () => api.get('/analytics/settings');
export const saveSettings = (data) => api.put('/analytics/settings', data);

// System health
export const getSystemHealth = () => api.get('/analytics/system-health');

// Broadcast notification
export const broadcastNotification = (title, message) =>
  api.post('/analytics/broadcast', { title, message });

export default api;
