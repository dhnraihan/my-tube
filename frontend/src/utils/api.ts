import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and handle FormData
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Remove Content-Type header for FormData to let the browser set it with the correct boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 unauthorized errors
    if (error.response?.status === 401) {
      // Check if the request is for categories endpoint
      const isCategories = error.config?.url?.includes('/api/categories/');
      
      // Remove invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('refresh');
      
      // Only redirect to login for non-categories endpoints
      if (!isCategories) {
        // Redirect to login (you might want to use your routing logic here)
        window.location.href = '/login';
      }
      
      // Return a properly formatted error response
      return Promise.reject({
        message: 'Unauthorized',
        status: 401,
        data: error.response?.data || { detail: 'Authentication required' }
      });
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject({
        message: 'Network Error',
        status: 0,
        data: { detail: 'Unable to connect to the server. Please check your internet connection.' }
      });
    }
    
    // Handle other types of errors
    const status = error.response.status;
    let message = 'An error occurred';
    
    if (status >= 500) {
      message = 'Server error';
    } else if (status >= 400) {
      message = 'Request error';
    }
    
    // Return a properly formatted error response
    return Promise.reject({
      message,
      status,
      data: error.response.data || { detail: message }
    });
  }
);

export default api;