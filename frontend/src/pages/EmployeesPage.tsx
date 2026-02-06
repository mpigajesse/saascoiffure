import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Mail, Phone, MoreHorizontal, Shield, Scissors, UserCircle, Users, Eye, EyeOff, Edit, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEmployees, useCreateEmployee } from '@/hooks/useEmployees';
import { EmployeeFilters } from '@/services/employees.service';
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
import { toast } from 'sonner';

type EmployeeRoleType = 'ADMIN' | 'COIFFEUR' | 'RECEPTIONNISTE';

const roleConfig: Record<EmployeeRoleType, { label: string; icon: React.ReactNode }> = {
  ADMIN: { label: 'Administrateur', icon: <Shield className="w-4 h-4" /> },
  COIFFEUR: { label: 'Coiffeur', icon: <Scissors className="w-4 h-4" /> },
  RECEPTIONNISTE: { label: 'Réceptionniste', icon: <UserCircle className="w-4 h-4" /> },
};

export default function EmployeesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'COIFFEUR' as EmployeeRoleType,
  });

  const { data, isLoading } = useEmployees({
    ...(selectedRole !== 'all' ? { role: selectedRole } : {})
  });

  const createEmployeeMutation = useCreateEmployee();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Fonction de validation du numéro gabonais
  const validateGabonPhone = (phone: string): boolean => {
    if (!phone) return true; // Optionnel

    // Nettoyer le numéro (enlever espaces, tirets et points)
    const cleaned = phone.replace(/[\s\-\.]/g, '');

    // Nouveau format (9 chiffres):
    // Moov: 062, 063, 065, 066 + 6 chiffres
    // Airtel: 074, 077 + 6 chiffres
    const moovPattern = /^0(62|63|65|66)\d{6}$/;
    const airtelPattern = /^0(74|77)\d{6}$/;

    // Format international
    const moovInternational = /^\+2410(62|63|65|66)\d{6}$/;
    const airtelInternational = /^\+2410(74|77)\d{6}$/;

    // Ancien format (8 chiffres) - accepté pour migration
    const oldMoovPattern = /^06\d{6}$/;
    const oldAirtelPattern = /^07\d{6}$/;

    return moovPattern.test(cleaned) ||
      airtelPattern.test(cleaned) ||
      moovInternational.test(cleaned) ||
      airtelInternational.test(cleaned) ||
      oldMoovPattern.test(cleaned) ||
      oldAirtelPattern.test(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.password || formData.password.length < 8) {
        toast.error("Le mot de passe doit contenir au moins 8 caractères");
        return;
      }

      // Validation téléphone gabonais
      if (formData.phone && !validateGabonPhone(formData.phone)) {
        toast.error("Numéro invalide. Moov: 062/063/065/066 XX XX XX, Airtel: 074/077 XX XX XX");
        return;
      }

      await createEmployeeMutation.mutateAsync({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });

      toast.success("Employé créé avec succès");
      setIsDialogOpen(false);
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'COIFFEUR',
      });
      setShowPassword(false);
    } catch (error: any) {
      // Afficher le message d'erreur du backend s'il existe
      const errorMessage = error?.response?.data?.phone?.[0] ||
        error?.response?.data?.detail ||
        "Erreur lors de la création de l'employé";
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const employees = data?.results || [];



  const getRandomColor = (name: string) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
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
            <p className="text-muted-foreground mt-1">
              {isLoading ? 'Chargement...' : `${employees.length} membres de l'équipe`}
            </p>
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Prénom"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Nom"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="mon_email@gmail.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe (pour connexion)</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Minimum 8 caractères"
                      required
                      minLength={8}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Ex: 074 12 34 56 ou 062 12 34 56"
                  />
                  <p className="text-xs text-muted-foreground">Format attendu: +241 XX XX XX XX XX</p>
                </div>
                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(val) => handleInputChange('role', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Administrateur</SelectItem>
                      <SelectItem value="COIFFEUR">Coiffeur</SelectItem>
                      <SelectItem value="RECEPTIONNISTE">Réceptionniste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="shadow-md hover:shadow-glow-primary"
                    disabled={createEmployeeMutation.isPending}
                  >
                    {createEmployeeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Enregistrer
                  </Button>
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
          {(Object.keys(roleConfig) as EmployeeRoleType[]).map((role) => (
            <Button
              key={role}
              variant={selectedRole === role ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRole(role)}
              className="gap-2 transition-all duration-200 hover:scale-105"
            >
              {roleConfig[role].icon}
              {roleConfig[role].label}
            </Button>
          ))}
        </div>

        {/* Employees grid */}
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((employee, index) => {
              // Handle lowercase role from backend vs uppercase config key if necessary
              // The backend serializer says: role = serializers.CharField(source='user.role', read_only=True)
              // User.ROLE_CHOICES usually uppercase keys 'ADMIN', etc.
              const roleKey = (employee.role?.toUpperCase() || 'COIFFEUR') as EmployeeRoleType;
              const role = roleConfig[roleKey] || roleConfig.COIFFEUR;
              const fullName = employee.full_name || `${employee.first_name} ${employee.last_name}`;
              const color = getRandomColor(fullName);

              return (
                <div
                  key={employee.id}
                  className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-14 h-14 flex items-center justify-center font-bold text-lg rounded-full shadow-md group-hover:shadow-glow group-hover:scale-110 transition-all duration-300 overflow-hidden"
                        style={{ backgroundColor: employee.photo ? 'transparent' : color, color: 'white' }}
                      >
                        {employee.photo ? (
                          <img src={employee.photo} alt={fullName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{employee.first_name?.[0]}{employee.last_name?.[0]}</span>
                        )}
                      </div>
                      <div>
                        <Link to={`/admin/employees/${employee.id}`}>
                          <h3 className="font-bold group-hover:text-primary transition-colors cursor-pointer hover:underline">
                            {fullName}
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
                          <Link to={`/admin/employees/${employee.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Voir détails
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/employees/${employee.id}/edit`}>
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
                      <span className="truncate">{employee.email || employee.user_email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground group-hover:translate-x-1 transition-transform delay-75">
                      <Phone className="w-4 h-4" />
                      <span>{employee.phone || "Non renseigné"}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-secondary rounded-lg p-3 text-center group-hover:shadow-sm transition-shadow">
                      <p className="text-2xl font-bold text-primary">{employee.today_appointments || 0}</p>
                      <p className="text-xs text-muted-foreground">RDV aujourd'hui</p>
                    </div>
                    <div className="bg-secondary rounded-lg p-3 text-center group-hover:shadow-sm transition-shadow">
                      <p className="text-2xl font-bold text-primary">{employee.total_appointments || 0}</p>
                      <p className="text-xs text-muted-foreground">RDV total</p>
                    </div>
                  </div>

                  <div className={cn(
                    "inline-block px-3 py-1 text-xs font-medium rounded-full",
                    employee.is_available
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {employee.is_available ? '● Actif' : '○ Inactif'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
