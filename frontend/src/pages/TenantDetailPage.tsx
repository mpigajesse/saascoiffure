import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Globe, 
  CreditCard,
  Users,
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Palette
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from '@/hooks/use-toast';
import { Salon } from '@/types';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

const statusConfig = {
  active: { 
    label: 'Actif', 
    icon: CheckCircle2,
    className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20' 
  },
  suspended: { 
    label: 'Suspendu', 
    icon: AlertCircle,
    className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20' 
  },
  inactive: { 
    label: 'Inactif', 
    icon: XCircle,
    className: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20' 
  },
};

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectTenant } = useAdmin();
  const [isDeleting, setIsDeleting] = useState(false);

  // Récupérer les détails du salon depuis l'API
  const { data: tenant, isLoading, error } = useQuery<Salon>({
    queryKey: ['salon', id],
    queryFn: async () => {
      try {
        console.log(`Fetching salon details for ID: ${id}`);
        const response = await apiClient.get(`/salons/${id}/`);
        console.log(`Success! Salon data:`, response.data);
        return response.data;
      } catch (err) {
        console.error(`Error fetching salon ${id}:`, err);
        throw err;
      }
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Chargement des détails du salon...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !tenant) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Building2 className="w-16 h-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Salon introuvable</h2>
          <p className="text-muted-foreground">Le salon demandé n'existe pas.</p>
          <Button onClick={() => navigate('/tenants')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const status = tenant.is_active ? 'active' : 'inactive';
  const StatusIcon = statusConfig[status].icon;

  const handleExploreDashboard = () => {
    selectTenant(tenant);
    toast({
      title: "Salon sélectionné",
      description: `Vous explorez maintenant le dashboard de ${tenant.name}`,
    });
    navigate('/dashboard');
  };

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le salon "${tenant.name}" ? Cette action est irréversible.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await apiClient.delete(`/salons/${id}/`);
      
      toast({
        title: "Salon supprimé",
        description: `Le salon "${tenant.name}" a été supprimé avec succès.`,
      });
      
      navigate('/tenants');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/tenants')}
              className="hover:scale-105 transition-transform"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{tenant.name}</h1>
                <p className="text-muted-foreground text-sm">
                  Détails du salon
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleExploreDashboard}
              className="gap-2 bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground"
            >
              <ArrowRight className="w-4 h-4" />
              Explorer le dashboard
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/tenants/${id}/edit`} className="flex items-center">
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? 'Suppression...' : 'Supprimer'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Statut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-3"
        >
          <Badge 
            className={cn(
              "px-3 py-1.5 text-sm font-medium border flex items-center gap-2",
              statusConfig[status].className
            )}
          >
            <StatusIcon className="w-4 h-4" />
            {statusConfig[status].label}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Créé le {new Date(tenant.created_at).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </motion.div>

        {/* Informations détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations de contact */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  Informations de contact
                </CardTitle>
                <CardDescription>
                  Coordonnées et informations du salon
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm">{tenant.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                    <p className="text-sm">{tenant.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Adresse</p>
                    <p className="text-sm">{tenant.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Configuration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  Configuration
                </CardTitle>
                <CardDescription>
                  Paramètres et préférences du salon
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Heures d'ouverture</p>
                    <p className="text-sm">{tenant.opening_hours || 'Non spécifié'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Devise</p>
                    <p className="text-sm">{tenant.currency}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Fuseau horaire</p>
                    <p className="text-sm">{tenant.timezone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Palette className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Couleur principale</p>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border border-border" 
                        style={{ backgroundColor: tenant.primary_color }}
                      />
                      <p className="text-sm">{tenant.primary_color}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
