import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
  withCredentials: true, // Enable cookies for CSRF protection
  withXSRFToken: true
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if it exists
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Log request for debugging
    // console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
    //   data: config.data,
    //   headers: config.headers,
    // });

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log(`✅ API Response: ${response.status}`, {
      url: response.config.url,
      data: response.data,
    });

    return response;
  },
  (error) => {
    // Log error response
    // console.error('❌ API Error Response:', {
    //   status: error.response?.status,
    //   statusText: error.response?.statusText,
    //   url: error.config?.url,
    //   data: error.response?.data,
    // });

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('❌ Network Error: Unable to connect to the server');
      error.message = 'Network error. Please check your connection and try again.';
    }

    return Promise.reject(error);
  }
);

export default api;