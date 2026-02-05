import { Clock, User, Scissors, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AfricanStarSymbol } from '@/components/african-symbols/AfricanSymbols';
import type { Client, Employee, Service, Appointment } from '@/services';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: () => void;
  clients?: Client[];
  employees?: Employee[];
  services?: Service[];
}

type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

const statusConfig: Record<AppointmentStatus, { label: string; className: string; bgGradient: string; borderColor: string }> = {
  PENDING: { 
    label: 'En attente', 
    className: 'text-foreground',
    bgGradient: 'from-secondary/90 via-secondary/70 to-background/60',
    borderColor: 'border-border'
  },
  CONFIRMED: { 
    label: 'Confirmé', 
    className: 'text-primary-foreground',
    bgGradient: 'from-primary/90 via-primary/70 to-primary/60',
    borderColor: 'border-primary/50'
  },
  IN_PROGRESS: { 
    label: 'En cours', 
    className: 'text-accent-foreground',
    bgGradient: 'from-accent/90 via-accent/70 to-accent/60',
    borderColor: 'border-accent/50'
  },
  COMPLETED: { 
    label: 'Terminé', 
    className: 'text-muted-foreground',
    bgGradient: 'from-muted/90 via-muted/70 to-muted/60',
    borderColor: 'border-border'
  },
  CANCELLED: { 
    label: 'Annulé', 
    className: 'text-destructive',
    bgGradient: 'from-destructive/20 via-destructive/15 to-destructive/10',
    borderColor: 'border-destructive/30'
  },
  NO_SHOW: { 
    label: 'Absent', 
    className: 'text-destructive/80',
    bgGradient: 'from-destructive/15 via-destructive/10 to-destructive/5',
    borderColor: 'border-destructive/20'
  },
};

export function AppointmentCard({ appointment, onClick, clients = [], employees = [], services = [] }: AppointmentCardProps) {
  const client = clients.find(c => c.id === appointment.client);
  const employee = employees.find(e => e.id === appointment.employee);
  const service = services.find(s => s.id === appointment.service);
  const status = statusConfig[appointment.status];

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl rounded-xl overflow-hidden",
        "bg-gradient-to-br border-2 backdrop-blur-sm",
        onClick && "hover:shadow-2xl"
      )}
      style={{
        background: `linear-gradient(135deg, ${status.bgGradient})`,
        borderColor: status.borderColor.replace('border-', '')
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Sparkle effect */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
      </div>
      
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-card/60 rounded-lg shadow-sm border border-border">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <span className="font-mono font-bold text-lg text-foreground">
              {appointment.start_time} - {appointment.end_time}
            </span>
          </div>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 bg-card/60 rounded-lg shadow-sm border border-border">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold truncate text-sm text-foreground">
                {client ? `${client.first_name} ${client.last_name}` : 'Client inconnu'}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="p-1.5 bg-card/60 rounded-lg shadow-sm border border-border">
                <Scissors className="w-4 h-4 text-primary" />
              </div>
              <span className="truncate text-muted-foreground">
                {service?.name || 'Service inconnu'}
              </span>
              <span className="mx-1 text-muted-foreground">•</span>
              <span className="truncate text-muted-foreground">
                {employee?.first_name || 'Employé inconnu'}
              </span>
            </div>
          </div>

          <div className={cn(
            "px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm border",
            status.bgGradient,
            status.borderColor,
            status.className
          )}>
            <div className="flex items-center gap-1">
              {appointment.status === 'CONFIRMED' && <AfricanStarSymbol size={10} animated={true} color="primary" />}
              {appointment.status === 'IN_PROGRESS' && <AfricanStarSymbol size={10} animated={true} color="accent" />}
              {appointment.status === 'PENDING' && <AfricanStarSymbol size={10} animated={true} color="secondary" />}
              {status.label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
