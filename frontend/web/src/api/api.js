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

// Auth
export const login = (username, password) =>
  api.post('/auth/login', new URLSearchParams({ username, password }));

// Patients
export const getPatients = () => api.get('/patients/');
export const getPatient = (id) => api.get(`/patients/${id}`);
export const createPatient = (data) => api.post('/patients/', data);
export const updatePatient = (id, data) => api.put(`/patients/${id}`, data);
export const deletePatient = (id) => api.delete(`/patients/${id}`);

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

// Chat
export const sendChatMessage = (message, patientId) =>
  api.post('/chat/', { message, patient_id: patientId });

// Analytics & Notifications
export const getAnalyticsSummary = () => api.get('/analytics/summary');
export const getNotifications = () => api.get('/notifications/');
export const markNotificationRead = (id) => api.post(`/notifications/read/${id}`);

export default api;
