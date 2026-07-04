import axios from 'axios';

// Use VITE_API_URL from .env — defaults to '/api/v1' (proxied through Vite to port 5000)
// This avoids cross-origin cookie issues: browser sees same origin (localhost:3000)
// and Vite proxy forwards to backend (localhost:5000) transparently.
const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Required so cookies are sent with every request
  headers: { 'Content-Type': 'application/json' },
});

// Token refresh queue — prevents multiple concurrent refresh calls
let isRefreshing = false;
let failedQueue = [];

function processQueue(error) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest)).catch((e) => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use same proxy path for refresh
        await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        processQueue(null);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr);
        window.location.href = '/sign-in';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
