/**
 * Hooks for public salon pages
 * These hooks use the public API endpoints that don't require authentication
 */
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';
import { API_BASE_URL } from '@/config/api';
import { Service, ServiceCategory } from '@/services/services.service';

/**
 * Get the salon slug from URL params or TenantContext
 */
export function useSalonSlug(): string | undefined {
  const { slug } = useParams<{ slug: string }>();
  const { salon } = useTenant();
  
  // Prefer URL param, fallback to tenant context
  return slug || salon?.slug;
}

/**
 * Fetch public services for a salon by slug
 */
export function usePublicServices() {
  const slug = useSalonSlug();
  
  return useQuery({
    queryKey: ['public-services', slug],
    queryFn: async (): Promise<{ results: Service[]; count: number }> => {
      if (!slug) throw new Error('No salon slug');
      
      const response = await fetch(`${API_BASE_URL}/api/v1/public/salon/${slug}/services/`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des services');
      }
      const data = await response.json();
      
      // Handle both paginated and non-paginated responses
      if (Array.isArray(data)) {
        return { results: data, count: data.length };
      }
      return data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch a single public service by ID
 */
export function usePublicService(serviceId: number | string | undefined) {
  const slug = useSalonSlug();
  
  return useQuery({
    queryKey: ['public-service', slug, serviceId],
    queryFn: async (): Promise<Service> => {
      if (!slug || !serviceId) throw new Error('Missing parameters');
      
      const response = await fetch(`${API_BASE_URL}/api/v1/public/salon/${slug}/services/${serviceId}/`);
      if (!response.ok) {
        throw new Error('Service non trouvé');
      }
      return response.json();
    },
    enabled: !!slug && !!serviceId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch public service categories for a salon by slug
 */
export function usePublicServiceCategories() {
  const slug = useSalonSlug();
  
  return useQuery({
    queryKey: ['public-categories', slug],
    queryFn: async (): Promise<ServiceCategory[]> => {
      if (!slug) throw new Error('No salon slug');
      
      const response = await fetch(`${API_BASE_URL}/api/v1/public/salon/${slug}/categories/`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des catégories');
      }
      const data = await response.json();
      
      // Handle both paginated and non-paginated responses
      if (Array.isArray(data)) {
        return data;
      }
      return data.results || [];
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Employee type for public API
 */
interface PublicEmployee {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  specialties?: string[];
  avatar?: string;
}

/**
 * Fetch public employees for a salon by slug
 */
export function usePublicEmployees() {
  const slug = useSalonSlug();
  
  return useQuery({
    queryKey: ['public-employees', slug],
    queryFn: async (): Promise<{ results: PublicEmployee[]; count: number }> => {
      if (!slug) throw new Error('No salon slug');
      
      const response = await fetch(`${API_BASE_URL}/api/v1/public/salon/${slug}/employees/`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des coiffeurs');
      }
      const data = await response.json();
      
      // Handle both paginated and non-paginated responses
      if (Array.isArray(data)) {
        return { results: data, count: data.length };
      }
      return data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Available time slots response
 */
interface AvailableSlotsResponse {
  date: string;
  employee_id: number;
  service_duration: number;
  slots: string[];
}

/**
 * Fetch available time slots for a specific employee, date, and service
 * Real-time availability check
 */
export function useAvailableSlots(
  employeeId: string | number | undefined,
  date: string | undefined,
  serviceId?: string | number | undefined
) {
  const slug = useSalonSlug();
  
  return useQuery({
    queryKey: ['available-slots', slug, employeeId, date, serviceId],
    queryFn: async (): Promise<AvailableSlotsResponse> => {
      if (!slug || !employeeId || !date) {
        throw new Error('Missing parameters');
      }
      
      let url = `${API_BASE_URL}/api/v1/public/booking/available-slots/?salon_slug=${slug}&employee_id=${employeeId}&date=${date}`;
      if (serviceId) {
        url += `&service_id=${serviceId}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des créneaux');
      }
      return response.json();
    },
    enabled: !!slug && !!employeeId && !!date,
    staleTime: 30 * 1000, // 30 seconds - refresh frequently for real-time availability
    refetchInterval: 60 * 1000, // Auto-refresh every 60 seconds
  });
}
