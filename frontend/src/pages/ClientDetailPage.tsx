import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Clock, Banknote, History, Pencil } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/contexts/TenantContext';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { AfricanStarSymbol } from '@/components/african-symbols/AfricanSymbols';
import { format } from 'date-fns';
import { apiClient } from '@/lib/api-client';
import type { Client, Appointment } from '@/types';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { salon } = useTenant();

  // Fetch client data
  const { data: client, isLoading: isLoadingClient } = useQuery<Client>({
    queryKey: ['client', id],
    queryFn: async () => {
      const response = await apiClient.get(`/clients/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });

  // Fetch client appointments
  const { data: clientAppointments = [] } = useQuery<Appointment[]>({
    queryKey: ['clientAppointments', id],
    queryFn: async () => {
      const response = await apiClient.get(`/appointments/?client=${id}`);
      return Array.isArray(response.data) ? response.data : (response.data.results || []);
    },
    enabled: !!id,
  });

  if (isLoadingClient) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <User className="w-16 h-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Client introuvable</h2>
          <p className="text-muted-foreground">Le client demandé n'existe pas ou a été supprimé.</p>
          <Button onClick={() => navigate('/clients')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux clients
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header avec bouton retour */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/clients')}
            className="hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="w-6 h-6 text-primary" />
              </div>
              Détails du client
            </h1>
            <p className="text-muted-foreground mt-1">Informations complètes sur le client</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carte informations personnelles */}
            <div className="bg-card border border-border rounded-xl p-8 space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <AfricanStarSymbol size={24} animated={true} color="gradient" />
                Informations personnelles
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Nom complet</label>
                  <p className="text-lg font-semibold">{client.first_name} {client.last_name}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${client.email}`} className="text-lg hover:text-primary transition-colors">
                      {client.email}
                    </a>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Téléphone</label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`tel:${client.phone}`} className="text-lg hover:text-primary transition-colors">
                      {client.phone}
                    </a>
                  </div>
                </div>

                {client.preferences && (
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Préférences</label>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <p className="text-lg">{client.preferences}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Historique des rendez-vous */}
            <div className="bg-card border border-border rounded-xl p-8 space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <History className="w-6 h-6" />
                Historique des rendez-vous
              </h2>

              {clientAppointments.length > 0 ? (
                <div className="space-y-4">
                  {clientAppointments.slice(0, 10).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-4 bg-secondary/50 rounded-lg border border-border hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold">
                            {format(new Date(appointment.date), 'dd MMMM yyyy')}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {appointment.startTime} - {appointment.endTime}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "px-3 py-1 text-xs font-medium rounded-full",
                            appointment.status === 'completed' && "bg-green-500/10 text-green-500",
                            appointment.status === 'confirmed' && "bg-blue-500/10 text-blue-500",
                            appointment.status === 'pending' && "bg-yellow-500/10 text-yellow-500",
                            appointment.status === 'cancelled' && "bg-red-500/10 text-red-500"
                          )}
                        >
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Aucun rendez-vous enregistré pour ce client.
                </p>
              )}
            </div>
          </div>

          {/* Colonne latérale - Statistiques */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold">Statistiques</h3>
              
              <div className="space-y-4">
                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <p className="text-3xl font-bold text-primary">{clientAppointments.length}</p>
                  <p className="text-sm text-muted-foreground">Rendez-vous</p>
                </div>

                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <p className="text-3xl font-bold text-primary">
                    {clientAppointments.filter(apt => apt.status === 'completed').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Complétés</p>
                </div>

                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <p className="text-3xl font-bold text-primary">{formatPrice(0, salon?.currency)}</p>
                  <p className="text-sm text-muted-foreground">Total dépensé</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-3">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate(`/clients/${client.id}/edit`)}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Modifier le client
              </Button>
              <Button className="w-full" variant="default">
                <Calendar className="w-4 h-4 mr-2" />
                Nouveau rendez-vous
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

