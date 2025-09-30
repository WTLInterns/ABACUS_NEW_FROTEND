'use client';

import type { User } from '@/types/user';

function generateToken(): string {
  const arr = new Uint8Array(12);
  globalThis.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

// For demo purposes, we'll determine role based on email
const getUserRole = (email: string): 'teacher' | 'admin' => {
  // In a real app, this would come from the server
  if (email === 'admin@abacus.io') {
    return 'admin';
  }
  return 'teacher';
};

const user = {
  id: 'USR-000',
  avatar: '/assets/avatar.png',
  firstName: 'Sofia',
  lastName: 'Rivers',
  email: 'sofia@abacus.io',
  role: 'teacher',
} satisfies User;

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
  accountType: 'teacher' | 'admin';
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  async signUp(_: SignUpParams): Promise<{ error?: string }> {
    // Make API request

    // We do not handle the API, so we'll just generate a token and store it in localStorage.
    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);

    return {};
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    const { email, password, accountType } = params;

    // Make API request

    // We do not handle the API, so we'll check if the credentials match with the hardcoded ones.
    if (email !== 'sofia@abacus.io' || password !== 'Secret1') {
      return { error: 'Invalid credentials' };
    }

    // Set role based on account type
    const userWithRole = { ...user, role: accountType };
    
    // Store role in localStorage for retrieval
    localStorage.setItem('user-role', accountType);

    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);

    return {};
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    // Make API request

    // We do not handle the API, so just check if we have a token in localStorage.
    const token = localStorage.getItem('custom-auth-token');

    if (!token) {
      return { data: null };
    }

    // Get role from localStorage
    const role = localStorage.getItem('user-role') as 'teacher' | 'admin' || 'teacher';
    const userWithRole = { ...user, role };

    return { data: userWithRole };
  }

  async signOut(): Promise<{ error?: string }> {
    // Clear all user-related data from localStorage
    localStorage.removeItem('custom-auth-token');
    localStorage.removeItem('user-role');
    
    // Dispatch storage event to notify other tabs/components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'custom-auth-token',
        newValue: null,
        oldValue: localStorage.getItem('custom-auth-token') || '',
      }));
    }
    
    // Clear any other user-specific data
    // This ensures a clean state on logout

    return {};
  }
}

export const authClient = new AuthClient();