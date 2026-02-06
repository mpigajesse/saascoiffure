import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, UserCircle, Save, Loader2, Eye, EyeOff } from 'lucide-react';
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
import { useEmployee, useUpdateEmployee } from '@/hooks/useEmployees';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EditEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'security' ? 'security' : 'general';

  const employeeId = Number(id);

  const { data: employee, isLoading: isLoadingData, isError } = useEmployee(employeeId);
  const updateEmployeeMutation = useUpdateEmployee();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'COIFFEUR' as EmployeeRole,
    is_available: true,
  });

  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Charger les données de l'employé
  useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || employee.user_email || '',
        phone: employee.phone || '',
        role: (employee.role?.toUpperCase() || 'COIFFEUR') as EmployeeRole,
        is_available: employee.is_available,
      });
    }
  }, [employee]);

  // Redirection si erreur de chargement
  useEffect(() => {
    if (isError || isNaN(employeeId)) {
      toast({
        title: "Employé introuvable",
        description: "L'employé demandé n'existe pas ou une erreur est survenue.",
        variant: "destructive",
      });
      navigate('/admin/employees');
    }
  }, [isError, employeeId, navigate]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Fonction de validation du numéro gabonais
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

    // Validation
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    // Validation téléphone gabonais
    if (formData.phone && !validateGabonPhone(formData.phone)) {
      toast({
        title: "Numéro invalide",
        description: "Moov: 062/063/065/066 XX XX XX, Airtel: 074/077 XX XX XX",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateEmployeeMutation.mutateAsync({
        id: employeeId,
        data: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role as any,
          is_available: formData.is_available,
        }
      });

      toast({
        title: "Employé modifié avec succès",
        description: `L'employé "${formData.first_name} ${formData.last_name}" a été modifié avec succès.`,
      });

      navigate(`/admin/employees/${id}`);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.response?.data?.phone?.[0] ||
        error?.response?.data?.detail ||
        "Une erreur est survenue lors de la modification de l'employé.";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.password !== passwordData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.password.length < 8) {
      toast({
        title: "Mot de passe trop court",
        description: "Le mot de passe doit contenir au moins 8 caractères.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Nous envoyons uniquement le mot de passe.
      // Le service doit utiliser PATCH.
      await updateEmployeeMutation.mutateAsync({
        id: employeeId,
        data: {
          password: passwordData.password
        }
      });

      toast({
        title: "Mot de passe mis à jour",
        description: "Le mot de passe de l'employé a été modifié avec succès.",
      });

      setPasswordData({ password: '', confirmPassword: '' });

    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du mot de passe.",
        variant: "destructive",
      });
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

  if (!employee) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/admin/employees/${id}`)}
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
                Gestion du profil et des accès
              </p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="general">Informations Générales</TabsTrigger>
            <TabsTrigger value="security">Sécurité & Accès</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
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
                      placeholder="Ex: Awa"
                      value={formData.first_name}
                      onChange={(e) => handleChange('first_name', e.target.value)}
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
                      placeholder="Ex: Diallo"
                      value={formData.last_name}
                      onChange={(e) => handleChange('last_name', e.target.value)}
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
                      placeholder="Ex: awa.diallo@exemple.ga"
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
                      placeholder="Ex: 074 12 34 56 ou 062 12 34 56"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      required
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Format: +241 XX XX XX XX XX
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
                      value={formData.role.toUpperCase()}
                      onValueChange={(value) => handleChange('role', value as EmployeeRole)}
                    >
                      <SelectTrigger id="role" className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Administrateur</SelectItem>
                        <SelectItem value="COIFFEUR">Coiffeur</SelectItem>
                        <SelectItem value="RECEPTIONNISTE">Réceptionniste</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="isActive" className="text-sm font-medium">
                      Disponibilité
                    </Label>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Employé disponible</p>
                        <p className="text-xs text-muted-foreground">
                          L'employé peut recevoir des rendez-vous
                        </p>
                      </div>
                      <Switch
                        checked={formData.is_available}
                        onCheckedChange={(checked) => handleChange('is_available', checked)}
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
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold bg-primary"
                    >
                      {formData.first_name?.[0] || '?'}{formData.last_name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-medium">
                        {formData.first_name || 'Prénom'} {formData.last_name || 'Nom'}
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
                  onClick={() => navigate(`/admin/employees/${id}`)}
                  disabled={updateEmployeeMutation.isPending}
                  className="min-w-[120px]"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={updateEmployeeMutation.isPending}
                  className="min-w-[120px] bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground"
                >
                  {updateEmployeeMutation.isPending ? (
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
          </TabsContent>

          <TabsContent value="security">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handlePasswordSubmit}
              className="bg-card border border-border rounded-xl p-6 space-y-6"
            >
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <div className="w-1 h-6 bg-destructive rounded-full" />
                  Modifier le mot de passe
                </h2>
                <p className="text-sm text-muted-foreground">
                  Définissez un nouveau mot de passe pour cet employé. Assurez-vous d'utiliser un mot de passe sécurisé.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Nouveau mot de passe <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 8 caractères"
                        value={passwordData.password}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirmer le mot de passe <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Répétez le mot de passe"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={updateEmployeeMutation.isPending || !passwordData.password}
                  className="min-w-[120px]"
                >
                  {updateEmployeeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Modifier le mot de passe
                    </>
                  )}
                </Button>
              </div>
            </motion.form>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
