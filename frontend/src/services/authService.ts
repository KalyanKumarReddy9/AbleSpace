import api from './api';

export interface User {
  _id?: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  branch: string;
  year?: number;
  section?: string;
  rollNumber?: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  branch: string;
  token: string;
}

export const authService = {
  // Register a new user
  register: async (userData: any) => {
    const response = await api.post<AuthResponse>('/users/register', userData);
    return response.data;
  },

  // Login user
  login: async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/users/login', {
      email,
      password
    });
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get<User>('/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (name: string) => {
    const response = await api.put<User>('/users/profile', { name });
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
  }
};