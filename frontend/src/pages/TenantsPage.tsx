import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Building2, Users, Calendar, CreditCard, MoreHorizontal, Eye, Edit, Trash2, Plus, ArrowRight, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAdmin } from '@/contexts/AdminContext';
import { useTenant } from '@/contexts/TenantContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Salon } from '@/types';

export default function TenantsPage() {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAdmin();
  const { salon } = useTenant();
  const [searchQuery, setSearchQuery] = useState('');

  // Récupérer la liste des salons (seulement pour superadmin)
  const { data: salons = [], isLoading } = useQuery<Salon[]>({
    queryKey: ['salons'],
    queryFn: async () => {
      const response = await apiClient.get('/salons/');
      // DRF peut retourner un objet paginé ou un tableau
      return Array.isArray(response.data) ? response.data : (response.data.results || []);
    },
    enabled: isSuperAdmin, // Ne faire la requête que si superadmin
  });

  // Cette page est réservée aux super-admins pour gérer plusieurs salons
  // Les admins normaux gèrent leur propre salon via les paramètres
  if (!isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestion des Salons</h1>
              <p className="text-muted-foreground mt-2">Accès restreint</p>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Accès limité</AlertTitle>
            <AlertDescription>
              Cette page est réservée aux super-administrateurs de la plateforme. 
              En tant qu'administrateur de salon, vous pouvez gérer votre établissement via la page{' '}
              <Link to="/settings" className="font-medium text-primary hover:underline">
                Paramètres
              </Link>.
            </AlertDescription>
          </Alert>

          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Votre Salon</h3>
            <p className="text-muted-foreground mb-6">
              {salon?.name || 'Chargement...'}
            </p>
            <Button onClick={() => navigate('/settings')}>
              Gérer mon salon
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Fonctionnalité pour super-admin
  // Filtrer les salons selon la recherche
  const filteredSalons = salons.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestion des Salons</h1>
            <p className="text-muted-foreground mt-2">Administration de tous les salons de la plateforme</p>
          </div>
          <Button onClick={() => navigate('/tenants/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau salon
          </Button>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un salon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Liste des salons */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement des salons...</p>
          </div>
        ) : filteredSalons.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'Aucun salon trouvé' : 'Aucun salon enregistré'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSalons.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                      style={{ backgroundColor: s.primary_color || '#d97038' }}
                    >
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{s.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {s.is_active ? (
                          <span className="text-green-600">● Actif</span>
                        ) : (
                          <span className="text-red-600">● Inactif</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <p className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {s.address}
                  </p>
                  {s.phone && (
                    <p className="flex items-center gap-2">
                      📞 {s.phone}
                    </p>
                  )}
                  {s.email && (
                    <p className="flex items-center gap-2">
                      ✉️ {s.email}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/tenants/${s.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Voir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/tenants/${s.id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
