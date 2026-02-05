/**
 * Employees API Service
 */

import apiClient, { getErrorMessage } from '@/lib/api-client';
import { API_ENDPOINTS, buildUrl } from '@/config/api';

export interface Employee {
  id: number;
  salon: number;
  user: number;
  user_email?: string;
  user_name?: string;
  first_name?: string;
  last_name?: string;
  role?: 'ADMIN' | 'COIFFEUR' | 'RECEPTIONNISTE';
  specialties?: string;
  bio?: string;
  photo?: string;
  is_available: boolean;
  work_schedule?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface EmployeeFilters {
  is_available?: boolean;
  search?: string;
  page?: number;
  [key: string]: string | number | boolean | undefined;
}

export const employeesService = {
  /**
   * Get all employees
   */
  async getEmployees(filters?: EmployeeFilters): Promise<{ results: Employee[]; count: number }> {
    try {
      const url = buildUrl(API_ENDPOINTS.employees.list, filters);
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get employee by ID
   */
  async getEmployee(id: number): Promise<Employee> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.employees.detail(id));
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Create new employee
   */
  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.employees.create, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Update employee
   */
  async updateEmployee(id: number, data: Partial<Employee>): Promise<Employee> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.employees.update(id), data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Delete employee
   */
  async deleteEmployee(id: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.employees.delete(id));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Toggle employee availability
   */
  async toggleAvailability(id: number): Promise<Employee> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.employees.toggleAvailability(id));
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
