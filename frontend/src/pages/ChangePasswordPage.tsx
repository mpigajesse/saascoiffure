import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Calculer la force du mot de passe
    if (field === 'newPassword') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    let feedback = '';

    if (password.length >= 8) score += 1;
    else feedback = 'Le mot de passe doit contenir au moins 8 caractères. ';

    if (/[a-z]/.test(password)) score += 1;
    else feedback += 'Ajoutez des minuscules. ';

    if (/[A-Z]/.test(password)) score += 1;
    else feedback += 'Ajoutez des majuscules. ';

    if (/[0-9]/.test(password)) score += 1;
    else feedback += 'Ajoutez des chiffres. ';

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback += 'Ajoutez des caractères spéciaux. ';

    if (score === 0) feedback = 'Très faible';
    else if (score <= 2) feedback = 'Faible';
    else if (score <= 3) feedback = 'Moyen';
    else if (score <= 4) feedback = 'Fort';
    else feedback = 'Très fort';

    setPasswordStrength({ score, feedback });
  };

  const getStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Erreur de validation",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      toast({
        title: "Mot de passe trop court",
        description: "Le mot de passe doit contenir au moins 8 caractères.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      toast({
        title: "Erreur",
        description: "Le nouveau mot de passe doit être différent de l'ancien.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été modifié avec succès.",
      });

      // Réinitialiser le formulaire
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordStrength({ score: 0, feedback: '' });

      // Rediriger vers les paramètres après un court délai
      setTimeout(() => {
        navigate('/settings');
      }, 1500);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification du mot de passe.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/settings')}
            className="hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Changer le mot de passe</h1>
              <p className="text-muted-foreground text-sm">
                Mettez à jour votre mot de passe pour sécuriser votre compte
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
          {/* Mot de passe actuel */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-sm font-medium">
              Mot de passe actuel <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Entrez votre mot de passe actuel"
                value={formData.currentPassword}
                onChange={(e) => handleChange('currentPassword', e.target.value)}
                required
                className="h-11 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {/* Nouveau mot de passe */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium">
              Nouveau mot de passe <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Entrez votre nouveau mot de passe"
                value={formData.newPassword}
                onChange={(e) => handleChange('newPassword', e.target.value)}
                required
                className="h-11 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            
            {/* Indicateur de force du mot de passe */}
            {formData.newPassword && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full ${
                        level <= passwordStrength.score
                          ? getStrengthColor(passwordStrength.score)
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Force: <span className="font-medium">{passwordStrength.feedback}</span>
                </p>
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Le mot de passe doit contenir :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Au moins 8 caractères</li>
                <li>Des lettres majuscules et minuscules</li>
                <li>Au moins un chiffre</li>
                <li>Au moins un caractère spécial</li>
              </ul>
            </div>
          </div>

          {/* Confirmation */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmer le nouveau mot de passe <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirmez votre nouveau mot de passe"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
                className="h-11 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
              <p className="text-xs text-destructive">
                Les mots de passe ne correspondent pas
              </p>
            )}
            {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Les mots de passe correspondent</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/settings')}
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
              {isLoading ? 'Modification...' : 'Modifier le mot de passe'}
            </Button>
          </div>
        </motion.form>
      </div>
    </DashboardLayout>
  );
}

