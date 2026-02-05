import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Salon } from '@/types';
import { useAuth } from './AuthContext';

interface AdminContextType {
  selectedTenant: Salon | null;
  isViewingTenant: boolean;
  isSuperAdmin: boolean;
  selectTenant: (tenant: Salon) => void;
  clearTenantSelection: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Charger le tenant sélectionné au démarrage
  const [selectedTenant, setSelectedTenant] = useState<Salon | null>(() => {
    const saved = localStorage.getItem('admin_selected_tenant');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Erreur lors du chargement du tenant:', error);
        localStorage.removeItem('admin_selected_tenant');
        return null;
      }
    }
    return null;
  });

  const selectTenant = useCallback((tenant: Salon) => {
    setSelectedTenant(tenant);
    // Sauvegarder dans localStorage pour persister la sélection
    localStorage.setItem('admin_selected_tenant', JSON.stringify(tenant));
  }, []);

  const clearTenantSelection = useCallback(() => {
    setSelectedTenant(null);
    localStorage.removeItem('admin_selected_tenant');
  }, []);

  // Un super-admin peut gérer plusieurs salons
  // Vérifier si l'utilisateur connecté est un superadmin
  const isSuperAdmin = user?.is_superuser === true;

  return (
    <AdminContext.Provider
      value={{
        selectedTenant,
        isViewingTenant: !!selectedTenant,
        isSuperAdmin,
        selectTenant,
        clearTenantSelection,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

