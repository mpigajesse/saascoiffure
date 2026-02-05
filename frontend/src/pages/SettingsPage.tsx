import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { Building, Clock, Globe, CreditCard, Bell, Shield, Palette, RotateCcw, User } from 'lucide-react';
import { BrandingFooter } from '@/components/branding';
import { useTenantTheme } from '@/contexts/TenantThemeContext';
import { ColorPicker } from '@/components/theme/ColorPicker';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import apiClient from '@/lib/api-client';

export default function SettingsPage() {
  const { salon, refreshSalon } = useTenant();
  const { user, refreshUser } = useAuth();
  const { theme, updateTheme, resetTheme } = useTenantTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedCurrency, setSelectedCurrency] = useState(salon?.currency || 'XAF');
  
  // Synchroniser selectedCurrency avec les données du salon
  useEffect(() => {
    console.log('⚙️ SettingsPage - salon changé:', salon);
    if (salon?.currency) {
      console.log('💱 Mise à jour selectedCurrency:', salon.currency);
      setSelectedCurrency(salon.currency);
    }
  }, [salon?.currency]);
  
  // Devises disponibles
  const currencies = [
    { value: 'XAF', label: 'FCFA (Franc CFA)', symbol: 'FCFA' },
    { value: 'EUR', label: 'Euro (€)', symbol: '€' },
    { value: 'USD', label: 'Dollar US ($)', symbol: '$' },
    { value: 'CAD', label: 'Dollar Canadien (CAD)', symbol: 'CAD$' },
    { value: 'MAD', label: 'Dirham Marocain (MAD)', symbol: 'MAD' },
    { value: 'GBP', label: 'Livre Sterling (£)', symbol: '£' },
  ];
  
  // Refs pour les formulaires
  const profileFormRef = useRef<HTMLFormElement>(null);
  const salonFormRef = useRef<HTMLFormElement>(null);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData(profileFormRef.current!);
      const data = {
        first_name: formData.get('firstName') as string,
        last_name: formData.get('lastName') as string,
        email: formData.get('email') as string,
      };
      
      await apiClient.patch('/auth/users/update-profile/', data);
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations personnelles ont été enregistrées.",
      });
      
      // Recharger la page après un court délai pour laisser voir la notification
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Une erreur est survenue lors de l'enregistrement.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSalon = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData(salonFormRef.current!);
      const data = {
        name: formData.get('salonName') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
        address: formData.get('address') as string,
        currency: selectedCurrency, // Inclure la devise sélectionnée
      };
      
      await apiClient.patch('/salons/update-my-salon/', data);
      
      // Actualiser les données du salon dans le contexte
      if (refreshSalon) {
        await refreshSalon();
      }
      
      toast({
        title: "Salon mis à jour",
        description: `Les informations du salon ont été enregistrées. Devise: ${currencies.find(c => c.value === selectedCurrency)?.symbol || selectedCurrency}`,
      });
      
      // Recharger la page après un court délai pour laisser voir la notification
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Une erreur est survenue lors de l'enregistrement.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    console.log('💱 Changement de devise:', { from: salon?.currency, to: newCurrency });
    setSelectedCurrency(newCurrency);
    
    try {
      setIsSaving(true);
      
      // Mettre à jour la devise immédiatement
      const response = await apiClient.patch('/salons/update-my-salon/', {
        currency: newCurrency,
      });
      
      console.log('✅ Réponse API mise à jour devise:', response.data);
      
      // Recharger les données utilisateur pour avoir les informations salon mises à jour
      await refreshUser();
      
      const currencyInfo = currencies.find(c => c.value === newCurrency);
      toast({
        title: "Devise mise à jour",
        description: `La devise a été changée vers ${currencyInfo?.label || newCurrency}. Les prix s'affichent maintenant dans cette devise.`,
      });
      
      setIsSaving(false);
      
    } catch (error: any) {
      console.error('❌ Erreur mise à jour devise:', error);
      // Revenir à l'ancienne devise en cas d'erreur
      setSelectedCurrency(salon?.currency || 'XAF');
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Impossible de mettre à jour la devise.",
        variant: "destructive",
      });
      setIsSaving(false);
    }
  };

  const handleSaveTheme = async () => {
    setIsSaving(true);
    try {
      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Thème enregistré",
        description: "Vos préférences de thème ont été enregistrées et appliquées.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">Configuration du compte, salon et préférences</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="salon" className="gap-2">
              <Building className="w-4 h-4" />
              Salon
            </TabsTrigger>
            <TabsTrigger value="theme" className="gap-2">
              <Palette className="w-4 h-4" />
              Thème
            </TabsTrigger>
          </TabsList>

          {/* TAB: Profil */}
          <TabsContent value="profile" className="space-y-6 mt-6">
            <form ref={profileFormRef}>
            {/* User Profile */}
            <div className="bg-card border-2 border-border p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <User className="w-5 h-5" />
                <h2 className="text-lg font-bold">Informations personnelles</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input 
                    id="firstName" 
                    name="firstName"
                    defaultValue={user?.first_name || ''}
                    placeholder="Ex: Naomie"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input 
                    id="lastName" 
                    name="lastName"
                    defaultValue={user?.last_name || ''}
                    placeholder="Ex: Moussavou"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="userEmail">Email</Label>
                  <Input 
                    id="userEmail" 
                    name="email"
                    type="email" 
                    defaultValue={user?.email || ''}
                    placeholder="Ex: naoadmin@gmail.com"
                  />
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-card border-2 border-border p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <Shield className="w-5 h-5" />
                <h2 className="text-lg font-bold">Sécurité</h2>
              </div>
              
              <div className="space-y-4">
                <Button variant="outline" asChild>
                  <Link to="/settings/change-password">Changer le mot de passe</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/sessions">Gérer les sessions actives</Link>
                </Button>
              </div>
            </div>

            {/* Save Profile */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button">Annuler</Button>
              <Button 
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground"
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
            </form>
          </TabsContent>

          {/* TAB: Salon */}
          <TabsContent value="salon" className="space-y-6 mt-6">
          <form ref={salonFormRef}>
        {/* Salon info */}
        <div className="bg-card border-2 border-border p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <Building className="w-5 h-5" />
            <h2 className="text-lg font-bold">Informations du salon</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salonName">Nom du salon</Label>
              <Input 
                id="salonName" 
                name="salonName"
                defaultValue={salon?.name || ''}
                placeholder="Ex: Salon Mireille, Coiffure Awa, Studio Koffi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input 
                id="phone" 
                name="phone"
                defaultValue={salon?.phone || ''}
                placeholder="Ex: +241 06 12 34 56 78"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                defaultValue={salon?.email || ''}
                placeholder="Ex: contact@salon-mireille.ga"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input 
                id="address" 
                name="address"
                defaultValue={salon?.address || ''}
                placeholder="Ex: Avenue Léon Mba, Libreville, Gabon"
              />
            </div>
          </div>
        </div>

        {/* Hours */}
        <div className="bg-card border-2 border-border p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <Clock className="w-5 h-5" />
            <h2 className="text-lg font-bold">Horaires d'ouverture</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ouverture</Label>
              <Input type="time" defaultValue="09:00" />
            </div>
            <div className="space-y-2">
              <Label>Fermeture</Label>
              <Input type="time" defaultValue="19:00" />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => (
              <Button 
                key={day} 
                variant={i < 6 ? 'default' : 'outline'}
                size="sm"
              >
                {day}
              </Button>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-card border-2 border-border p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <Globe className="w-5 h-5" />
            <h2 className="text-lg font-bold">Préférences</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Devise {isSaving && <span className="text-xs text-muted-foreground animate-pulse">- Mise à jour...</span>}</Label>
              <Select 
                value={selectedCurrency} 
                onValueChange={handleCurrencyChange}
                disabled={isSaving}
              >
                <SelectTrigger className={isSaving ? 'opacity-50' : ''}>
                  <SelectValue placeholder="Sélectionnez une devise" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCurrency !== salon?.currency && !isSaving && (
                <p className="text-xs text-muted-foreground">
                  ✨ La devise se met à jour automatiquement
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Fuseau horaire</Label>
              <Input defaultValue={salon?.timezone || 'Africa/Libreville'} disabled placeholder="Africa/Libreville (GMT+1)" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card border-2 border-border p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <Bell className="w-5 h-5" />
            <h2 className="text-lg font-bold">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Rappels de RDV par email</p>
                <p className="text-sm text-muted-foreground">Envoyer un rappel 24h avant le RDV</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Confirmations de RDV</p>
                <p className="text-sm text-muted-foreground">Envoyer un email de confirmation</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications SMS</p>
                <p className="text-sm text-muted-foreground">Activer les notifications SMS (premium)</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-card border-2 border-border p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <CreditCard className="w-5 h-5" />
            <h2 className="text-lg font-bold">Paiements</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Paiement en ligne</p>
                <p className="text-sm text-muted-foreground">Autoriser les paiements lors de la réservation</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Acompte obligatoire</p>
                <p className="text-sm text-muted-foreground">Exiger un acompte pour les réservations</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

            {/* Save Salon */}
            <div className="flex justify-end gap-3">
              <Button variant="outline">Annuler</Button>
              <Button 
                onClick={handleSaveSalon}
                disabled={isSaving}
                className="bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground"
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </form>
          </TabsContent>

          {/* TAB: Thème */}
          <TabsContent value="theme" className="space-y-6 mt-6">

        {/* Theme Customization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border-2 border-border p-6 space-y-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5" />
              <div>
                <h2 className="text-lg font-bold">Personnalisation du thème</h2>
                <p className="text-sm text-muted-foreground">
                  Personnalisez les couleurs de votre site public
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetTheme}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Réinitialiser
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ColorPicker
              label="Couleur principale"
              value={theme.primaryColor || '15 70% 45%'}
              onChange={(color) => updateTheme({ primaryColor: color })}
              description="Couleur principale utilisée pour les boutons et éléments importants"
            />
            
            <ColorPicker
              label="Couleur secondaire"
              value={theme.secondaryColor || '35 35% 92%'}
              onChange={(color) => updateTheme({ secondaryColor: color })}
              description="Couleur secondaire pour les arrière-plans et éléments secondaires"
            />
            
            <ColorPicker
              label="Couleur d'accent"
              value={theme.accentColor || '42 85% 55%'}
              onChange={(color) => updateTheme({ accentColor: color })}
              description="Couleur d'accent pour les éléments mis en évidence"
            />
            
            <ColorPicker
              label="Couleur de fond"
              value={theme.backgroundColor || '35 30% 97%'}
              onChange={(color) => updateTheme({ backgroundColor: color })}
              description="Couleur de fond principale du site"
            />
            
            <ColorPicker
              label="Couleur du texte"
              value={theme.textColor || '25 40% 15%'}
              onChange={(color) => updateTheme({ textColor: color })}
              description="Couleur principale du texte"
            />
            
            <ColorPicker
              label="Couleur des boutons"
              value={theme.buttonColor || '15 70% 45%'}
              onChange={(color) => updateTheme({ buttonColor: color })}
              description="Couleur des boutons principaux"
            />
          </div>

          <div className="pt-4 border-t border-border">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">Aperçu du thème</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-16 h-16 rounded-lg border-2 border-border"
                  style={{ backgroundColor: `hsl(${theme.primaryColor || '15 70% 45%'})` }}
                />
                <div
                  className="w-16 h-16 rounded-lg border-2 border-border"
                  style={{ backgroundColor: `hsl(${theme.secondaryColor || '35 35% 92%'})` }}
                />
                <div
                  className="w-16 h-16 rounded-lg border-2 border-border"
                  style={{ backgroundColor: `hsl(${theme.accentColor || '42 85% 55%'})` }}
                />
                <div
                  className="w-16 h-16 rounded-lg border-2 border-border"
                  style={{ backgroundColor: `hsl(${theme.backgroundColor || '35 30% 97%'})` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Les modifications sont appliquées en temps réel. Visitez votre site public pour voir les changements.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Security */}
        <div className="bg-card border-2 border-border p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <Shield className="w-5 h-5" />
            <h2 className="text-lg font-bold">Sécurité</h2>
          </div>
          
          <div className="space-y-4">
            <Button variant="outline" asChild>
              <Link to="/settings/change-password">Changer le mot de passe</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/sessions">Gérer les sessions actives</Link>
            </Button>
          </div>
        </div>

        {/* Save Theme */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">Annuler</Button>
          <Button 
            onClick={handleSaveTheme}
            disabled={isSaving}
            className="bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground"
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </div>
          </TabsContent>
        </Tabs>

        {/* Branding */}
        <div className="mt-12 pt-8 border-t border-border">
          <BrandingFooter variant="admin" />
        </div>
      </div>
    </DashboardLayout>
  );
}
