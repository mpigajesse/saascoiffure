import { Calendar, Banknote, Users, TrendingUp, Clock, UserPlus, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { AppointmentCard } from '@/components/dashboard/AppointmentCard';
import { useAppointments, useEmployees, useClients, useServices } from '@/hooks/useApi';
import { useTenant } from '@/contexts/TenantContext';
import { formatPrice } from '@/lib/utils';
import heroImage from '@/assets/hero-salon.jpg';
import { 
  SankofaSymbol, 
  GyeNyameSymbol, 
  AkomaSymbol, 
  GabonMaskSymbol,
  AfricanStarSymbol,
  AfricanSymbolsDecoration 
} from '@/components/african-symbols/AfricanSymbols';

export default function Dashboard() {
  const { salon } = useTenant();
  
  // Utilisation des vrais hooks React Query
  const { data: appointmentsData, isLoading: appointmentsLoading } = useAppointments();
  const { data: employeesData, isLoading: employeesLoading } = useEmployees();
  const { data: clientsData, isLoading: clientsLoading } = useClients();
  const { data: servicesData, isLoading: servicesLoading } = useServices();
  
  // Extraire les tableaux des réponses paginées
  const appointments = appointmentsData?.results || [];
  const employees = employeesData?.results || [];
  const clients = clientsData?.results || [];
  const services = servicesData?.results || [];
  
  // Filtrer les rendez-vous d'aujourd'hui
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => apt.date === today);
  
  // Calculer les statistiques
  const todayRevenue = todayAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);
  const activeEmployees = employees.filter(e => e.is_active);
  
  const isLoading = appointmentsLoading || employeesLoading || clientsLoading || servicesLoading;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero section with immersive design */}
        <div className="relative h-56 lg:h-72 rounded-2xl overflow-hidden group">
          <img 
            src={heroImage} 
            alt="Salon" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
          
          {/* Decorative pattern avec couleurs gabonaises */}
          <div className="absolute inset-0 pattern-gabon opacity-20" />
          
          {/* Symboles africains décoratifs flottants */}
          <div className="absolute top-4 right-4 opacity-30 animate-float">
            <AfricanStarSymbol size={40} animated={true} color="gradient" />
          </div>
          <div className="absolute bottom-8 right-8 opacity-20 animate-float" style={{ animationDelay: '1s' }}>
            <GyeNyameSymbol size={32} animated={true} color="gradient" />
          </div>
          <div className="absolute top-1/2 right-1/4 opacity-25 animate-float" style={{ animationDelay: '2s' }}>
            <SankofaSymbol size={28} animated={true} color="gradient" />
          </div>
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center px-8 lg:px-12">
            <div className="text-background max-w-lg">
              <div className="flex items-center gap-2 mb-3 animate-fade-in-down">
                <div className="flex items-center gap-1">
                  <GabonMaskSymbol size={20} animated={true} color="yellow" />
                <Sparkles className="w-5 h-5 text-accent animate-pulse-glow" />
                </div>
                <span className="text-sm font-medium uppercase tracking-widest opacity-90">Bienvenue</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-3 animate-fade-in-left flex items-center gap-3">
                <AkomaSymbol size={48} animated={true} color="gradient" className="hidden lg:block" />
                Votre Salon
              </h1>
              <p className="text-lg opacity-90 animate-fade-in-up flex items-center gap-2" style={{ animationDelay: '200ms' }}>
                <SankofaSymbol size={20} animated={true} color="green" />
                Gérez votre activité en toute simplicité avec style
              </p>
            </div>
          </div>
          
          {/* Decorative accent avec gradient gabonais */}
          <div className="absolute bottom-0 left-0 right-0 h-1 gradient-gabon-horizontal" />
        </div>

        {/* Stats grid with staggered animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="RDV aujourd'hui"
            value={todayAppointments.length}
            icon={
              <div className="relative">
                <Calendar className="w-5 h-5 text-primary" />
                <div className="absolute -top-1 -right-1">
                  <AfricanStarSymbol size={12} animated={true} color="yellow" />
                </div>
              </div>
            }
            delay={0}
          />
          <StatCard
            title="CA aujourd'hui"
            value={`${formatPrice(todayRevenue, salon?.currency)}`}
            icon={
              <div className="relative">
                <Banknote className="w-5 h-5 text-primary" />
                <div className="absolute -top-1 -right-1">
                  <AkomaSymbol size={12} animated={true} color="green" />
                </div>
              </div>
            }
            delay={50}
          />
          <StatCard
            title="CA semaine"
            value={formatPrice(0, salon?.currency)}
            icon={
              <div className="relative">
                <TrendingUp className="w-5 h-5 text-primary" />
                <div className="absolute -top-1 -right-1">
                  <GyeNyameSymbol size={12} animated={true} color="blue" />
                </div>
              </div>
            }
            delay={100}
          />
          <StatCard
            title="CA mois"
            value={formatPrice(0, salon?.currency)}
            icon={
              <div className="relative">
                <Banknote className="w-5 h-5 text-primary" />
                <div className="absolute -top-1 -right-1">
                  <SankofaSymbol size={12} animated={true} color="gradient" />
                </div>
              </div>
            }
            delay={150}
          />
          <StatCard
            title="Total clients"
            value={clients.length}
            icon={
              <div className="relative">
                <Users className="w-5 h-5 text-primary" />
                <div className="absolute -top-1 -right-1">
                  <GabonMaskSymbol size={12} animated={true} color="yellow" />
                </div>
              </div>
            }
            delay={200}
          />
          <StatCard
            title="Nouveaux clients"
            value="0"
            subtitle="ce mois"
            icon={
              <div className="relative">
                <UserPlus className="w-5 h-5 text-primary" />
                <div className="absolute -top-1 -right-1">
                  <AfricanStarSymbol size={12} animated={true} color="gradient" />
                </div>
              </div>
            }
            delay={250}
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's appointments */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                Rendez-vous du jour
              </h2>
              <span className="text-sm text-muted-foreground font-mono bg-secondary px-3 py-1 rounded-full">
                {todayAppointments.length} RDV
              </span>
            </div>
            
            <div className="space-y-3">
              {todayAppointments.length > 0 ? (
                todayAppointments.map((apt, index) => (
                  <div 
                    key={apt.id} 
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <AppointmentCard 
                      appointment={apt} 
                      clients={clients}
                      employees={employees}
                      services={services}
                    />
                  </div>
                ))
              ) : (
                <div className="bg-card border border-border rounded-lg p-8 text-center animate-fade-in">
                  <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Aucun rendez-vous aujourd'hui</p>
                </div>
              )}
            </div>
          </div>

          {/* Employee activity */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Users className="w-5 h-5 text-accent-foreground" />
              </div>
              Équipe active
            </h2>
            
            <div className="space-y-3">
              {activeEmployees.map((employee, index) => {
                const employeeAppointments = todayAppointments.filter(apt => apt.employee === employee.id);
                
                return (
                  <div 
                    key={employee.id}
                    className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group animate-fade-in-right"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 flex items-center justify-center font-bold rounded-full shadow-md group-hover:shadow-glow transition-all duration-300 group-hover:scale-110 bg-primary text-primary-foreground"
                      >
                        {employee.first_name[0]}{employee.last_name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{employee.role.toLowerCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{employeeAppointments.length}</p>
                        <p className="text-xs text-muted-foreground">RDV</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
