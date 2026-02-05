import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  UserCircle, 
  Mail, 
  Phone, 
  Calendar,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  Scissors,
  CreditCard
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
import { Employee, Appointment } from '@/types';
import { useAppointments } from '@/contexts/AppointmentsContext';
import { toast } from '@/hooks/use-toast';

// Mock data - Dans une vraie app, cela viendrait de l'API
const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    salonId: 'salon-1',
    firstName: 'Mireille',
    lastName: 'Nguema',
    email: 'mireille@salon-mireille.ga',
    phone: '+241 06 11 22 33 44',
    role: 'admin',
    avatar: undefined,
    color: '#15 70% 45%',
    isActive: true,
  },
  {
    id: 'emp-2',
    salonId: 'salon-1',
    firstName: 'Awa',
    lastName: 'Diallo',
    email: 'awa@salon-mireille.ga',
    phone: '+241 06 22 33 44 55',
    role: 'coiffeur',
    avatar: undefined,
    color: '#42 85% 55%',
    isActive: true,
  },
  {
    id: 'emp-3',
    salonId: 'salon-1',
    firstName: 'Koffi',
    lastName: 'Traoré',
    email: 'koffi@salon-mireille.ga',
    phone: '+241 06 33 44 55 66',
    role: 'coiffeur',
    avatar: undefined,
    color: '#140 40% 35%',
    isActive: true,
  },
  {
    id: 'emp-4',
    salonId: 'salon-1',
    firstName: 'Fatou',
    lastName: 'Mba',
    email: 'fatou@salon-mireille.ga',
    phone: '+241 06 44 55 66 77',
    role: 'receptionniste',
    avatar: undefined,
    color: '#25 60% 40%',
    isActive: true,
  },
];

const roleConfig = {
  admin: { 
    label: 'Administrateur', 
    className: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    icon: UserCircle
  },
  coiffeur: { 
    label: 'Coiffeur', 
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    icon: Scissors
  },
  receptionniste: { 
    label: 'Réceptionniste', 
    className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    icon: Phone
  },
};

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { appointments } = useAppointments();
  const [isDeleting, setIsDeleting] = useState(false);

  const employee = id ? mockEmployees.find(emp => emp.id === id) : null;

  // Filtrer les rendez-vous de cet employé
  const employeeAppointments = employee 
    ? appointments.filter(apt => apt.employeeId === employee.id)
    : [];

  // Statistiques
  const todayAppointments = employeeAppointments.filter(apt => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  }).length;

  const upcomingAppointments = employeeAppointments.filter(apt => {
    const aptDate = new Date(apt.date + 'T' + apt.startTime);
    return aptDate > new Date() && apt.status !== 'completed' && apt.status !== 'cancelled';
  }).length;

  const completedAppointments = employeeAppointments.filter(apt => apt.status === 'completed').length;

  if (!employee) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <UserCircle className="w-16 h-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Employé introuvable</h2>
          <p className="text-muted-foreground">L'employé demandé n'existe pas.</p>
          <Button onClick={() => navigate('/employees')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const RoleIcon = roleConfig[employee.role].icon;

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'employé "${employee.firstName} ${employee.lastName}" ? Cette action est irréversible.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Employé supprimé",
        description: `L'employé "${employee.firstName} ${employee.lastName}" a été supprimé avec succès.`,
      });
      
      navigate('/employees');
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
              onClick={() => navigate('/employees')}
              className="hover:scale-105 transition-transform"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: `hsl(${employee.color})` }}
              >
                {employee.firstName[0]}{employee.lastName[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{employee.firstName} {employee.lastName}</h1>
                <p className="text-muted-foreground text-sm">
                  Détails de l'employé
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              asChild
              className="gap-2 bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground"
            >
              <Link to={`/employees/${id}/edit`}>
                <Edit className="w-4 h-4" />
                Modifier
              </Link>
            </Button>
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
              roleConfig[employee.role].className
            )}
          >
            <RoleIcon className="w-4 h-4" />
            {roleConfig[employee.role].label}
          </Badge>
          <Badge 
            className={cn(
              "px-3 py-1.5 text-sm font-medium border",
              employee.isActive 
                ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
                : 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'
            )}
          >
            {employee.isActive ? (
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

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  RDV aujourd'hui
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <p className="text-2xl font-bold">{todayAppointments}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  RDV à venir
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <p className="text-2xl font-bold">{upcomingAppointments}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  RDV complétés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-2xl font-bold">{completedAppointments}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total RDV
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-amber-600" />
                  <p className="text-2xl font-bold">{employeeAppointments.length}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

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
                    <p className="text-sm">{employee.firstName} {employee.lastName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm">{employee.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                    <p className="text-sm">{employee.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <RoleIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Rôle</p>
                    <p className="text-sm">{roleConfig[employee.role].label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Rendez-vous récents */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  Rendez-vous récents
                </CardTitle>
                <CardDescription>
                  Derniers rendez-vous de cet employé
                </CardDescription>
              </CardHeader>
              <CardContent>
                {employeeAppointments.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {employeeAppointments.slice(0, 10).map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(apt.date).toLocaleDateString('fr-FR', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short'
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {apt.startTime} - {apt.endTime}
                          </p>
                        </div>
                        <Badge 
                          className={cn(
                            "text-xs",
                            apt.status === 'completed' ? 'bg-green-500/10 text-green-700' :
                            apt.status === 'pending' ? 'bg-yellow-500/10 text-yellow-700' :
                            apt.status === 'cancelled' ? 'bg-red-500/10 text-red-700' :
                            'bg-blue-500/10 text-blue-700'
                          )}
                        >
                          {apt.status === 'completed' ? 'Terminé' :
                           apt.status === 'pending' ? 'En attente' :
                           apt.status === 'cancelled' ? 'Annulé' :
                           apt.status === 'confirmed' ? 'Confirmé' : apt.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun rendez-vous</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}

