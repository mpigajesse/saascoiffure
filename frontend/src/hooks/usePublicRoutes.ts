/**
 * Hook for generating public routes with salon slug
 */
import { useParams } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';

/**
 * Returns a function to generate public route paths with the current salon slug
 */
export function usePublicRoutes() {
  const { slug } = useParams<{ slug: string }>();
  const { salon } = useTenant();
  
  // Get slug from URL or salon context
  const salonSlug = slug || salon?.slug;
  
  // Base path for public routes
  const basePath = salonSlug ? `/s/${salonSlug}` : '/public';
  
  return {
    home: basePath,
    services: `${basePath}/services`,
    serviceDetail: (id: string | number) => `${basePath}/services/${id}`,
    booking: `${basePath}/booking`,
    contact: `${basePath}/contact`,
    salonSlug,
  };
}
