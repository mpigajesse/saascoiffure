/**
 * Clients API Service
 */

import apiClient, { getErrorMessage } from '@/lib/api-client';
import { API_ENDPOINTS, buildUrl } from '@/config/api';

export interface Client {
  id: number;
  salon: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  address?: string;
  notes?: string;
  preferred_employee?: number;
  created_at: string;
  updated_at: string;
}

export interface ClientFilters {
  search?: string;
  page?: number;
  [key: string]: string | number | boolean | undefined;
}

export const clientsService = {
  /**
   * Get all clients
   */
  async getClients(filters?: ClientFilters): Promise<{ results: Client[]; count: number }> {
    try {
      const url = buildUrl(API_ENDPOINTS.clients.list, filters);
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get client by ID
   */
  async getClient(id: number): Promise<Client> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.clients.detail(id));
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Create new client
   */
  async createClient(data: Partial<Client>, salonId?: string | number): Promise<Client> {
    try {
      // Fix for superuser creating client without salon context in User model
      const config = salonId ? { headers: { 'X-Salon-Id': salonId.toString() } } : {};
      const response = await apiClient.post(API_ENDPOINTS.clients.create, data, config);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Update client
   */
  async updateClient(id: number, data: Partial<Client>): Promise<Client> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.clients.update(id), data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Delete client
   */
  async deleteClient(id: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.clients.delete(id));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get client appointment history
   */
  async getClientHistory(id: number): Promise<any[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.clients.history(id));
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get client statistics
   */
  async getClientStats(id: number): Promise<any> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.clients.stats(id));
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
