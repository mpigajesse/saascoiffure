/**
 * Authentication Service
 */

import apiClient, { getErrorMessage } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  salon_name?: string;
  salon_address?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  email: string;
  is_superuser?: boolean;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'ADMIN' | 'COIFFEUR' | 'RECEPTIONNISTE';
  salon: number;
  salon_name?: string;
  salon_details?: {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
    opening_hours: string;
    currency: string;
    timezone: string;
    logo?: string;
    primary_color: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  is_active: boolean;
}

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.auth.login, credentials);
      const { access, refresh, user } = response.data;
      
      // Store tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      return { user, tokens: { access, refresh } };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Register new user/salon
   */
  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.auth.register, data);
      const { access, refresh, user } = response.data;
      
      // Store tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      return { user, tokens: { access, refresh } };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  /**
   * Get current user
   */
  async me(): Promise<User> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.auth.me);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Change password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.auth.changePassword, {
        old_password: oldPassword,
        new_password: newPassword,
      });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  },
};
