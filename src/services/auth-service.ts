import apiClient from './api';
import { User } from '@/types/user';

// Define the response types
export interface LoginResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'MASTER_ADMIN' | 'TEACHER';
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Auth API service
class AuthService {
  /**
   * Login as a teacher
   */
  async teacherLogin(credentials: LoginRequest): Promise<{ error?: string; data?: User }> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/teacherLogin', credentials);
      
      // Map API role to frontend role
      let frontendRole: 'teacher' | 'admin' | 'master_admin' = 'teacher';
      if (response.data.role === 'MASTER_ADMIN') {
        frontendRole = 'admin'; // Map MASTER_ADMIN to admin role
      }

      const user: User = {
        id: response.data.id.toString(),
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
        role: frontendRole,
      };

      // Store user data and token in localStorage
      localStorage.setItem('custom-auth-token', response.data.token);
      localStorage.setItem('user-data', JSON.stringify(user));

      return { data: user };
    } catch (error: any) {
      console.error('Teacher login error:', error);
      return { error: error.response?.data?.message || 'Teacher login failed' };
    }
  }

  /**
   * Login as a master admin
   */
  async masterAdminLogin(credentials: LoginRequest): Promise<{ error?: string; data?: User }> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/masterAdminLogin', credentials);
      
      // Map API role to frontend role
      let frontendRole: 'teacher' | 'admin' | 'master_admin' = 'teacher';
      if (response.data.role === 'MASTER_ADMIN') {
        frontendRole = 'admin'; // Map MASTER_ADMIN to admin role
      }

      const user: User = {
        id: response.data.id.toString(),
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
        role: frontendRole,
      };

      // Store user data and token in localStorage
      localStorage.setItem('custom-auth-token', response.data.token);
      localStorage.setItem('user-data', JSON.stringify(user));

      return { data: user };
    } catch (error: any) {
      console.error('Master admin login error:', error);
      return { error: error.response?.data?.message || 'Master admin login failed' };
    }
  }

  /**
   * Logout the current user
   */
  logout(): void {
    localStorage.removeItem('custom-auth-token');
    localStorage.removeItem('user-data');
  }
}

const authService = new AuthService();
export default authService;