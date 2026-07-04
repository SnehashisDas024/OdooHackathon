import api from './api';

export const authService = {
  // POST /api/v1/auth/sign-in
  signIn: (data) => api.post('/auth/sign-in', data),
  // POST /api/v1/auth/sign-out
  signOut: () => api.post('/auth/sign-out'),
  // POST /api/v1/auth/change-password
  changePassword: (data) => api.post('/auth/change-password', data),
  // POST /api/v1/auth/refresh
  refresh: () => api.post('/auth/refresh'),
  // GET /api/v1/auth/me
  me: () => api.get('/auth/me'),
  // POST /api/v1/auth/forgot-password
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
};
