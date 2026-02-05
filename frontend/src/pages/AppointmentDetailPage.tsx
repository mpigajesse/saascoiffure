import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Scissors, 
  Mail, 
  Phone, 
  MapPin,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard,
  FileText,
  Building2,
  MessageCircle,
  Globe,
  PhoneCall,
  UserRound,
  X,
  CalendarX,
  CalendarClock
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
import { Appointment, AppointmentStatus } from '@/types';
import { useAppointments } from '@/contexts/AppointmentsContext';
import { getServiceById } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const statusConfig: Record<AppointmentStatus, { 
  label: string; 
  className: string;
  icon: React.ReactNode;
}> = {
  pending: { 
    label: 'En attente', 
    className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
    icon: <AlertCircle className="w-4 h-4" />
  },
  confirmed: { 
    label: 'Confirmé', 
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    icon: <CheckCircle2 className="w-4 h-4" />
  },
  in_progress: { 
    label: 'En cours', 
    className: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    icon: <Clock className="w-4 h-4" />
  },
  completed: { 
    label: 'Terminé', 
    className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    icon: <CheckCircle2 className="w-4 h-4" />
  },
  cancelled: { 
    label: 'Annulé', 
    className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    icon: <XCircle className="w-4 h-4" />
  },
  no_show: { 
    label: 'Absent', 
    className: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
    icon: <XCircle className="w-4 h-4" />
  },
  rescheduled: { 
    label: 'Reporté', 
    className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
    icon: <CalendarClock className="w-4 h-4" />
  },
};

const cancellationReasons = [
  { value: 'client_request', label: 'Demande du client' },
  { value: 'salon_unavailable', label: 'Salon indisponible' },
  { value: 'weather', label: 'Conditions météorologiques' },
  { value: 'emergency', label: 'Urgence' },
  { value: 'other', label: 'Autre' },
];

