import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { clearAllClientSideData } from '@/lib/storage';

// Define the base URL for your API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8085';

// Create an Axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('custom-auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle responses and errors globally
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common error responses
    if (error.response?.status === 401) {
      // Unauthorized - possibly redirect to login
      try { clearAllClientSideData(); } catch {}
      window.location.href = '/auth/sign-in';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;