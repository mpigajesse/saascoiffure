import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Save, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Salon } from '@/types';
import { motion } from 'framer-motion';

export default function NewTenantPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Salon>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    opening_hours: '8h00 - 18h00',
    currency: 'XAF',
    timezone: 'Africa/Libreville',
  });

  const handleChange = (field: keyof Salon, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
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

      // Ici, on ferait l'appel API réel pour créer le tenant
      // const response = await api.post('/admin/tenants', formData);

      toast({
        title: "Tenant créé avec succès",
        description: `Le salon "${formData.name}" a été créé avec succès.`,
      });

      // Rediriger vers la liste des tenants
      navigate('/admin/tenants');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du tenant.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            onClick={() => navigate('/admin/tenants')}
            className="hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Nouveau Tenant</h1>
              <p className="text-muted-foreground text-sm">
                Créer un nouveau salon dans le système
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
          {/* Informations de base */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <div className="w-1 h-6 bg-primary rounded-full" />
              Informations de base
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nom du salon <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: Salon Mireille, Coiffure Awa, Studio Koffi"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Ex: contact@salon-mireille.ga"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  className="h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  Adresse <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address"
                  placeholder="Ex: Avenue Léon Mba, Libreville, Gabon"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  required
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <div className="w-1 h-6 bg-primary rounded-full" />
              Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="opening_hours" className="text-sm font-medium">
                  Heures d'ouverture
                </Label>
                <Input
                  id="opening_hours"
                  placeholder="Ex: 8h00 - 18h00"
                  value={formData.opening_hours}
                  onChange={(e) => handleChange('opening_hours', e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm font-medium">
                  Devise
                </Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleChange('currency', value)}
                >
                  <SelectTrigger id="currency" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XAF">Franc CFA (XAF)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    <SelectItem value="USD">Dollar US (USD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-sm font-medium">
                  Fuseau horaire
                </Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => handleChange('timezone', value)}
                >
                  <SelectTrigger id="timezone" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Libreville">Africa/Libreville (GMT+1)</SelectItem>
                    <SelectItem value="Africa/Douala">Africa/Douala (GMT+1)</SelectItem>
                    <SelectItem value="Africa/Abidjan">Africa/Abidjan (GMT+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Options avancées */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <div className="w-1 h-6 bg-primary rounded-full" />
              Options avancées (optionnel)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logo" className="text-sm font-medium">
                  URL du logo
                </Label>
                <Input
                  id="logo"
                  type="url"
                  placeholder="https://exemple.com/logo.png"
                  value={formData.logo || ''}
                  onChange={(e) => handleChange('logo', e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="heroImage" className="text-sm font-medium">
                  URL de l'image hero
                </Label>
                <Input
                  id="heroImage"
                  type="url"
                  placeholder="https://exemple.com/hero.jpg"
                  value={formData.heroImage || ''}
                  onChange={(e) => handleChange('heroImage', e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/tenants')}
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
                  Création...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Créer le tenant
                </>
              )}
            </Button>
          </div>
        </motion.form>
      </div>
    </DashboardLayout>
  );
}

