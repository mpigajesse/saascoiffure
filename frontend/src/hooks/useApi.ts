/**
 * React Query Hooks for API calls
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  servicesService,
  appointmentsService,
  clientsService,
  employeesService,
  Service,
  ServiceFilters,
  Appointment,
  AppointmentFilters,
  Client,
  ClientFilters,
  Employee,
  EmployeeFilters
} from '@/services';
import { toast } from 'sonner';
import { useTenant } from '@/contexts/TenantContext';

// Helper to get salonId with localStorage fallback for superadmins
function getSalonIdWithFallback(salon: { id?: string | number } | null): string | number | undefined {
  if (salon?.id) return salon.id;

  // Fallback: try localStorage (AdminContext persists there)
  try {
    const savedTenant = localStorage.getItem('admin_selected_tenant');
    if (savedTenant) {
      const parsed = JSON.parse(savedTenant);
      return parsed?.id;
    }
  } catch (e) {
    console.error('Error reading tenant from localStorage', e);
  }
  return undefined;
}

// ============ SERVICES ============

export const useServices = (filters?: ServiceFilters) => {
  return useQuery({
    queryKey: ['services', filters],
    queryFn: () => servicesService.getServices(filters),
  });
};

export const useService = (id: number) => {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => servicesService.getService(id),
    enabled: !!id,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  const { salon } = useTenant();

  return useMutation({
    mutationFn: (data: Partial<Service>) => {
      const salonId = getSalonIdWithFallback(salon);
      return servicesService.createService(data, salonId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service créé avec succès');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la création du service');
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Service> }) =>
      servicesService.updateService(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service', variables.id] });
      toast.success('Service mis à jour avec succès');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour du service');
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => servicesService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service supprimé avec succès');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la suppression du service');
    },
  });
};

// ============ CATEGORIES ============

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => servicesService.getCategories(),
  });
};

export const useServiceCategories = () => {
  return useQuery({
    queryKey: ['serviceCategories'],
    queryFn: () => servicesService.getCategories(),
  });
};

// ============ APPOINTMENTS ============

export const useAppointments = (filters?: AppointmentFilters) => {
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: () => appointmentsService.getAppointments(filters),
  });
};

export const useAppointment = (id: number) => {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentsService.getAppointment(id),
    enabled: !!id,
  });
};

export const useTodayAppointments = () => {
  return useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: () => appointmentsService.getTodayAppointments(),
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useUpcomingAppointments = () => {
  return useQuery({
    queryKey: ['appointments', 'upcoming'],
    queryFn: () => appointmentsService.getUpcomingAppointments(),
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const { salon } = useTenant();

  return useMutation({
    mutationFn: (data: Partial<Appointment>) => {
      const salonId = getSalonIdWithFallback(salon);
      return appointmentsService.createAppointment(data, salonId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Rendez-vous créé avec succès');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la création du rendez-vous');
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Appointment> }) =>
      appointmentsService.updateAppointment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.id] });
      toast.success('Rendez-vous mis à jour avec succès');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour du rendez-vous');
    },
  });
};

export const useConfirmAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => appointmentsService.confirmAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Rendez-vous confirmé');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la confirmation');
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => appointmentsService.cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Rendez-vous annulé');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de l\'annulation');
    },
  });
};

export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => appointmentsService.completeAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Rendez-vous terminé');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur');
    },
  });
};

export const useStartAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => appointmentsService.startAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Rendez-vous démarré');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur');
    },
  });
};

export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, date, time }: { id: number; date: string; time: string }) =>
      appointmentsService.rescheduleAppointment(id, date, time),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Rendez-vous reporté');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors du report');
    },
  });
};

export const useMoveAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, employeeId }: { id: number; employeeId: number }) =>
      appointmentsService.moveAppointment(id, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Rendez-vous déplacé');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors du déplacement');
    },
  });
};

// ============ CLIENTS ============

export const useClients = (filters?: ClientFilters) => {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: () => clientsService.getClients(filters),
  });
};

export const useClient = (id: number) => {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => clientsService.getClient(id),
    enabled: !!id,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  const { salon } = useTenant();

  return useMutation({
    mutationFn: (data: Partial<Client>) => {
      const salonId = getSalonIdWithFallback(salon);
      return clientsService.createClient(data, salonId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client créé avec succès');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la création du client');
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Client> }) =>
      clientsService.updateClient(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
      toast.success('Client mis à jour avec succès');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour du client');
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => clientsService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client supprimé avec succès');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la suppression du client');
    },
  });
};

// ============ EMPLOYEES ============

export const useEmployees = (filters?: EmployeeFilters) => {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => employeesService.getEmployees(filters),
  });
};

export const useEmployee = (id: number) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeesService.getEmployee(id),
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: import('@/services/employees.service').CreateEmployeeDTO) => employeesService.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employé créé avec succès');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la création de l\'employé');
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Employee> }) =>
      employeesService.updateEmployee(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
      toast.success('Employé mis à jour avec succès');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour de l\'employé');
    },
  });
};

export const useToggleEmployeeAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => employeesService.toggleAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Disponibilité mise à jour');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur');
    },
  });
};
