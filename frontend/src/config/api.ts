/**
 * API Configuration for SaaS Coiffure
 * Centralized API endpoints configuration
 */

// Detect if running via Cloudflare tunnel
const isTunnel = typeof window !== 'undefined' && (
  window.location.hostname.endsWith('.workers.dev') ||
  window.location.hostname.endsWith('.trycloudflare.com')
);

// Base URLs - use relative /api path when via tunnel (Workers will proxy)
export const API_BASE_URL = isTunnel ? '' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000');
export const API_VERSION = '/api/v1';
export const BASE_API_URL = `${API_BASE_URL}${API_VERSION}`;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    register: `${BASE_API_URL}/auth/register/`,
    login: `${BASE_API_URL}/auth/login/`,
    logout: `${BASE_API_URL}/auth/logout/`,
    refresh: `${BASE_API_URL}/auth/token/refresh/`,
    me: `${BASE_API_URL}/auth/me/`,
    changePassword: `${BASE_API_URL}/auth/change-password/`,
  },

  // Salons (Tenants)
  salons: {
    list: `${BASE_API_URL}/salons/`,
    detail: (id: number) => `${BASE_API_URL}/salons/${id}/`,
    create: `${BASE_API_URL}/salons/`,
    update: (id: number) => `${BASE_API_URL}/salons/${id}/`,
    delete: (id: number) => `${BASE_API_URL}/salons/${id}/`,
  },

  // Employees
  employees: {
    list: `${BASE_API_URL}/employees/`,
    detail: (id: number) => `${BASE_API_URL}/employees/${id}/`,
    create: `${BASE_API_URL}/employees/`,
    update: (id: number) => `${BASE_API_URL}/employees/${id}/`,
    delete: (id: number) => `${BASE_API_URL}/employees/${id}/`,
    toggleAvailability: (id: number) => `${BASE_API_URL}/employees/${id}/toggle-availability/`,
    schedule: (id: number) => `${BASE_API_URL}/employees/${id}/schedule/`,
  },

  // Clients
  clients: {
    list: `${BASE_API_URL}/clients/`,
    detail: (id: number) => `${BASE_API_URL}/clients/${id}/`,
    create: `${BASE_API_URL}/clients/`,
    update: (id: number) => `${BASE_API_URL}/clients/${id}/`,
    delete: (id: number) => `${BASE_API_URL}/clients/${id}/`,
    history: (id: number) => `${BASE_API_URL}/clients/${id}/history/`,
    stats: (id: number) => `${BASE_API_URL}/clients/${id}/stats/`,
  },

  // Services
  services: {
    list: `${BASE_API_URL}/services/`,
    detail: (id: number) => `${BASE_API_URL}/services/${id}/`,
    create: `${BASE_API_URL}/services/`,
    update: (id: number) => `${BASE_API_URL}/services/${id}/`,
    delete: (id: number) => `${BASE_API_URL}/services/${id}/`,
    popular: `${BASE_API_URL}/services/popular/`,
    revenue: `${BASE_API_URL}/services/revenue/`,
    categories: {
      list: `${BASE_API_URL}/services/categories/`,
      detail: (id: number) => `${BASE_API_URL}/services/categories/${id}/`,
      create: `${BASE_API_URL}/services/categories/`,
      update: (id: number) => `${BASE_API_URL}/services/categories/${id}/`,
      delete: (id: number) => `${BASE_API_URL}/services/categories/${id}/`,
    },
  },

  // Appointments
  appointments: {
    list: `${BASE_API_URL}/appointments/`,
    detail: (id: number) => `${BASE_API_URL}/appointments/${id}/`,
    create: `${BASE_API_URL}/appointments/`,
    update: (id: number) => `${BASE_API_URL}/appointments/${id}/`,
    delete: (id: number) => `${BASE_API_URL}/appointments/${id}/`,
    today: `${BASE_API_URL}/appointments/today/`,
    upcoming: `${BASE_API_URL}/appointments/upcoming/`,
    confirm: (id: number) => `${BASE_API_URL}/appointments/${id}/confirm/`,
    cancel: (id: number) => `${BASE_API_URL}/appointments/${id}/cancel/`,
    complete: (id: number) => `${BASE_API_URL}/appointments/${id}/complete/`,
    checkAvailability: `${BASE_API_URL}/appointments/check-availability/`,
    availableSlots: `${BASE_API_URL}/appointments/available-slots/`,
    stats: `${BASE_API_URL}/appointments/stats/`,
  },

  // Payments
  payments: {
    list: `${BASE_API_URL}/payments/`,
    detail: (id: number) => `${BASE_API_URL}/payments/${id}/`,
    create: `${BASE_API_URL}/payments/`,
    update: (id: number) => `${BASE_API_URL}/payments/${id}/`,
    delete: (id: number) => `${BASE_API_URL}/payments/${id}/`,
    process: (id: number) => `${BASE_API_URL}/payments/${id}/process/`,
    refund: (id: number) => `${BASE_API_URL}/payments/${id}/refund/`,
    revenue: `${BASE_API_URL}/payments/revenue/`,
    stats: `${BASE_API_URL}/payments/stats/`,
  },
} as const;

// Helper function to build URL with query parameters
export const buildUrl = (endpoint: string, params?: Record<string, string | number | boolean | undefined>): string => {
  if (!params) return endpoint;
  
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `${endpoint}?${queryString}` : endpoint;
};

// Export types for TypeScript
export type ApiEndpoints = typeof API_ENDPOINTS;
