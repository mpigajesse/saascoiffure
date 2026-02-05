import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCircle, Save, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Employee, EmployeeRole } from '@/types';
import { motion } from 'framer-motion';

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

export default function EditEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormData] = useState<Partial<Employee>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'coiffeur',
    isActive: true,
    color: '15 70% 45%',
  });

  // Charger les données de l'employé
  useEffect(() => {
    if (id) {
      setIsLoadingData(true);
      // Simuler le chargement des données
      setTimeout(() => {
        const employee = mockEmployees.find(emp => emp.id === id);
        if (employee) {
          setFormData({
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            phone: employee.phone,
            role: employee.role,
            isActive: employee.isActive,
            color: employee.color,
          });
        } else {
          toast({
            title: "Employé introuvable",
            description: "L'employé demandé n'existe pas.",
            variant: "destructive",
          });
          navigate('/employees');
        }
        setIsLoadingData(false);
      }, 500);
    }
  }, [id, navigate]);

  const handleChange = (field: keyof Employee, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Email invalide",
        description: "Veuillez entrer une adresse email valide.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validation téléphone (format gabonais)
    const phoneRegex = /^\+241\s?0[6-7]\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      toast({
        title: "Téléphone invalide",
        description: "Format attendu: +241 06 12 34 56 78",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Ici, on ferait l'appel API réel pour mettre à jour l'employé
      // const response = await api.put(`/employees/${id}`, formData);

      toast({
        title: "Employé modifié avec succès",
        description: `L'employé "${formData.firstName} ${formData.lastName}" a été modifié avec succès.`,
      });

      // Rediriger vers la page de détails
      navigate(`/employees/${id}`);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification de l'employé.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Chargement des données...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/employees/${id}`)}
            className="hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Modifier l'employé</h1>
              <p className="text-muted-foreground text-sm">
                Modifier les informations de l'employé
              </p>
            </div>
          </div>
        </motion.div>

        {/* Formulaire */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-xl p-6 space-y-6"
        >
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <div className="w-1 h-6 bg-primary rounded-full" />
              Informations personnelles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  Prénom <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="Ex: Awa, Fatou, Koffi, Mireille"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Nom <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Ex: Diallo, Traoré, Mba, Nguema"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  required
                  className="h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Ex: awa.diallo@salon-mireille.ga"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Téléphone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Ex: +241 06 12 34 56 78"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Format: +241 06 12 34 56 78
                </p>
              </div>
            </div>
          </div>

          {/* Rôle et statut */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <div className="w-1 h-6 bg-primary rounded-full" />
              Rôle et statut
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  Rôle <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleChange('role', value as EmployeeRole)}
                >
                  <SelectTrigger id="role" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="coiffeur">Coiffeur</SelectItem>
                    <SelectItem value="receptionniste">Réceptionniste</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive" className="text-sm font-medium">
                  Statut
                </Label>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Employé actif</p>
                    <p className="text-xs text-muted-foreground">
                      L'employé peut se connecter et recevoir des rendez-vous
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleChange('isActive', checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Aperçu */}
          <div className="pt-4 border-t border-border">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-primary rounded-full" />
              Aperçu
            </h2>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: `hsl(${formData.color})` }}
                >
                  {formData.firstName?.[0] || 'E'}{formData.lastName?.[0] || 'E'}
                </div>
                <div>
                  <p className="font-medium">
                    {formData.firstName || 'Prénom'} {formData.lastName || 'Nom'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formData.email || 'email@exemple.ga'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/employees/${id}`)}
              disabled={isLoading}
              className="min-w-[120px]"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px] bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Modification...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </motion.form>
      </div>
    </DashboardLayout>
  );
}