const rescheduleReasons = [
  { value: 'client_request', label: 'Demande du client' },
  { value: 'salon_unavailable', label: 'Salon indisponible' },
  { value: 'conflict', label: 'Conflit d\'horaire' },
  { value: 'preference', label: 'Préférence du client' },
  { value: 'other', label: 'Autre' },
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
];

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { appointments, clients, getClientById, updateAppointmentStatus } = useAppointments();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelNotes, setCancelNotes] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState<string>('');
  const [rescheduleNotes, setRescheduleNotes] = useState('');
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [newTime, setNewTime] = useState('');

  const appointment = id ? appointments.find(apt => apt.id === id) : null;

  if (!appointment) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Calendar className="w-16 h-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Rendez-vous introuvable</h2>
          <p className="text-muted-foreground">Le rendez-vous demandé n'existe pas.</p>
          <Button onClick={() => navigate('/appointments')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const client = getClientById(appointment.clientId);
  const service = getServiceById(appointment.serviceId);
  const statusInfo = statusConfig[appointment.status];

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    setIsUpdatingStatus(true);
    try {
      updateAppointmentStatus(appointment.id, newStatus);
      toast({
        title: "Statut mis à jour",
        description: `Le statut du rendez-vous a été changé en "${statusConfig[newStatus].label}".`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du statut.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Cette action est irréversible.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Rendez-vous supprimé",
        description: "Le rendez-vous a été supprimé avec succès.",
      });
      
      navigate('/appointments');
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

  const handleCancel = () => {
    if (!cancelReason) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un motif d'annulation.",
        variant: "destructive",
      });
      return;
    }
    
    const updateData: Partial<Appointment> = {
      cancellationReason: cancelReason as any,
      cancellationNotes: cancelNotes || undefined,
    };
    
    updateAppointmentStatus(appointment.id, 'cancelled', updateData);
    
    toast({
      title: "Rendez-vous annulé",
      description: "Le rendez-vous a été annulé avec succès.",
    });
    
    setShowCancelDialog(false);
    setCancelReason('');
    setCancelNotes('');
  };

  const handleReschedule = () => {
    if (!newDate || !newTime || !rescheduleReason) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }
    
    const newDateString = format(newDate, 'yyyy-MM-dd');
    const updateData: Partial<Appointment> = {
      originalDate: appointment.date,
      originalStartTime: appointment.startTime,
      date: newDateString,
      startTime: newTime,
      rescheduleReason: rescheduleReason as any,
      rescheduleNotes: rescheduleNotes || undefined,
    };
    
    updateAppointmentStatus(appointment.id, 'rescheduled', updateData);
    
    toast({
      title: "Rendez-vous reporté",
      description: `Le rendez-vous a été reporté au ${format(newDate, 'dd MMMM yyyy', { locale: fr })} à ${newTime}.`,
    });
    
    setShowRescheduleDialog(false);
    setRescheduleReason('');
    setRescheduleNotes('');
    setNewDate(undefined);
    setNewTime('');
  };

  const appointmentDate = new Date(appointment.date);
  const startTime = appointment.startTime;
  const endTime = appointment.endTime;

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
              onClick={() => navigate('/appointments')}
              className="hover:scale-105 transition-transform"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Détails du rendez-vous</h1>
                <p className="text-muted-foreground text-sm">
                  {format(appointmentDate, "EEEE d MMMM yyyy", { locale: fr })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/appointments/${id}/edit`}>
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
              statusInfo.className
            )}
          >
            {statusInfo.icon}
            {statusInfo.label}
          </Badge>
          
          {/* Actions rapides */}
          <div className="flex gap-2">
            {appointment.status !== 'completed' && appointment.status !== 'cancelled' && appointment.status !== 'rescheduled' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowRescheduleDialog(true)}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <CalendarClock className="w-4 h-4 mr-2" />
                  Reporter
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowCancelDialog(true)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </>
            )}
            {appointment.status !== 'completed' && appointment.status !== 'cancelled' && appointment.status !== 'rescheduled' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isUpdatingStatus}>
                    Changer le statut
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {Object.entries(statusConfig).map(([status, config]) => {
                    if (status === appointment.status) return null;
                    if (status === 'no_show' && appointment.status !== 'confirmed') return null;
                    if (status === 'rescheduled' || status === 'cancelled') return null; // Géré par les boutons dédiés
                    return (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => handleStatusChange(status as AppointmentStatus)}
                      >
                        {config.icon}
                        <span className="ml-2">{config.label}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </motion.div>

        {/* Informations principales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations du rendez-vous */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  Informations du rendez-vous
                </CardTitle>
                <CardDescription>
                  Détails de la réservation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Date</p>
                      <p className="text-sm font-semibold">
                        {format(appointmentDate, "EEEE d MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Horaire</p>
                      <p className="text-sm font-semibold">
                        {startTime} - {endTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Scissors className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Service</p>
                      <p className="text-sm font-semibold">{service?.name || 'Service introuvable'}</p>
                      {service && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {service.price.toLocaleString()} FCFA • {service.duration} min
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Montant</p>
                      <p className="text-sm font-semibold">
                        {service ? `${service.price.toLocaleString()} FCFA` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                        <p className="text-sm bg-muted/50 rounded-lg p-3">{appointment.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Informations client */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  Client
                </CardTitle>
                <CardDescription>
                  Informations du client
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {client ? (
                  <>
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {client.firstName[0]}{client.lastName[0]}
                      </div>
                      <div>
                        <p className="font-semibold">{client.firstName} {client.lastName}</p>
                        <Link 
                          to={`/clients/${client.id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          Voir le profil
                        </Link>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm truncate">{client.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Téléphone</p>
                          <p className="text-sm">{client.phone}</p>
                        </div>
                      </div>

                      {client.preferences && (
                        <div className="flex items-start gap-3">
                          <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Préférences</p>
                            <p className="text-sm">{client.preferences}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Client introuvable</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Informations supplémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  Informations système
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID du rendez-vous</span>
                  <span className="font-mono text-xs">{appointment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Créé le</span>
                  <span>
                    {format(new Date(appointment.createdAt), "d MMM yyyy à HH:mm", { locale: fr })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Salon ID</span>
                  <span className="font-mono text-xs">{appointment.salonId}</span>
                </div>
                {appointment.source && (
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="text-muted-foreground">Source</span>
                    <Badge 
                      className={cn(
                        "flex items-center gap-1",
                        appointment.source === 'whatsapp' && "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
                        appointment.source === 'website' && "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
                        appointment.source === 'phone' && "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
                        appointment.source === 'walk_in' && "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20"
                      )}
                    >
                      {appointment.source === 'whatsapp' && <MessageCircle className="w-3 h-3" />}
                      {appointment.source === 'website' && <Globe className="w-3 h-3" />}
                      {appointment.source === 'phone' && <PhoneCall className="w-3 h-3" />}
                      {appointment.source === 'walk_in' && <UserRound className="w-3 h-3" />}
                      {appointment.source === 'whatsapp' && 'WhatsApp'}
                      {appointment.source === 'website' && 'Site web'}
                      {appointment.source === 'phone' && 'Téléphone'}
                      {appointment.source === 'walk_in' && 'Sur place'}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  asChild
                >
                  <Link to={`/clients/${appointment.clientId}`}>
                    <User className="w-4 h-4" />
                    Voir le profil client
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  asChild
                >
                  <Link to={`/services/${appointment.serviceId}`}>
                    <Scissors className="w-4 h-4" />
                    Voir le service
                  </Link>
                </Button>
                {appointment.status === 'pending' && (
                  <Button 
                    variant="default" 
                    className="w-full justify-start gap-2 bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground"
                    onClick={() => handleStatusChange('confirmed')}
                    disabled={isUpdatingStatus}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmer le rendez-vous
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Dialog d'annulation */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Annuler le rendez-vous</DialogTitle>
              <DialogDescription>
                Veuillez sélectionner un motif d'annulation et ajouter des notes si nécessaire.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Motif d'annulation *</Label>
                <Select value={cancelReason} onValueChange={setCancelReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un motif" />
                  </SelectTrigger>
                  <SelectContent>
                    {cancellationReasons.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes (optionnel)</Label>
                <Textarea
                  placeholder="Ajoutez des détails sur l'annulation..."
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowCancelDialog(false);
                setCancelReason('');
                setCancelNotes('');
              }}>
                Annuler
              </Button>
              <Button
                onClick={handleCancel}
                className="bg-red-600 hover:bg-red-700"
              >
                Confirmer l'annulation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de report */}
        <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reporter le rendez-vous</DialogTitle>
              <DialogDescription>
                Sélectionnez une nouvelle date et heure, puis indiquez le motif du report.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nouvelle date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {newDate ? format(newDate, 'dd MMMM yyyy', { locale: fr }) : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={newDate}
                        onSelect={setNewDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Nouvelle heure *</Label>
                  <Select value={newTime} onValueChange={setNewTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une heure" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Motif du report *</Label>
                <Select value={rescheduleReason} onValueChange={setRescheduleReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un motif" />
                  </SelectTrigger>
                  <SelectContent>
                    {rescheduleReasons.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes (optionnel)</Label>
                <Textarea
                  placeholder="Ajoutez des détails sur le report..."
                  value={rescheduleNotes}
                  onChange={(e) => setRescheduleNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowRescheduleDialog(false);
                setRescheduleReason('');
                setRescheduleNotes('');
                setNewDate(undefined);
                setNewTime('');
              }}>
                Annuler
              </Button>
              <Button
                onClick={handleReschedule}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Confirmer le report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

