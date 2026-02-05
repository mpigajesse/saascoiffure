import { createContext, useContext, ReactNode } from 'react';

// Ce contexte sera migré vers React Query
// Pour l'instant, on le garde vide pour éviter les erreurs

interface AppointmentsContextType {
  // Placeholder - sera supprimé après migration complète vers React Query
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  return (
    <AppointmentsContext.Provider value={{}}>
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments() {
  const context = useContext(AppointmentsContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentsProvider');
  }
  return context;
}

