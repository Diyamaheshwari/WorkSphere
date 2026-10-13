import axios from 'axios';

const getApiBaseUrl = () => {
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // If in a deployed cloud environment (Vercel, Netlify, etc.), ALWAYS use the live Render backend
  // unless explicitly provided a non-localhost custom API URL
  if (!isLocalhost || import.meta.env.PROD) {
    if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) {
      return import.meta.env.VITE_API_URL;
    }
    return 'https://worksphere-9moz.onrender.com';
  }

  // When developing locally on localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

const API_URL = getApiBaseUrl();
console.log('[WorkSphere API] Base URL:', API_URL);

// Base API configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token is invalid or expired, clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
