import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://172.20.10.3:8000/api';

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

export const login = (username, password) =>
  api.post('/auth/login', new URLSearchParams({ username, password }));

export const getPatients = () => api.get('/patients/');
export const getPatient = (id) => api.get(`/patients/${id}`);

export const getAnalyticsSummary = () => api.get('/analytics/summary');
export const getNotifications = () => api.get('/notifications/');

export default api;
