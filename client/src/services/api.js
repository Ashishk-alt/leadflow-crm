import axios from 'axios';

// Create base Axios instance
const API = axios.create({
  baseURL: '/api', // Vite proxy catches this in dev
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios Request Interceptor to append authentication headers
API.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional Response Interceptor to handle global errors (e.g. 401 unauth token expiry)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Authentication token expired or invalid. Logging out...');
      localStorage.removeItem('user');
      // Force page redirect to login if not already there
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
