import { User } from '@/types/user';
import { authService, LoginRequest } from '@/services';

// Generate a random token for demo purposes
function generateToken(): string {
  return Math.random().toString(36).substring(2);
}

// Define the parameters for sign in
export interface SignInWithPasswordParams {
  email: string;
  password: string;
  accountType: 'teacher' | 'admin' | 'master_admin';
}

// Define the parameters for reset password
export interface ResetPasswordParams {
  email: string;
}

// Define the parameters for sign up
export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Define the client methods
export interface AuthClient {
  signUp: (params: SignUpParams) => Promise<{ error?: string }>;
  signInWithPassword: (params: SignInWithPasswordParams) => Promise<{ error?: string; data?: User }>;
  resetPassword: (params: ResetPasswordParams) => Promise<{ error?: string }>;
  signOut: () => Promise<{ error?: string }>;
  getUser: () => Promise<{ error?: string; data?: User }>;
}

// Implement the client
class AuthClientImpl implements AuthClient {
  async signUp(params: SignUpParams): Promise<{ error?: string }> {
    // In a real implementation, this would call an API endpoint
    // For now, we'll just simulate success
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, you would call:
      // await apiClient.post('/auth/sign-up', params);
      
      return { error: undefined };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'Failed to sign up. Please try again.' };
    }
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string; data?: User }> {
    const { email, password, accountType } = params;
    
    // Create credentials object
    const credentials: LoginRequest = { email, password };

    try {
      // Determine which login method to call based on account type
      if (accountType === 'master_admin') {
        return await authService.masterAdminLogin(credentials);
      } else {
        // For teacher or admin, use teacher login
        return await authService.teacherLogin(credentials);
      }
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'Network error. Please try again.' };
    }
  }

  async resetPassword(params: ResetPasswordParams): Promise<{ error?: string }> {
    // In a real implementation, this would call an API endpoint
    // For now, we'll just simulate success
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, you would call:
      // await apiClient.post('/auth/reset-password', { email: params.email });
      
      return { error: undefined };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: 'Failed to send reset password email. Please try again.' };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    try {
      authService.logout();
      return { error: undefined };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: 'Failed to sign out. Please try again.' };
    }
  }

  async getUser(): Promise<{ error?: string; data?: User }> {
    // In a real implementation, this would call an API endpoint to get user data
    // For now, we'll retrieve user data from localStorage
    try {
      const userData = localStorage.getItem('user-data');
      
      if (!userData) {
        return { error: 'User not found' };
      }
      
      const user: User = JSON.parse(userData);
      return { data: user };
    } catch (error) {
      console.error('Get user error:', error);
      return { error: 'Failed to get user data. Please try again.' };
    }
  }
}

// Export the client instance
export const authClient = new AuthClientImpl();