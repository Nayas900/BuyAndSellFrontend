import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5005',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kkr_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear auth and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kkr_token');
      localStorage.removeItem('kkr_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
