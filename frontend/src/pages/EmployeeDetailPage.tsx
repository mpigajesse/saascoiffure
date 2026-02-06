import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  UserCircle,
  Mail,
  Phone,
  Scissors,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Shield,
  Lock // Ensure Lock is imported
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  user_email?: string;
  phone?: string;
  role: 'ADMIN' | 'COIFFEUR' | 'RECEPTIONNISTE';
  is_available: boolean;
  specialties?: string;
  bio?: string;
}

const roleConfig = {
  ADMIN: {
    label: 'Administrateur',
    className: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    icon: UserCircle
  },
  COIFFEUR: {
    label: 'Coiffeur',
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    icon: Scissors
  },
  RECEPTIONNISTE: {
    label: 'Réceptionniste',
    className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    icon: Phone
  },
};

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const response = await apiClient.get(`/api/v1/employees/${id}/`);
      setEmployee(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les détails de l\'employé',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!employee) return;

    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'employé "${employee.first_name} ${employee.last_name}" ? Cette action est irréversible.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/v1/employees/${id}/`);

      toast({
        title: "Employé supprimé",
        description: `L'employé "${employee.first_name} ${employee.last_name}" a été supprimé avec succès.`,
      });

      navigate('/admin/employees');
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p>Chargement...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <UserCircle className="w-16 h-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Employé introuvable</h2>
          <p className="text-muted-foreground">L'employé demandé n'existe pas.</p>
          <Button onClick={() => navigate('/admin/employees')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Vérifier que le rôle existe dans roleConfig
  const roleData = roleConfig[employee.role] || roleConfig.COIFFEUR;
  const RoleIcon = roleData.icon;

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
              onClick={() => navigate('/admin/employees')}
              className="hover:scale-105 transition-transform"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold bg-gradient-to-br from-primary to-primary/70"
              >
                {employee.first_name[0]}{employee.last_name[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{employee.first_name} {employee.last_name}</h1>
                <p className="text-muted-foreground text-sm">
                  Détails de l'employé
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                asChild
                variant="outline"
                className="gap-2"
              >
                <Link to={`/admin/employees/${id}/permissions`}>
                  <Shield className="w-4 h-4" />
                  Permissions
                </Link>
              </Button>
            )}
            <Button
              asChild
              variant="outline"
              className="gap-2"
            >
              <Link to={`/admin/employees/${id}/edit?tab=security`}>
                <Lock className="w-4 h-4" />
                Mot de passe
              </Link>
            </Button>
            <Button
              asChild
              className="gap-2"
            >
              <Link to={`/admin/employees/${id}/edit`}>
                <Edit className="w-4 h-4" />
                Modifier
              </Link>
            </Button>
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
            )}
          </div>
        </motion.div>

        {/* Statut et rôle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-3"
        >
          <Badge
            className={cn(
              "px-3 py-1.5 text-sm font-medium border flex items-center gap-2",
              roleData.className
            )}
          >
            <RoleIcon className="w-4 h-4" />
            {roleData.label}
          </Badge>
          <Badge
            className={cn(
              "px-3 py-1.5 text-sm font-medium border",
              employee.is_available
                ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
                : 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'
            )}
          >
            {employee.is_available ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Actif
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Inactif
              </>
            )}
          </Badge>
        </motion.div>

        {/* Informations détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations personnelles */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  Informations personnelles
                </CardTitle>
                <CardDescription>
                  Coordonnées et informations de l'employé
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <UserCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
                    <p className="text-sm">{employee.first_name} {employee.last_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm">{employee.email || employee.user_email}</p>
                  </div>
                </div>

                {employee.phone && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                      <p className="text-sm">{employee.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <RoleIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Rôle</p>
                    <p className="text-sm">{roleData.label}</p>
                  </div>
                </div>

                {employee.specialties && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Scissors className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Spécialités</p>
                      <p className="text-sm">{employee.specialties}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Bio */}
          {employee.bio && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-primary rounded-full" />
                    Biographie
                  </CardTitle>
                  <CardDescription>
                    À propos de cet employé
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {employee.bio}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
