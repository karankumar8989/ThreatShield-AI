import api from './api';

export const authService = {
  signup: (email, password) =>
    api.post('/auth/signup', { email, password }),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  healthCheck: () => api.get('/health'),
};
