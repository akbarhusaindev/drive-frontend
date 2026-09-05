import axios from 'axios';

export const API_BASE_URL = 'https://cloudbackend-ygbk.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120s timeout to gracefully support Render free tier cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expiration and automatic retries for cold start
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Do NOT redirect or clear state if the failed request was a login or register attempt
    const isAuthRequest =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register');

    const currentPath = window.location.pathname;
    const isAuthPage =
      currentPath === '/login' ||
      currentPath === '/register' ||
      currentPath.startsWith('/share/');

    if (error.response?.status === 401 && !isAuthRequest && !isAuthPage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Auto-retry once on network timeouts / cold start 502/503/504 errors
    if (
      originalRequest &&
      !originalRequest._retry &&
      (error.code === 'ECONNABORTED' ||
        error.message?.includes('Network Error') ||
        error.response?.status === 502 ||
        error.response?.status === 503 ||
        error.response?.status === 504)
    ) {
      originalRequest._retry = true;
      try {
        // Wait 1.5s before retrying
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return await api(originalRequest);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);

// Background server pre-warming ping (Render.com spins up if asleep)
let isWarmingUp = false;
export const warmUpServer = async () => {
  if (isWarmingUp) return;
  isWarmingUp = true;
  try {
    // Light ping to start the Render container
    await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'OPTIONS',
      mode: 'cors',
    }).catch(() => {});
  } catch {
    // Ignore warmup errors
  }
};

export default api;