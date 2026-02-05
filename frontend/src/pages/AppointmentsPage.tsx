import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, Clock, User, MessageCircle, Globe, PhoneCall, UserRound, Calendar, Sparkles, Waves } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAppointments as useAppointmentsQuery, useEmployees, useClients, useServices } from '@/hooks/useApi';
import { GyeNyameSymbol, SankofaSymbol, AfricanStarSymbol, AdinkraSymbol } from '@/components/african-symbols/AfricanSymbols';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useTenantTheme } from '@/contexts/TenantThemeContext';

// Types pour les statuts d'appointments de l'API
type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
];

const statusColors: Record<AppointmentStatus, { bg: string; border: string; text: string; glow?: string }> = {
  PENDING: { 
    bg: 'bg-gradient-to-br from-secondary to-background', 
    border: 'border-border', 
    text: 'text-foreground',
    glow: 'shadow-primary/20'
  },
  CONFIRMED: { 
    bg: 'bg-gradient-to-br from-primary/90 to-primary/70', 
    border: 'border-primary/50', 
    text: 'text-primary-foreground',
    glow: 'shadow-primary/30'
  },
  IN_PROGRESS: { 
    bg: 'bg-gradient-to-br from-accent to-accent/70', 
    border: 'border-accent/50', 
    text: 'text-accent-foreground',
    glow: 'shadow-accent/30'
  },
  COMPLETED: { 
    bg: 'bg-gradient-to-br from-muted to-muted/70', 
    border: 'border-border', 
    text: 'text-muted-foreground'
  },
  CANCELLED: { 
    bg: 'bg-gradient-to-br from-destructive/20 to-destructive/10', 
    border: 'border-destructive/30', 
    text: 'text-destructive',
    glow: 'shadow-destructive/20'
  },
  NO_SHOW: { 
    bg: 'bg-gradient-to-br from-destructive/10 to-destructive/5', 
    border: 'border-destructive/20', 
    text: 'text-destructive/80',
    glow: 'shadow-destructive/15'
  },
};

