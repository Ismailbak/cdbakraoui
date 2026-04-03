import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.199:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ────────────────────────────────────────────────────────────────────
export const login = (username, password) =>
  api.post('/auth/login', new URLSearchParams({ username, password }));

// ─── Patients ────────────────────────────────────────────────────────────────
export const getPatients = (q) =>
  api.get('/patients/', { params: q ? { q } : {} });
export const getPatient = (id) => api.get(`/patients/${id}`);
export const getPatientDossierPdf = (id) =>
  api.get(`/patients/${id}/dossier`, { responseType: 'arraybuffer' });

// ─── Appointments ────────────────────────────────────────────────────────────
export const getAppointments = () => api.get('/appointments/');
export const getTodayAppointments = () => api.get('/appointments/today');
export const getPatientAppointments = (patientId) =>
  api.get(`/appointments/patient/${patientId}`);
export const createAppointment = (data) => api.post('/appointments/', data);
export const updateAppointment = (id, data) =>
  api.put(`/appointments/${id}`, data);
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`);

// ─── Medical Acts ────────────────────────────────────────────────────────────
export const getMedicalActs = (params) =>
  api.get('/medical-acts/', { params });
export const getMedicalActTypes = () => api.get('/medical-acts/types');
export const getPatientMedicalActs = (patientId) =>
  api.get(`/medical-acts/patient/${patientId}`);
export const createMedicalAct = (data) => api.post('/medical-acts/', data);
export const getMedicalActPdf = (actId) =>
  api.get(`/medical-acts/${actId}/pdf`, { responseType: 'arraybuffer' });

// ─── Analytics ───────────────────────────────────────────────────────────────
export const getAnalyticsSummary = () => api.get('/analytics/summary');

// ─── Notifications ───────────────────────────────────────────────────────────
export const getNotifications = () => api.get('/notifications/');

// ─── Chat AI ─────────────────────────────────────────────────────────────────
export const sendChatMessage = (message, patientId) =>
  api.post('/chat/', { message, patient_id: patientId || null });

export default api;
