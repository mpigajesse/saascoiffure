import { PublicLayout } from '@/components/layout/PublicLayout';
import { useTenant } from '@/contexts/TenantContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, User, Phone, Mail, Scissors, CheckCircle2, ArrowRight, Banknote, Smartphone, CreditCard, Wallet, MessageCircle, Sparkles, Star, Heart, Download } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useServices, useEmployees } from '@/hooks/useApi';
import { HeroSection } from '@/components/public/HeroSection';
import { getPageHeroImage, getServiceImage } from '@/lib/unsplash';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ServiceCard } from '@/components/services/ServiceCard';

import { toast } from '@/hooks/use-toast';

export default function BookingPage() {
  const { salon } = useTenant();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const preSelectedServiceId = location.state?.serviceId;

  // Mutations pour créer des entités
  const createClientMutation = useMutation({
    mutationFn: async (clientData: any) => {
      const response = await apiClient.post('/clients/', clientData);
      return response.data;
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await apiClient.post('/appointments/', appointmentData);
      return response.data;
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiClient.post('/payments/', paymentData);
      return response.data;
    },
  });

  // Fonction pour vérifier si un client existe par email
  const checkClientByEmail = async (email: string) => {
    try {
      const response = await apiClient.get(`/clients/?email=${email}`);
      const clients = Array.isArray(response.data) ? response.data : (response.data.results || []);
      return clients.length > 0 ? clients[0] : null;
    } catch (error) {
      return null;
    }
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    serviceId: preSelectedServiceId || '',
    employeeId: '',
    date: undefined as Date | undefined,
    time: '',
    notes: '',
    paymentMethod: '' as 'airtel_money' | 'cash_on_arrival' | '',
    airtelMoneyNumber: '',
  });

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<any>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  // Fetch data from API
  const { data: servicesData } = useServices();
  const { data: employeesData } = useEmployees();
  
  const services = servicesData?.results || [];
  const employees = employeesData?.results || [];
  const coiffeurs = employees.filter(e => e.role === 'COIFFEUR');
  
  const selectedService = formData.serviceId ? services.find(s => s.id.toString() === formData.serviceId) : null;
  const selectedEmployee = formData.employeeId ? coiffeurs.find(e => e.id.toString() === formData.employeeId) : null;

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ];

  const downloadTicket = () => {
    if (!createdAppointment || !selectedService) return;

    // Données de la réservation pour le QR code
    const reservationData = JSON.stringify({
      id: createdAppointment.id,
      salonId: salon?.id,
      salonName: salon?.name || 'Salon de coiffure',
      clientName: `${formData.firstName} ${formData.lastName}`,
      clientEmail: formData.email,
      clientPhone: formData.phone,
      service: selectedService.name,
      servicePrice: selectedService.price,
      date: formData.date ? format(formData.date, 'yyyy-MM-dd') : '',
      time: formData.time,
      employeeId: formData.employeeId,
      paymentMethod: formData.paymentMethod,
      status: 'confirmed'
    });

    // Créer un canvas pour le ticket
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions du ticket
    canvas.width = 800;
    canvas.height = 600;

    // Background dégradé
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f8f4ef');
    gradient.addColorStop(1, '#fff9f3');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bordure
    ctx.strokeStyle = '#d97038';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Charger et dessiner le QR code
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(reservationData)}`;
    const qrImage = new Image();
    qrImage.crossOrigin = 'anonymous';
    
    qrImage.onload = () => {
      // Dessiner le QR code dans un coin avec fond blanc
      const qrSize = 120;
      const qrX = canvas.width - qrSize - 40;
      const qrY = 190;
      
      // Fond blanc pour le QR code
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
      
      // Bordure autour du QR code
      ctx.strokeStyle = '#d97038';
      ctx.lineWidth = 3;
      ctx.strokeRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
      
      // Dessiner le QR code
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      // Continuer avec le reste du ticket
      drawTicketContent();
    };

    qrImage.onerror = () => {
      // Si le QR code ne charge pas, continuer sans
      drawTicketContent();
    };

    qrImage.src = qrCodeUrl;

    const drawTicketContent = () => {
      // Header - Titre
      ctx.fillStyle = '#d97038';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('✓ RÉSERVATION CONFIRMÉE', canvas.width / 2, 80);

      // Nom du salon
      ctx.fillStyle = '#6b4423';
      ctx.font = 'bold 32px Arial';
      ctx.fillText(salon?.name || 'Salon de coiffure', canvas.width / 2, 130);

      // Ligne de séparation
      ctx.strokeStyle = '#d97038';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, 160);
      ctx.lineTo(canvas.width - 60, 160);
      ctx.stroke();

      // Informations - Style plus lisible
      ctx.textAlign = 'left';
      ctx.fillStyle = '#6b4423';
      let yPos = 220;
      const leftCol = 80;
      const rightCol = 420;

      // Colonne gauche
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#8b5a3c';
      ctx.fillText('Service:', leftCol, yPos);
      ctx.font = '24px Arial';
      ctx.fillStyle = '#2d1810';
      ctx.fillText(selectedService.name, leftCol, yPos + 35);

      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#8b5a3c';
      ctx.fillText('Date:', leftCol, yPos + 95);
      ctx.font = '24px Arial';
      ctx.fillStyle = '#2d1810';
      ctx.fillText(formData.date ? format(formData.date, 'dd MMMM yyyy', { locale: fr }) : '', leftCol, yPos + 130);

      // Colonne droite
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#8b5a3c';
      ctx.fillText('Heure:', rightCol, yPos);
      ctx.font = '24px Arial';
      ctx.fillStyle = '#2d1810';
      ctx.fillText(formData.time, rightCol, yPos + 35);

      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#8b5a3c';
      ctx.fillText('Montant:', rightCol, yPos + 95);
      ctx.font = 'bold 32px Arial';
      ctx.fillStyle = '#d97038';
      ctx.fillText(`${formatPrice(Number(selectedService.price) || 0, salon?.currency || 'XAF')}`, rightCol, yPos + 135);

      // Paiement
      yPos = 430;
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#8b5a3c';
      ctx.fillText('Paiement:', leftCol, yPos);
      ctx.font = '22px Arial';
      ctx.fillStyle = '#2d1810';
      const paymentText = formData.paymentMethod === 'airtel_money' 
        ? `Airtel Money (${formData.airtelMoneyNumber})`
        : 'À l\'arrivée au salon';
      ctx.fillText(paymentText, leftCol, yPos + 35);

      // Référence
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = '#8b5a3c';
      ctx.fillText('Référence:', leftCol, yPos + 85);
      ctx.font = 'bold 20px Courier';
      ctx.fillStyle = '#d97038';
      ctx.fillText(createdAppointment.id, leftCol + 130, yPos + 85);

      // Footer
      ctx.font = 'italic 18px Arial';
      ctx.fillStyle = '#8b5a3c';
      ctx.textAlign = 'center';
      ctx.fillText('Merci de votre confiance • ' + (salon?.address || ''), canvas.width / 2, 560);

      // Télécharger l'image
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `ticket-reservation-${createdAppointment.id}.jpg`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/jpeg', 0.95);
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Vérifier si le client existe déjà
      let client = await checkClientByEmail(formData.email);

      // Si le client n'existe pas, le créer
      if (!client) {
        client = await createClientMutation.mutateAsync({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          notes: formData.notes || undefined,
        });
      }

      // Créer la réservation (sans paiement pour l'instant)
      const dateString = formData.date ? format(formData.date, 'yyyy-MM-dd') : '';

      const appointment = await createAppointmentMutation.mutateAsync({
        salon: salon?.id || 0,
        client: client.id,
        employee: formData.employeeId,
        service: formData.serviceId,
        date: dateString,
        start_time: formData.time,
        notes: formData.notes || undefined,
        source: 'website', // Source de la réservation
      });

      setCreatedAppointment(appointment);

      // Simulation d'un délai pour l'UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsSubmitting(false);
      setStep(4); // Passer à l'étape de paiement
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de votre réservation. Veuillez réessayer.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (!createdAppointment || !selectedService) return;

    setIsSubmitting(true);

    try {
      // Simulation du paiement Airtel Money
      if (formData.paymentMethod === 'airtel_money') {
        // Simulation d'un délai pour le paiement mobile
        await new Promise(resolve => setTimeout(resolve, 2000));

        toast({
          title: "Paiement Airtel Money en cours...",
          description: "Veuillez confirmer le paiement sur votre téléphone.",
        });

        // Simulation de la confirmation du paiement
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Créer le paiement
      if (createdAppointment && selectedService) {
        await createPaymentMutation.mutateAsync({
          salon: salon?.id || 0,
          appointment: createdAppointment.id,
          client: createdAppointment.client,
          amount: Number(selectedService.price) || 0,
          method: formData.paymentMethod as 'airtel_money' | 'cash_on_arrival',
        });
      }

      toast({
        title: "Paiement confirmé !",
        description: formData.paymentMethod === 'airtel_money'
          ? "Votre paiement Airtel Money a été confirmé."
          : "Vous paierez à votre arrivée au salon.",
      });

      setIsSubmitting(false);
      setStep(5); // Passer à la confirmation finale
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du paiement. Veuillez réessayer.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const canProceedToStep2 = formData.firstName && formData.lastName && formData.email && formData.phone;
  const canProceedToStep3 = canProceedToStep2 && formData.serviceId && formData.employeeId;
  const canProceedToStep4 = canProceedToStep3 && formData.date && formData.time;
  const canSubmitPayment = canProceedToStep4 && formData.paymentMethod &&
    (formData.paymentMethod === 'cash_on_arrival' || (formData.paymentMethod === 'airtel_money' && formData.airtelMoneyNumber));

  if (step === 5) {
    return (
      <PublicLayout>
        {/* Background avec dégradés animés */}
        <div className="relative min-h-[50vh] flex items-center justify-center py-8 overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-lg w-full mx-4"
          >
            {/* Carte principale */}
            <div className="bg-card/80 backdrop-blur-xl border-2 border-primary/20 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden">
              {/* Header avec confetti visuel */}
              <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-4 text-center border-b border-primary/20">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex justify-center mb-2"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center gap-2 mb-2"
                >
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  <Star className="w-5 h-5 text-yellow-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <Heart className="w-5 h-5 text-pink-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent mb-1"
                >
                  Réservation confirmée !
                </motion.h2>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xs text-muted-foreground max-w-md mx-auto"
                >
                  {formData.paymentMethod === 'airtel_money'
                    ? "Votre paiement Airtel Money a été confirmé. Votre rendez-vous est confirmé."
                    : "Votre réservation est confirmée. Vous paierez à votre arrivée au salon."
                  }
                </motion.p>
              </div>

              {/* Détails de la réservation */}
              <div className="p-4 space-y-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Scissors className="w-3 h-3" />
                    Détails de votre rendez-vous
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Service */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-secondary/30 rounded-lg p-2 border border-border/50"
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Scissors className="w-3 h-3 text-primary" />
                        <p className="text-[10px] font-medium text-muted-foreground">Service</p>
                      </div>
                      <p className="font-bold text-xs text-foreground">{selectedService?.name}</p>
                    </motion.div>

                    {/* Date */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-secondary/30 rounded-lg p-2 border border-border/50"
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Calendar className="w-3 h-3 text-primary" />
                        <p className="text-[10px] font-medium text-muted-foreground">Date</p>
                      </div>
                      <p className="font-bold text-xs text-foreground">
                        {formData.date && format(formData.date, 'dd MMM yyyy')}
                      </p>
                    </motion.div>

                    {/* Heure */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-secondary/30 rounded-lg p-2 border border-border/50"
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Clock className="w-3 h-3 text-primary" />
                        <p className="text-[10px] font-medium text-muted-foreground">Heure</p>
                      </div>
                      <p className="font-bold text-xs text-foreground">{formData.time}</p>
                    </motion.div>

                    {/* Montant */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-primary/10 to-accent/5 rounded-lg p-2 border border-primary/30"
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Banknote className="w-3 h-3 text-primary" />
                        <p className="text-[10px] font-medium text-muted-foreground">Montant</p>
                      </div>
                      <p className="font-bold text-base text-primary">{formatPrice(Number(selectedService?.price) || 0, salon?.currency || 'XAF')}</p>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Paiement */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-lg p-3 border border-border/50"
                >
                  <div className="flex items-start gap-2">
                    {formData.paymentMethod === 'airtel_money' ? (
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Smartphone className="w-3.5 h-3.5 text-primary" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Wallet className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">Paiement</p>
                      <p className="font-bold text-xs text-foreground">
                        {formData.paymentMethod === 'airtel_money'
                          ? `Airtel Money (${formData.airtelMoneyNumber})`
                          : 'À l\'arrivée au salon'
                        }
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Référence */}
                {createdAppointment && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-muted/30 rounded-lg p-2.5 border border-dashed border-border"
                  >
                    <p className="text-[10px] text-muted-foreground mb-0.5">Numéro de référence</p>
                    <p className="font-mono font-bold text-xs text-foreground tracking-wider">
                      {createdAppointment.id}
                    </p>
                  </motion.div>
                )}

                {/* Actions */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex flex-col gap-2 pt-2"
                >
                  {/* Bouton télécharger ticket */}
                  <Button
                    onClick={downloadTicket}
                    className="w-full h-10 gap-2 shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:shadow-xl hover:scale-105 transition-all text-sm font-bold"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger mon ticket
                  </Button>

                  {/* Boutons secondaires */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = '/public/services'}
                      className="flex-1 h-9 gap-2 hover:bg-secondary hover:scale-105 transition-all shadow-sm text-xs"
                    >
                      <Scissors className="w-3 h-3" />
                      Voir autres services
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = '/public'}
                      className="flex-1 h-9 gap-2 hover:bg-secondary hover:scale-105 transition-all shadow-sm text-xs"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Retour à l'accueil
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </PublicLayout>
    );
  }

  // Image unique pour la page réservation - Style afro moderne
  const heroImage = getPageHeroImage('booking', 1920, 1080);

  return (
    <PublicLayout>
      {/* Hero Section avec image */}
      <HeroSection
        backgroundImage={heroImage}
        title={
          <div className="flex items-center justify-center gap-3">
            <Calendar className="w-10 h-10" />
            <span>Réserver un rendez-vous</span>
          </div>
        }
        description="Remplissez le formulaire ci-dessous pour réserver votre créneau"
        decorativeElements={
          <motion.div
            className="absolute top-8 right-8 opacity-30"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Calendar className="w-16 h-16 text-white/30" />
          </motion.div>
        }
      />

      {/* Formulaire de réservation */}
      <section className="py-4 lg:py-6 bg-background">
        {/* Layout en grille pour desktop */}
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Colonne principale : Formulaire */}
            <div className="lg:col-span-2 space-y-4">
              {/* Indicateur de progression */}
              <div className="px-2 lg:px-4">
                <div className="relative">
                  {/* Ligne de fond */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-secondary rounded-full -z-10" />

                  {/* Ligne de progression active */}
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full origin-left -z-10"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: (step - 1) / 3 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{ width: '100%' }}
                  />

                  <div className="flex justify-between relative z-10">
                    {[1, 2, 3, 4].map((s) => (
                      <div key={s} className="flex flex-col items-center gap-2 cursor-default">
                        <motion.div
                          initial={false}
                          animate={{
                            scale: step === s ? 1.1 : 1,
                            backgroundColor: step >= s ? "hsl(var(--primary))" : "hsl(var(--background))",
                            borderColor: step >= s ? "hsl(var(--primary))" : "hsl(var(--muted))"
                          }}
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border-2 transition-all duration-300",
                            step >= s ? "text-primary-foreground border-primary" : "text-muted-foreground border-muted-foreground/30"
                          )}
                        >
                          {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                        </motion.div>
                        <span className={cn(
                          "text-xs font-medium absolute -bottom-8 w-max transition-colors duration-300",
                          step >= s ? "text-primary font-bold" : "text-muted-foreground",
                          // Cacher les labels non actifs sur mobile pour éviter chevauchement
                          window.innerWidth < 640 && step !== s ? "hidden" : "block"
                        )}>
                          {s === 1 && "Infos"}
                          {s === 2 && "Service"}
                          {s === 3 && "Date"}
                          {s === 4 && "Paiement"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-8" /> {/* Espace pour les labels */}
              </div>

              <form onSubmit={handleSubmit} className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-2xl p-4 lg:p-5 shadow-sm space-y-4 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />

                {/* Étape 1 : Informations personnelles */}
                {step === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-3 mb-4 border-b border-border pb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold tracking-tight">Vos informations</h2>
                        <p className="text-xs text-muted-foreground">Pour vous contacter au sujet de votre RDV</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2 group">
                        <Label htmlFor="firstName" className="group-focus-within:text-primary transition-colors">Prénom *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                          placeholder="Ex: Awa"
                          className="h-10 bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2 group">
                        <Label htmlFor="lastName" className="group-focus-within:text-primary transition-colors">Nom *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                          placeholder="Ex: Diallo"
                          className="h-10 bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 group">
                      <Label htmlFor="email" className="group-focus-within:text-primary transition-colors">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          placeholder="Ex: mon.email@exemple.com"
                          className="pl-10 h-10 bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 group">
                      <Label htmlFor="phone" className="group-focus-within:text-primary transition-colors">Téléphone *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                          placeholder="Ex: +241 06 12 34 56"
                          className="pl-10 h-10 bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-3">
                      <Button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={!canProceedToStep2}
                        className="gap-2 px-6 shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300 h-10 text-sm"
                      >
                        Suivant
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Étape 2 : Service et coiffeur */}
                {step === 2 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-3 mb-4 border-b border-border pb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Scissors className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold tracking-tight">Service & Expert</h2>
                        <p className="text-xs text-muted-foreground">Personnalisez votre expérience</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-2.5">
                        <Label className="text-base font-semibold">Service souhaité</Label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsServiceModalOpen(true)}
                          className={cn(
                            "w-full h-11 justify-start text-left font-normal border-input focus:ring-2 focus:ring-primary/20 bg-background text-sm shadow-sm hover:bg-secondary/20 hover:text-primary transition-all",
                            !formData.serviceId && "text-muted-foreground"
                          )}
                        >
                          <Scissors className="mr-3 h-5 w-5" />
                          <span>{selectedService ? selectedService.name : "Sélectionner une prestation..."}</span>
                        </Button>
                      </div>

                      {/* Modal de sélection des services */}
                      <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
                        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                              <Scissors className="w-6 h-6 text-primary" />
                              Nos Services
                            </DialogTitle>
                            <DialogDescription>
                              Sélectionnez le service qui vous correspond
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {services.filter(s => s.is_active).map((service) => (
                              <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData({ ...formData, serviceId: service.id.toString() });
                                    setIsServiceModalOpen(false);
                                  }}
                                  className={cn(
                                    "w-full text-left rounded-xl border-2 p-4 transition-all hover:shadow-lg",
                                    formData.serviceId === service.id.toString()
                                      ? "border-primary bg-primary/5 shadow-md"
                                      : "border-border hover:border-primary/50"
                                  )}
                                >
                                  <div className="flex gap-4">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                                      <img
                                        src={service.image || getServiceImage(service.id.toString(), 200, 200)}
                                        alt={service.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-bold text-lg text-foreground leading-tight">{service.name}</h3>
                                        {formData.serviceId === service.id.toString() && (
                                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                                        )}
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
                                      <div className="flex items-center justify-between mt-3">
                                        <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                                          {formatPrice(Number(service.price) || 0, salon?.currency || 'XAF')}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{service.duration} min</span>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Mini-card confirmation inside form */}
                      {selectedService && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-secondary/30 border border-secondary rounded-xl p-4 flex gap-4 items-center"
                        >
                          <div className="w-16 h-16 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                            <img
                              src={selectedService.image || getServiceImage(selectedService.id.toString(), 100, 100)}
                              alt={selectedService.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-foreground">{selectedService.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{selectedService.description}</p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="font-bold text-primary">{formatPrice(Number(selectedService.price) || 0, salon?.currency || 'XAF')}</p>
                            <p className="text-xs text-muted-foreground">{selectedService.duration} min</p>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <Label className="text-base font-semibold">Coiffeur préféré</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEmployeeModalOpen(true)}
                        className={cn(
                          "w-full h-14 justify-start text-left font-normal border-input focus:ring-2 focus:ring-primary/20 bg-background text-base shadow-sm hover:bg-secondary/20 hover:text-primary transition-all",
                          !formData.employeeId && "text-muted-foreground"
                        )}
                      >
                        <User className="mr-3 h-5 w-5" />
                        <span>{selectedEmployee ? `${selectedEmployee.first_name || ''} ${selectedEmployee.last_name || ''}`.trim() : "Choisir un expert..."}</span>
                      </Button>

                      {/* Modal de sélection des coiffeurs */}
                      <Dialog open={isEmployeeModalOpen} onOpenChange={setIsEmployeeModalOpen}>
                        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                              <User className="w-6 h-6 text-primary" />
                              Nos Experts
                            </DialogTitle>
                            <DialogDescription>
                              Choisissez votre coiffeur préféré
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {coiffeurs.map((emp) => (
                              <motion.div
                                key={emp.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData({ ...formData, employeeId: emp.id.toString() });
                                    setIsEmployeeModalOpen(false);
                                  }}
                                  className={cn(
                                    "w-full text-left rounded-xl border-2 p-4 transition-all hover:shadow-lg",
                                    formData.employeeId === emp.id.toString()
                                      ? "border-primary bg-primary/5 shadow-md"
                                      : "border-border hover:border-primary/50"
                                  )}
                                >
                                  <div className="flex gap-4">
                                    <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-secondary flex items-center justify-center border-2 border-border">
                                      <span className="text-2xl font-bold text-primary">
                                        {(emp.first_name?.[0] || '').toUpperCase()}{(emp.last_name?.[0] || '').toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between gap-2">
                                        <div>
                                          <h3 className="font-bold text-lg text-foreground leading-tight">
                                            {emp.first_name || ''} {emp.last_name || ''}
                                          </h3>
                                          <p className="text-sm text-primary font-medium mt-0.5 capitalize">{emp.role?.toLowerCase() || ''}</p>
                                        </div>
                                        {formData.employeeId === emp.id.toString() && (
                                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                                        )}
                                      </div>
                                      {emp.specialties && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          <span className="text-xs bg-secondary text-foreground px-2 py-0.5 rounded-full">
                                            {typeof emp.specialties === 'string' ? emp.specialties : ''}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="flex justify-between pt-8 border-t border-border mt-8">
                      <Button type="button" variant="ghost" onClick={() => setStep(1)} size="lg" className="hover:bg-secondary/80">
                        Précédent
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setStep(3)}
                        disabled={!canProceedToStep3}
                        className="gap-2 px-8 shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300"
                        size="lg"
                      >
                        Suivant
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Étape 3 : Date et heure */}
                {step === 3 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-3 mb-4 border-b border-border pb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold tracking-tight">Date & Heure</h2>
                        <p className="text-xs text-muted-foreground">Votre moment de détente</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2.5">
                        <Label className="font-semibold">Date souhaitée</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-11 bg-background border-input shadow-sm hover:bg-secondary/20 hover:text-primary transition-all text-sm",
                                !formData.date && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-3 h-5 w-5" />
                              <span className="text-base">{formData.date ? format(formData.date, 'dd MMMM yyyy') : "Sélectionner une date"}</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 border-border shadow-xl rounded-xl" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={formData.date}
                              onSelect={(date) => setFormData({ ...formData, date: date })}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className="p-3"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2.5">
                        <Label className="font-semibold">Créneau horaire</Label>
                        <Select
                          value={formData.time}
                          onValueChange={(value) => setFormData({ ...formData, time: value })}
                        >
                          <SelectTrigger className="h-11 border-input focus:ring-2 focus:ring-primary/20 bg-background text-sm shadow-sm">
                            <div className="flex items-center gap-3">
                              <Clock className="w-5 h-5 text-muted-foreground" />
                              <SelectValue placeholder="Choisir une heure" />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time} className="cursor-pointer">
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="font-semibold text-sm">Notes pour l'expert (optionnel)</Label>
                      <Input
                        id="notes"
                        placeholder="Ex: J'ai les cheveux fragiles..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="h-10 bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>

                    <div className="flex justify-between pt-4 border-t border-border mt-4">
                      <Button type="button" variant="ghost" onClick={() => setStep(2)} size="lg" className="hover:bg-secondary/80">
                        Précédent
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canProceedToStep4 || isSubmitting}
                        className="gap-2 px-8 min-w-[200px] shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300"
                        size="lg"
                      >
                        {isSubmitting ? 'Validation...' : 'Continuer'}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Étape 4 : Paiement */}
                {step === 4 && createdAppointment && selectedService && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-3 mb-4 border-b border-border pb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-inner">
                        <Wallet className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Paiement</h2>
                        <p className="text-xs text-muted-foreground">Sécurisez votre rendez-vous maintenant</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-4 mb-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Banknote className="w-32 h-32 text-primary rotate-12" />
                      </div>
                      <div className="relative z-10 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-medium text-primary mb-1">Total à régler</p>
                          <span className="text-2xl font-bold text-primary tracking-tight">{formatPrice(Number(selectedService.price) || 0, salon?.currency || 'XAF')}</span>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-muted-foreground">Réservation garantie</p>
                          <p className="text-[10px] text-muted-foreground/60">Annulation gratuite -24h</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Moyen de paiement</Label>

                      <div className="grid grid-cols-1 gap-4">
                        {/* Airtel Money */}
                        <div
                          className={cn(
                            "group relative overflow-hidden border rounded-xl p-3 cursor-pointer transition-all duration-300",
                            formData.paymentMethod === 'airtel_money'
                              ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
                              : "border-border hover:border-primary/50 hover:bg-secondary/50"
                          )}
                          onClick={() => setFormData({ ...formData, paymentMethod: 'airtel_money' })}
                        >
                          <div className="flex items-center gap-4 relative z-10">
                            <div className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                              formData.paymentMethod === 'airtel_money' ? "border-primary bg-primary scale-110" : "border-muted-foreground"
                            )}>
                              {formData.paymentMethod === 'airtel_money' && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 rounded-full bg-white" />
                              )}
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shadow-sm group-hover:scale-105 transition-transform duration-300">
                              <Smartphone className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <p className="font-bold text-base">Airtel Money</p>
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Recommandé</span>
                              </div>
                              <p className="text-sm text-muted-foreground">Paiement mobile instantané et sécurisé</p>
                            </div>
                          </div>

                          <motion.div
                            initial={false}
                            animate={{
                              height: formData.paymentMethod === 'airtel_money' ? 'auto' : 0,
                              opacity: formData.paymentMethod === 'airtel_money' ? 1 : 0
                            }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t border-border/50 pl-12 animate-fade-in">
                              <Label htmlFor="airtelMoneyNumber" className="text-sm font-medium">Numéro Airtel Money à débiter</Label>
                              <div className="relative mt-2">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                  id="airtelMoneyNumber"
                                  type="tel"
                                  placeholder="06 12 34 56"
                                  value={formData.airtelMoneyNumber}
                                  onChange={(e) => setFormData({ ...formData, airtelMoneyNumber: e.target.value })}
                                  className="pl-10 h-12 bg-background border-input focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Vous recevrez une notification de confirmation sur ce numéro
                              </p>
                            </div>
                          </motion.div>
                        </div>

                        {/* Cash */}
                        <div
                          className={cn(
                            "group border rounded-xl p-5 cursor-pointer transition-all duration-300",
                            formData.paymentMethod === 'cash_on_arrival'
                              ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
                              : "border-border hover:border-primary/50 hover:bg-secondary/50"
                          )}
                          onClick={() => setFormData({ ...formData, paymentMethod: 'cash_on_arrival' })}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                              formData.paymentMethod === 'cash_on_arrival' ? "border-primary bg-primary scale-110" : "border-muted-foreground"
                            )}>
                              {formData.paymentMethod === 'cash_on_arrival' && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 rounded-full bg-white" />
                              )}
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 shadow-sm group-hover:scale-105 transition-transform duration-300">
                              <Banknote className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-lg">Paiement sur place</p>
                              <p className="text-sm text-muted-foreground">Réglez en espèces ou par carte le jour J</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-8 border-t border-border mt-8">
                      <Button type="button" variant="ghost" onClick={() => setStep(3)} className="hover:bg-secondary/80">
                        Précédent
                      </Button>
                      <Button
                        type="button"
                        onClick={handlePayment}
                        disabled={!canSubmitPayment || isSubmitting}
                        className={cn(
                          "gap-2 px-8 shadow-lg hover:shadow-primary/25 transition-all duration-300",
                          isSubmitting ? "opacity-80" : "hover:-translate-y-0.5"
                        )}
                        size="lg"
                      >
                        {isSubmitting
                          ? (formData.paymentMethod === 'airtel_money' ? 'Envoi de la demande...' : 'Confirmation...')
                          : 'Confirmer la réservation'
                        }
                        {!isSubmitting && <CheckCircle2 className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Colonne latérale : Résumé permanent (Visible sur toutes les étapes) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Carte du service sélectionné */}
                {selectedService ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5"
                  >
                    <div className="h-48 relative overflow-hidden group">
                      <motion.img
                        src={selectedService.image || getServiceImage(selectedService.id.toString(), 600, 400)}
                        alt={selectedService.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        Sélectionné
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="font-bold text-2xl leading-tight mb-1 text-shadow-sm">{selectedService.name}</h3>
                        <div className="flex items-center gap-2 opacity-90 text-sm">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{selectedService.duration} min</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-b from-card to-secondary/20 space-y-6">
                      <div className="flex justify-between items-end border-b border-border/50 pb-5">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Prix total</p>
                          <div className="flex items-baseline gap-1">
                            <p className="font-extrabold text-3xl text-primary">{formatPrice(Number(selectedService.price) || 0, salon?.currency || 'XAF')}</p>
                          </div>
                        </div>
                      </div>

                      {/* Récapitulatif dynamique des choix */}
                      <div className="space-y-4">
                        {formData.date ? (
                          <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Date</p>
                              <p className="font-medium">{format(formData.date, 'EEEE d MMMM yyyy')}</p>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="flex items-center gap-4 opacity-40">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-medium">Date à définir</p>
                          </div>
                        )}

                        {formData.time ? (
                          <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                              <Clock className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Heure</p>
                              <p className="font-medium">{formData.time}</p>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="flex items-center gap-4 opacity-40">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                              <Clock className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-medium">Heure à définir</p>
                          </div>
                        )}

                        {formData.employeeId ? (
                          <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Coiffeur</p>
                              <p className="font-medium">{coiffeurs.find(c => String(c.id) === String(formData.employeeId))?.first_name}</p>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="flex items-center gap-4 opacity-40">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                              <User className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-medium">Coiffeur à définir</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-card border border-border border-dashed border-2 rounded-2xl p-8 text-center"
                  >
                    <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Scissors className="w-10 h-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Votre sélection</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Sélectionnez un service à l'étape suivante pour voir apparaître le résumé de votre commande ici.
                    </p>
                  </motion.div>
                )}

                {/* Carte aide / contact rapide améliorée */}
                <div className="bg-gradient-to-br from-secondary/50 to-secondary/20 border border-secondary rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-1">Besoin d'aide ?</h4>
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        Vous ne trouvez pas le créneau idéal ou vous avez une question spécifique ?
                      </p>
                      <a href="tel:+24100000000" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-2">
                        <Phone className="w-3 h-3" /> +241 00 00 00 00
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

