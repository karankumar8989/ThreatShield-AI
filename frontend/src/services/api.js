import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.detail || error.message;

    if (!error.response) {
      toast.error('Network error. Please check your connection.');
    } else if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('threatshield_email');
      if (!window.location.pathname.includes('/login')) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    } else if (status === 403) {
      toast.error('Access denied.');
    } else if (status === 500) {
      toast.error(typeof message === 'string' ? message : 'Server error. Please try again later.');
    } else if (status === 404) {
      toast.error(typeof message === 'string' ? message : 'Resource not found.');
    } else if (status === 400) {
      toast.error(typeof message === 'string' ? message : 'Invalid request.');
    }

    return Promise.reject(error);
  }
);

export default api;
