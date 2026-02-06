import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { SalonOpeningHour } from '@/types';
import { useTenant } from '@/contexts/TenantContext';

export function useOpeningHours() {
  const { salon } = useTenant();
  const [openingHours, setOpeningHours] = useState<SalonOpeningHour[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!salon?.id) return;
    setLoading(true);
    apiClient
      .get(`/api/v1/opening-hours/?salon=${salon.id}`)
      .then(res => {
        // Corrige le cas où l'API retourne {} ou null au lieu d'un tableau
        if (Array.isArray(res.data)) {
          setOpeningHours(res.data);
        } else if (res.data && typeof res.data === 'object' && 'results' in res.data && Array.isArray(res.data.results)) {
          setOpeningHours(res.data.results);
        } else {
          setOpeningHours([]);
        }
      })
      .catch(err => setError(err.response?.data?.detail || 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [salon?.id]);

  return { openingHours, loading, error, setOpeningHours };
}

export type { SalonOpeningHour };