export default function AppointmentsPage() {
  // Utiliser les hooks React Query
  const { data: appointmentsData } = useAppointmentsQuery();
  const { data: employeesData } = useEmployees();
  const { data: clientsData } = useClients();
  const { data: servicesData } = useServices();
  
  // Extraire les tableaux des réponses paginées
  const appointments = appointmentsData?.results || [];
  const employees = employeesData?.results || [];
  const clients = clientsData?.results || [];
  const services = servicesData?.results || [];
  
  const { theme } = useTenantTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | number>('all');
  const [hoveredTimeSlot, setHoveredTimeSlot] = useState<string | null>(null);

  const formattedDate = currentDate.toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => apt.date === formattedDate);

  const todayStats = useMemo(() => {
    const today = appointments.filter(apt => apt.date === formattedDate);
    return {
      total: today.length,
      pending: today.filter(apt => apt.status === 'PENDING').length,
      confirmed: today.filter(apt => apt.status === 'CONFIRMED').length,
      inProgress: today.filter(apt => apt.status === 'IN_PROGRESS').length,
      completed: today.filter(apt => apt.status === 'COMPLETED').length,
      cancelled: today.filter(apt => apt.status === 'CANCELLED').length,
    };
  }, [appointments, formattedDate]);
  
  const coiffeurs = employees.filter(e => e.role === 'COIFFEUR');
  const displayedEmployees = selectedEmployee === 'all' 
    ? coiffeurs 
    : coiffeurs.filter(e => e.id === selectedEmployee);

  const navigateDate = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const getAppointmentForSlot = (employeeId: number, time: string) => {
    return todayAppointments.find(apt => 
      apt.employee === employeeId && 
      apt.start_time === time
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-amber-200/20 via-orange-200/10 to-transparent rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-tr from-emerald-200/20 via-teal-200/10 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-lg animate-fade-in-up">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <GyeNyameSymbol size={32} animated={true} color="gradient" />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Rendez-vous
              </h1>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 font-medium">
              <SankofaSymbol size={18} animated={true} color="yellow" />
              Planification et gestion des RDV
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 min-w-fit">
            <div className="bg-gradient-to-br from-secondary/80 to-background/60 border border-border rounded-xl p-3 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-foreground">{todayStats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="bg-gradient-to-br from-primary/80 to-primary/60 border border-primary/50 rounded-xl p-3 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-primary-foreground">{todayStats.confirmed}</div>
              <div className="text-xs text-primary-foreground/80">Confirmés</div>
            </div>
            <div className="bg-gradient-to-br from-accent/80 to-accent/60 border border-accent/50 rounded-xl p-3 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-accent-foreground">{todayStats.inProgress}</div>
              <div className="text-xs text-accent-foreground/80">En cours</div>
            </div>
            <div className="bg-gradient-to-br from-muted/80 to-muted/60 border border-border rounded-xl p-3 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-muted-foreground">{todayStats.completed}</div>
              <div className="text-xs text-muted-foreground">Terminés</div>
            </div>
          </div>
        </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 relative shadow-md hover:shadow-glow-primary transition-all duration-300 hover:scale-105 group">
                <Plus className="w-4 h-4" />
                Nouveau RDV
                <AdinkraSymbol size={16} animated={true} color="yellow" />
              </Button>
            </DialogTrigger>
            <DialogContent className="border border-border bg-card/95 backdrop-blur-2xl rounded-2xl shadow-2xl animate-scale-in max-w-md">
              <DialogHeader className="border-b border-border pb-4">
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
                  <GyeNyameSymbol size={24} animated={true} color="gradient" />
                  Nouveau rendez-vous
                </DialogTitle>
              </DialogHeader>
              <form className="space-y-5 pt-4">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Client</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cli-1">Camille Leroy</SelectItem>
                      <SelectItem value="cli-2">Thomas Moreau</SelectItem>
                      <SelectItem value="cli-3">Julie Girard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Service</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="srv-1">Coupe Homme - 25 FCFA</SelectItem>
                      <SelectItem value="srv-2">Coupe Femme - 45 FCFA</SelectItem>
                      <SelectItem value="srv-4">Coloration - 80 FCFA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Coiffeur</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un coiffeur" />
                    </SelectTrigger>
                    <SelectContent>
                      {coiffeurs.map(emp => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.first_name} {emp.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-foreground font-medium">Date</Label>
                    <Input id="date" type="date" defaultValue={formattedDate} className="border-border focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-foreground font-medium">Heure</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Heure" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" className="shadow-md hover:shadow-glow-primary">
                    Créer le RDV
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Enhanced Date Navigation */}
        <div className="flex items-center justify-between bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-lg animate-fade-in-up">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigateDate(-1)} 
            className="hover:scale-110 transition-all duration-300 hover:bg-secondary group"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          </Button>
          
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold capitalize bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {currentDate.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h2>
              <Waves className="w-6 h-6 text-accent animate-pulse" />
            </div>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-1 bg-secondary/80 border border-border rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="font-medium text-foreground">{todayStats.total} rendez-vous</span>
              </div>
              {todayStats.pending > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-secondary/60 border border-border rounded-full">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <span className="font-medium text-muted-foreground">{todayStats.pending} en attente</span>
                </div>
              )}
              {todayStats.inProgress > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-accent/60 border border-accent/50 rounded-full">
                  <div className="w-2 h-2 bg-accent-foreground rounded-full animate-pulse" />
                  <span className="font-medium text-accent-foreground">{todayStats.inProgress} en cours</span>
                </div>
              )}
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigateDate(1)} 
            className="hover:scale-110 transition-all duration-300 hover:bg-secondary group"
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          </Button>
        </div>

        {/* Enhanced Employee Filter */}
        <div className="flex flex-wrap gap-3 animate-fade-in-up">
          <Button 
            variant={selectedEmployee === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedEmployee('all')}
            className="transition-all duration-300 hover:scale-105 border-border hover:border-primary group"
          >
            <span className="flex items-center gap-2">
              <AfricanStarSymbol size={14} animated={selectedEmployee === 'all'} color="yellow" />
              Tous les coiffeurs
            </span>
          </Button>
          {coiffeurs.map((emp, index) => (
            <Button 
              key={emp.id}
              variant={selectedEmployee === emp.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedEmployee(emp.id)}
              className="transition-all duration-300 hover:scale-105 border-border hover:border-primary group relative overflow-hidden"
              style={{ 
                animationDelay: `${index * 100}ms`,
                animation: 'fade-in-up 0.5s ease-out forwards'
              }}
            >
              <span className="flex items-center gap-2 relative z-10">
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground shadow-sm"
                  style={{ backgroundColor: 'hsl(var(--primary))' }}
                >
                  {emp.first_name[0]}
                </div>
                {emp.first_name}
                {selectedEmployee === emp.id && (
                  <AfricanStarSymbol size={10} animated={true} color="yellow" />
                )}
              </span>
              {selectedEmployee === emp.id && (
                <div className="absolute inset-0 bg-primary/20" />
              )}
            </Button>
          ))}
        </div>

        {/* Enhanced Calendar Grid */}
        <div className="overflow-x-auto rounded-2xl bg-card/80 backdrop-blur-xl border border-border shadow-xl">
          <div className="min-w-[700px] p-6">
            {/* Enhanced Header */}
            <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: `100px repeat(${displayedEmployees.length}, 1fr)` }}>
              <div className="p-3 font-bold text-foreground text-sm bg-gradient-to-r from-primary/20 to-transparent rounded-lg border-l-4 border-primary">
                <Clock className="w-4 h-4 mb-1" />
                Heure
              </div>
              {displayedEmployees.map((emp, index) => (
                <div 
                  key={emp.id} 
                  className="p-4 bg-gradient-to-br from-secondary/60 to-background/40 rounded-xl text-center animate-fade-in-down relative border border-border shadow-sm hover:shadow-md transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative">
                    <div 
                      className="w-14 h-14 mx-auto mb-2 flex items-center justify-center font-bold rounded-full shadow-lg relative ring-2 ring-primary/20"
                      style={{ backgroundColor: 'hsl(var(--primary))', color: 'white' }}
                    >
                      <span className="z-10 text-lg">{emp.first_name[0]}{emp.last_name[0]}</span>
                      <div className="absolute -top-1 -right-1">
                        <AfricanStarSymbol size={12} animated={true} color="yellow" />
                      </div>
                    </div>
                    <p className="font-bold text-foreground">{emp.first_name}</p>
                    <p className="text-xs text-muted-foreground">{emp.last_name}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Time Slots */}
            <div className="space-y-2">
              {timeSlots.map((time, timeIndex) => (
                <div 
                  key={time}
                  className="grid gap-3 animate-fade-in group"
                  style={{ 
                    gridTemplateColumns: `100px repeat(${displayedEmployees.length}, 1fr)`,
                    animationDelay: `${timeIndex * 40}ms`
                  }}
                  onMouseEnter={() => setHoveredTimeSlot(time)}
                  onMouseLeave={() => setHoveredTimeSlot(null)}
                >
                  <div className={cn(
                    "p-3 text-sm font-mono flex items-center justify-center rounded-lg transition-all duration-300",
                    hoveredTimeSlot === time 
                      ? "bg-gradient-to-r from-primary/20 to-secondary text-foreground font-bold shadow-md border border-primary/50" 
                      : "bg-gradient-to-r from-secondary/30 to-transparent text-muted-foreground"
                  )}>
                    <Clock className="w-4 h-4 mr-2" />
                    {time}
                  </div>
                  {displayedEmployees.map(emp => {
                    const appointment = getAppointmentForSlot(emp.id, time);
                    const client = appointment ? clients.find(c => c.id === appointment.client) : null;
                    const service = appointment ? services.find(s => s.id === appointment.service) : null;
                    const statusConfig = appointment ? statusColors[appointment.status] : null;
                    
                    return (
                      <div 
                        key={`${emp.id}-${time}`}
                        className={cn(
                          "min-h-[70px] rounded-xl p-3 transition-all duration-300 group relative overflow-hidden",
                          appointment 
                            ? `${statusConfig?.bg} ${statusConfig?.border} border-2 cursor-pointer hover:scale-[1.03] hover:shadow-lg`
                            : "bg-gradient-to-br from-white/40 to-amber-50/20 border border-dashed border-amber-200/30 hover:border-amber-300/50 hover:bg-white/60"
                        )}
                      >
                        {appointment && client && service ? (
                          <Link 
                            to={`/appointments/${appointment.id}`} 
                            className="block h-full"
                          >
                            <div className="text-xs space-y-1.5 h-full flex flex-col justify-center">
                              <div className="flex items-center gap-1.5 font-bold" style={{ color: statusConfig?.text }}>
                                <User className="w-3 h-3" />
                                {client.first_name} {client.last_name}
                              </div>
                              <div className="flex items-center gap-1.5 opacity-80" style={{ color: statusConfig?.text }}>
                                <Clock className="w-3 h-3" />
                                {service.name}
                              </div>
                              {appointment.source && (
                                <div className="flex items-center gap-1.5 mt-1">
                                  {appointment.source === 'whatsapp' && <MessageCircle className="w-3 h-3 text-green-600" />}
                                  {appointment.source === 'website' && <Globe className="w-3 h-3 text-blue-600" />}
                                  {appointment.source === 'phone' && <PhoneCall className="w-3 h-3 text-purple-600" />}
                                  {appointment.source === 'walk_in' && <UserRound className="w-3 h-3 text-orange-600" />}
                                  <span className="text-[10px] opacity-70" style={{ color: statusConfig?.text }}>
                                    {appointment.source === 'whatsapp' && 'WhatsApp'}
                                    {appointment.source === 'website' && 'Site'}
                                    {appointment.source === 'phone' && 'Tél'}
                                    {appointment.source === 'walk_in' && 'Sur place'}
                                  </span>
                                </div>
                              )}
                            </div>
                            {statusConfig?.glow && (
                              <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none", statusConfig.glow)} />
                            )}
                          </Link>
                            ) : (
                              <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-50 transition-opacity duration-300">
                                <div className="text-muted-foreground text-xs font-medium">Disponible</div>
                              </div>
                            )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
