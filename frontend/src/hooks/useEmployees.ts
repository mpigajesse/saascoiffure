import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesService, EmployeeFilters, CreateEmployeeDTO, UpdateEmployeeDTO } from '@/services/employees.service';
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

export const EMPLOYEE_KEYS = {
  all: ['employees'] as const,
  lists: () => [...EMPLOYEE_KEYS.all, 'list'] as const,
  list: (filters: EmployeeFilters) => [...EMPLOYEE_KEYS.lists(), filters] as const,
  details: () => [...EMPLOYEE_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...EMPLOYEE_KEYS.details(), id] as const,
};

export function useEmployees(filters?: EmployeeFilters) {
  const { salon } = useTenant();
  const salonId = getSalonIdWithFallback(salon);
  
  // Ensure salonId is included in filters
  const queryFilters = { ...filters, salon: salonId };

  return useQuery({
    queryKey: EMPLOYEE_KEYS.list(queryFilters),
    queryFn: () => employeesService.getEmployees(queryFilters),
    enabled: !!salonId,
  });
}

export function useEmployee(id: number) {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.detail(id),
    queryFn: () => employeesService.getEmployee(id),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const { salon } = useTenant();

  return useMutation({
    mutationFn: (data: CreateEmployeeDTO) => {
        const salonId = getSalonIdWithFallback(salon);
        return employeesService.createEmployee(data, salonId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeDTO }) => 
      employeesService.updateEmployee(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.detail(data.id) });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => employeesService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
    },
  });
}

export function useToggleEmployeeAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => employeesService.toggleAvailability(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.detail(data.id) });
    },
  });
}
