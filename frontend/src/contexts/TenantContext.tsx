import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Salon } from '@/types';
import { useAdmin } from './AdminContext';
import { useAuth } from './AuthContext';
import { apiClient } from '@/lib/api-client';

interface TenantContextType {
  salon: Salon | null;
  isPublic: boolean;
  isLoading: boolean;
  refreshSalon?: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
  salon?: Salon;
  isPublic?: boolean;
}

export function TenantProvider({
  children,
  salon: providedSalon,
  isPublic = false
}: TenantProviderProps) {
  const [salon, setSalon] = useState<Salon | null>(providedSalon || null);
  const [isLoading, setIsLoading] = useState(!providedSalon);

  // Essayer d'obtenir l'utilisateur, mais ne pas échouer si AuthContext n'est pas disponible
  let user = null;
  try {
    const auth = useAuth();
    user = auth.user;
  } catch {
    // AuthContext pas encore disponible, on continue sans
  }

  // Si on est en mode admin et qu'un tenant est sélectionné, utiliser ce tenant
  let adminContext;
  try {
    adminContext = useAdmin();
  } catch {
    // Si AdminContext n'est pas disponible, on ignore
    adminContext = null;
  }

  useEffect(() => {
    console.log('🏢 TenantContext useEffect:', {
      adminTenant: adminContext?.selectedTenant,
      providedSalon,
      userSalon: user?.salon_details
    });

    // Priorité 1: Tenant sélectionné par l'admin
    if (adminContext?.selectedTenant) {
      console.log('📋 Utilisation salon admin:', adminContext.selectedTenant);
      setSalon(adminContext.selectedTenant);
      setIsLoading(false);
    }
    // Priorité 2: Salon fourni explicitement
    else if (providedSalon) {
      console.log('🏪 Utilisation salon fourni:', providedSalon);
      setSalon(providedSalon);
      setIsLoading(false);
    }
    // Priorité 3: Salon de l'utilisateur connecté (depuis API)
    else if (user?.salon_details) {
      console.log('👤 Utilisation salon utilisateur:', user.salon_details);
      setSalon(user.salon_details);
      setIsLoading(false);
    }
    else {
      console.log('⚠️ Aucun salon trouvé');
      setIsLoading(false);
    }
  }, [adminContext?.selectedTenant, providedSalon, user]);

  const refreshSalon = async () => {
    if (user?.salon_details?.id) {
      try {
        // Première tentative : récupérer les données via /auth/me/
        const response = await apiClient.get('/api/v1/auth/me/');
        if (response.data.salon_details) {
          setSalon(response.data.salon_details);
          return;
        }
      } catch (error) {
        console.warn('Erreur avec /auth/me/, tentative alternative...', error);
      }

      try {
        // Fallback : essayer l'endpoint direct du salon si il existe
        const salonId = user.salon_details.id;
        const response = await apiClient.get(`/api/v1/salons/${salonId}/`);
        setSalon(response.data);
      } catch (error) {
        console.error('Erreur lors du rafraîchissement du salon:', error);
        // En cas d'échec, on garde les données actuelles du salon
      }
    }
  };

  return (
    <TenantContext.Provider value={{ salon, isPublic, isLoading, refreshSalon }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

