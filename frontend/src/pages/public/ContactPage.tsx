import { PublicLayout } from '@/components/layout/PublicLayout';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
                    <p className="text-muted-foreground">{salon.opening_hours}</p>
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
                        placeholder="Ex: +241 06 12 34 56 78"
                      />
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

