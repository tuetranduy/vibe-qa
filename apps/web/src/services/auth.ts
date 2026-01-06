import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vibeqa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
    };
  };
  meta: {
    requestId: string;
    timestamp: string;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: Array<{ field: string; message: string }>;
  };
  meta: {
    requestId: string;
    timestamp: string;
  };
}

/**
 * Register a new user
 */
export const signup = async (email: string, password: string, name: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/v1/auth/signup', {
    email,
    password,
    name,
  });
  return response.data;
};

/**
 * Login existing user
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/v1/auth/login', {
    email,
    password,
  });
  return response.data;
};

/**
 * Logout current user
 */
export const logout = async (): Promise<void> => {
  await api.post('/api/v1/auth/logout');
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  const response = await api.get('/api/v1/users/me');
  return response.data;
};

export default api;
