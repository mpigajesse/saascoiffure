import { PublicLayout } from '@/components/layout/PublicLayout';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useOpeningHours } from '@/hooks/useOpeningHours';

import { HeroSection } from '@/components/public/HeroSection';
import { getPageHeroImage } from '@/lib/unsplash';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { AkomaSymbol } from '@/components/african-symbols/AfricanSymbols';

export default function ContactPage() {
  const { salon } = useTenant();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fonction de validation du numéro gabonais
  const validateGabonPhone = (phone: string): boolean => {
    if (!phone) return true; // Optionnel dans le formulaire de contact

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

    // Validation du téléphone si fourni
    if (formData.phone && !validateGabonPhone(formData.phone)) {
      toast({
        title: "Numéro invalide",
        description: "Moov: 062/063/065/066 XX XX XX, Airtel: 074/077 XX XX XX",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulation d'envoi
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Message envoyé !",
      description: "Nous vous répondrons dans les plus brefs délais.",
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  // Image unique pour la page contact - Salon moderne professionnel
  const heroImage = getPageHeroImage('contact', 1920, 1080);

  return (
    <PublicLayout>
      {/* Hero Section avec image */}
      <HeroSection
        backgroundImage={heroImage}
        title={
          <div className="flex items-center justify-center gap-3">
            <Phone className="w-10 h-10" />
            <span>Contactez-nous</span>
          </div>
        }
        description="Nous sommes là pour répondre à toutes vos questions"
        decorativeElements={
          <>

          </>
        }
      />

      <section className="py-8 lg:py-12 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Informations de contact */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                  <MapPin className="w-8 h-8 text-primary" />
                  Nos coordonnées
                </h2>
                <p className="text-muted-foreground mb-6">
                  N'hésitez pas à nous contacter par téléphone, email ou en venant directement au salon.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-all">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Téléphone</h3>
                    <a href={`tel:${salon.phone}`} className="text-muted-foreground hover:text-primary transition-colors">
                      {salon.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-all">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a href={`mailto:${salon.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                      {salon.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-all">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Adresse</h3>
                    <p className="text-muted-foreground">{salon.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-all">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Horaires</h3>
                    <HorairesAvances salonId={salon?.id} />
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire de contact */}
            <div className="bg-card border border-border rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <AkomaSymbol size={24} animated={true} color="green" />
                Envoyez-nous un message
              </h2>

              {isSubmitted ? (
                <div className="text-center py-8 space-y-4 animate-scale-in">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Message envoyé !</h3>
                  <p className="text-muted-foreground">
                    Nous vous répondrons dans les plus brefs délais.
                  </p>
                  <Button onClick={() => setIsSubmitted(false)} variant="outline">
                    Envoyer un autre message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Ex: Awa Diallo, Koffi Traoré, Mireille Mba"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="Ex: fatou.ndiaye@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Ex: 074 12 34 56 ou 062 12 34 56"
                        className={formData.phone && !validateGabonPhone(formData.phone) ? 'border-destructive' : ''}
                      />
                      {formData.phone && !validateGabonPhone(formData.phone) && (
                        <p className="text-xs text-destructive">
                          Moov: 062/063/065/066 XX XX XX, Airtel: 074/077 XX XX XX
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Sujet *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      placeholder="Ex: Demande de renseignements"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      placeholder="Écrivez votre message ici..."
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
                    {isSubmitting ? 'Envoi...' : (
                      <>
                        <Send className="w-4 h-4" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

// Affichage des horaires avancés (par jour)
function HorairesAvances({ salonId }: { salonId: string | number | undefined }) {
  const { openingHours, loading, error } = useOpeningHours();
  if (!salonId) return <span className="text-muted-foreground">Salon inconnu</span>;
  if (loading) return <span className="text-muted-foreground">Chargement...</span>;
  if (error) return <span className="text-destructive">Erreur: {error}</span>;
  if (!Array.isArray(openingHours) || openingHours.length === 0) return <span className="text-muted-foreground">Aucun horaire configuré.</span>;
  return (
    <ul className="text-muted-foreground text-sm">
      {openingHours.map(h => (
        <li key={h.id}>
          <span className="font-medium">{h.day_of_week_display} :</span>{' '}
          {h.is_closed ? <span className="text-destructive">Fermé</span> : <>{h.open_time} - {h.close_time}</>}
        </li>
      ))}
    </ul>
  );
}
