import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Mail, Phone, MoreHorizontal, Shield, Scissors, UserCircle, Users, Eye, Edit } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockEmployees } from '@/data/mockData';
import { useAppointments } from '@/contexts/AppointmentsContext';
import { EmployeeRole } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const roleConfig: Record<EmployeeRole, { label: string; icon: React.ReactNode }> = {
  admin: { label: 'Administrateur', icon: <Shield className="w-4 h-4" /> },
  coiffeur: { label: 'Coiffeur', icon: <Scissors className="w-4 h-4" /> },
  receptionniste: { label: 'Réceptionniste', icon: <UserCircle className="w-4 h-4" /> },
};

export default function EmployeesPage() {
  const { appointments } = useAppointments();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const filteredEmployees = selectedRole === 'all'
    ? mockEmployees
    : mockEmployees.filter(e => e.role === selectedRole);

  // Calculate stats for each employee
  const getEmployeeStats = (employeeId: string) => {
    const employeeAppointments = appointments.filter(apt => apt.employeeId === employeeId);
    return {
      totalAppointments: employeeAppointments.length,
      todayAppointments: employeeAppointments.filter(apt => apt.date === '2026-01-30').length,
    };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="animate-fade-in-left">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              Employés
            </h1>
            <p className="text-muted-foreground mt-1">{mockEmployees.length} membres de l'équipe</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-md hover:shadow-glow-primary transition-all duration-300 hover:scale-105">
                <Plus className="w-4 h-4" />
                Nouvel employé
              </Button>
            </DialogTrigger>
            <DialogContent className="border border-border rounded-xl animate-scale-in">
              <DialogHeader>
                <DialogTitle>Ajouter un employé</DialogTitle>
              </DialogHeader>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input id="firstName" placeholder="Prénom" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input id="lastName" placeholder="Nom" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@salonpro.fr" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" placeholder="+33 6 XX XX XX XX" />
                </div>
                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="coiffeur">Coiffeur</SelectItem>
                      <SelectItem value="receptionniste">Réceptionniste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" className="shadow-md hover:shadow-glow-primary">Enregistrer</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Role filter */}
        <div className="flex flex-wrap gap-2 animate-fade-in">
          <Button 
            variant={selectedRole === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRole('all')}
            className="transition-all duration-200 hover:scale-105"
          >
            Tous
          </Button>
          {Object.entries(roleConfig).map(([role, config]) => (
            <Button 
              key={role}
              variant={selectedRole === role ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRole(role)}
              className="gap-2 transition-all duration-200 hover:scale-105"
            >
              {config.icon}
              {config.label}
            </Button>
          ))}
        </div>

        {/* Employees grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee, index) => {
            const stats = getEmployeeStats(employee.id);
            const role = roleConfig[employee.role];
            
            return (
              <div 
                key={employee.id}
                className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-14 h-14 flex items-center justify-center font-bold text-lg rounded-full shadow-md group-hover:shadow-glow group-hover:scale-110 transition-all duration-300"
                      style={{ backgroundColor: employee.color, color: 'white' }}
                    >
                      {employee.firstName[0]}{employee.lastName[0]}
                    </div>
                    <div>
                      <Link to={`/employees/${employee.id}`}>
                        <h3 className="font-bold group-hover:text-primary transition-colors cursor-pointer hover:underline">
                          {employee.firstName} {employee.lastName}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        {role.icon}
                        <span>{role.label}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/employees/${employee.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir détails
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/employees/${employee.id}/edit`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground group-hover:translate-x-1 transition-transform">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground group-hover:translate-x-1 transition-transform delay-75">
                    <Phone className="w-4 h-4" />
                    <span>{employee.phone}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-secondary rounded-lg p-3 text-center group-hover:shadow-sm transition-shadow">
                    <p className="text-2xl font-bold text-primary">{stats.todayAppointments}</p>
                    <p className="text-xs text-muted-foreground">RDV aujourd'hui</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-3 text-center group-hover:shadow-sm transition-shadow">
                    <p className="text-2xl font-bold text-primary">{stats.totalAppointments}</p>
                    <p className="text-xs text-muted-foreground">RDV total</p>
                  </div>
                </div>

                <div className={cn(
                  "inline-block px-3 py-1 text-xs font-medium rounded-full",
                  employee.isActive 
                    ? "bg-primary/10 text-primary" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {employee.isActive ? '● Actif' : '○ Inactif'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
