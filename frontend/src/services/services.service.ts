/**
 * Services Module API Service
 */

import apiClient, { getErrorMessage } from '@/lib/api-client';
import { API_ENDPOINTS, buildUrl } from '@/config/api';

export interface ServiceCategory {
  id: number;
  salon: number;
  name: string;
  description: string;
  color?: string; // Optional property from frontend
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ServiceTarget = 'homme' | 'femme' | 'enfant_fille' | 'enfant_garcon';

export interface ServiceImage {
  id: number;
  image: string;
  alt_text?: string;
  is_primary: boolean;
  order: number;
}

export interface Service {
  id: number;
  salon: number;
  category: number; // ID of the category
  category_name?: string;
  categoryId?: string;
  name: string;
  description: string;
  price: string;
  duration: number;
  image?: string;
  images?: ServiceImage[];
  main_image_url?: string;
  target?: ServiceTarget;
  is_active: boolean;
  is_published?: boolean;
  created_at: string;
  updated_at: string;
 
  // Compatibility properties for frontend code that might use these names
  isActive?: boolean;
  isPublished?: boolean;
}

export interface ServiceFilters {
  category?: number;
  is_active?: boolean;
  search?: string;
  page?: number;
  [key: string]: string | number | boolean | undefined;
}

export const servicesService = {
  /**
   * Get all services
   */
  async getServices(filters?: ServiceFilters): Promise<{ results: Service[]; count: number }> {
    try {
      const url = buildUrl(API_ENDPOINTS.services.list, filters);
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get service by ID
   */
  async getService(id: number): Promise<Service> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.services.detail(id));
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Create new service
   */
  async createService(data: Partial<Service>, salonId?: string | number): Promise<Service> {
    try {
      const config = salonId ? { headers: { 'X-Salon-Id': String(salonId) } } : {};
      const response = await apiClient.post(API_ENDPOINTS.services.create, data, config);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Update service
   */
  async updateService(id: number, data: Partial<Service>): Promise<Service> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.services.update(id), data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Delete service
   */
  async deleteService(id: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.services.delete(id));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get popular services
   */
  async getPopularServices(): Promise<Service[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.services.popular);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get service categories
   */
  async getCategories(): Promise<ServiceCategory[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.services.categories.list);
      return response.data.results || response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Create service category
   */
  async createCategory(data: Partial<ServiceCategory>): Promise<ServiceCategory> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.services.categories.create, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
