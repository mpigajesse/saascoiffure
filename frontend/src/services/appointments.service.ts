/**
 * Appointments API Service
 */

import apiClient, { getErrorMessage } from '@/lib/api-client';
import { API_ENDPOINTS, buildUrl } from '@/config/api';

export interface Appointment {
  id: number;
  salon: number;
  client: number;
  client_name?: string;
  employee: number;
  employee_name?: string;
  service: number;
  service_name?: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  source?: 'website' | 'whatsapp' | 'phone' | 'walk_in';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentFilters {
  status?: string;
  date?: string;
  employee?: number;
  client?: number;
  page?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface AvailableSlot {
  start_time: string;
  end_time: string;
  available: boolean;
}

export const appointmentsService = {
  /**
   * Get all appointments
   */
  async getAppointments(filters?: AppointmentFilters): Promise<{ results: Appointment[]; count: number }> {
    try {
      const url = buildUrl(API_ENDPOINTS.appointments.list, filters);
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get appointment by ID
   */
  async getAppointment(id: number): Promise<Appointment> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.appointments.detail(id));
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Create new appointment
   */
  async createAppointment(data: Partial<Appointment>): Promise<Appointment> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.appointments.create, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Update appointment
   */
  async updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.appointments.update(id), data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Delete appointment
   */
  async deleteAppointment(id: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.appointments.delete(id));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get today's appointments
   */
  async getTodayAppointments(): Promise<Appointment[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.appointments.today);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get upcoming appointments
   */
  async getUpcomingAppointments(): Promise<Appointment[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.appointments.upcoming);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Confirm appointment
   */
  async confirmAppointment(id: number): Promise<Appointment> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.appointments.confirm(id));
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Cancel appointment
   */
  async cancelAppointment(id: number): Promise<Appointment> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.appointments.cancel(id));
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Complete appointment
   */
  async completeAppointment(id: number): Promise<Appointment> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.appointments.complete(id));
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Check availability
   */
  async checkAvailability(
    employeeId: number,
    date: string,
    startTime: string,
    duration: number
  ): Promise<{ available: boolean }> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.appointments.checkAvailability, {
        employee_id: employeeId,
        date,
        start_time: startTime,
        duration,
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get available time slots
   */
  async getAvailableSlots(employeeId: number, date: string, serviceId: number): Promise<AvailableSlot[]> {
    try {
      const url = buildUrl(API_ENDPOINTS.appointments.availableSlots, {
        employee_id: employeeId,
        date,
        service_id: serviceId,
      });
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
