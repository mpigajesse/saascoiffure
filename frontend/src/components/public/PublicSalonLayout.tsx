/**
 * Layout for public salon pages
 * Fetches salon data by slug from URL and provides it via TenantContext
 */
import { useParams, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TenantProvider } from '@/contexts/TenantContext';
import { TenantThemeProvider } from '@/contexts/TenantThemeContext';
import { Salon } from '@/types';
import { API_BASE_URL } from '@/config/api';

async function fetchSalonBySlug(slug: string): Promise<Salon> {
  const response = await fetch(`${API_BASE_URL}/api/v1/public/salon/${slug}/`);
  if (!response.ok) {
    throw new Error('Salon non trouvé');
  }
  return response.json();
}

export function PublicSalonLayout() {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: salon, isLoading, error } = useQuery({
    queryKey: ['public-salon', slug],
    queryFn: () => fetchSalonBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }
  
  if (error || !salon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Salon non trouvé</h1>
          <p className="text-gray-600">Le salon "{slug}" n'existe pas ou n'est plus actif.</p>
        </div>
      </div>
    );
  }
  
  return (
    <TenantProvider salon={salon} isPublic={true}>
      <TenantThemeProvider>
        <Outlet />
      </TenantThemeProvider>
    </TenantProvider>
  );
}

export default PublicSalonLayout;
