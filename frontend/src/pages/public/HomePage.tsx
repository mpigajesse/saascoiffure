import { PublicLayout } from '@/components/layout/PublicLayout';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { Calendar, Scissors, Sparkles, ArrowRight, Clock, Banknote, Users, Star } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useServices } from '@/hooks/useApi';
import { usePublicServices } from '@/hooks/usePublicApi';
import { usePublicRoutes } from '@/hooks/usePublicRoutes';
import { useEffect, useRef } from 'react';

import heroImage from '@/assets/hero-salon.jpg';
import { HeroSection } from '@/components/public/HeroSection';
import { AnimatedSection } from '@/components/public/AnimatedSection';
import { AnimatedCard } from '@/components/public/AnimatedCard';
import { StaggerGrid, StaggerItem } from '@/components/public/StaggerGrid';
import { ParallaxSection } from '@/components/public/ParallaxSection';
import { getServiceImage } from '@/lib/unsplash';
import { motion } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';
import { AkomaSymbol, AfricanStarSymbol, SankofaSymbol } from '@/components/african-symbols/AfricanSymbols';

export default function HomePage() {
  const { salon } = useTenant();
  const { slug } = useParams<{ slug: string }>();
  const routes = usePublicRoutes();
  const isPublicRoute = !!slug;

  // Use public API for slug routes, private for legacy /public routes
  const privateServicesQuery = useServices();
  const publicServicesQuery = usePublicServices();
  const { data: servicesData } = isPublicRoute ? publicServicesQuery : privateServicesQuery;

  const services = servicesData?.results || [];
  const featuredServices = services.slice(0, 6);
  // Image du dashboard (ou image personnalisée du salon)
  const heroImageUrl = salon?.heroImage || heroImage;

  // Auto-scroll logic
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);
  const restartTimeout = useRef<NodeJS.Timeout | null>(null);
  const isUserInteracting = useRef(false);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || featuredServices.length === 0) return;

    const clearTimers = () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
        autoScrollInterval.current = null;
      }
      if (restartTimeout.current) {
        clearTimeout(restartTimeout.current);
        restartTimeout.current = null;
      }
    };

    const startAutoScroll = () => {
      // Éviter les duplications d'intervalle
      if (autoScrollInterval.current) return;

      autoScrollInterval.current = setInterval(() => {
        // Vérifier si le document est visible pour éviter les comportements étranges en arrière-plan
        if (!isUserInteracting.current && carousel && !document.hidden) {
          const maxScroll = carousel.scrollWidth - carousel.clientWidth;
          const currentScroll = carousel.scrollLeft;

          // Si on est à la fin, revenir au début proprement
          if (currentScroll >= maxScroll - 20) {
            carousel.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            // Adapter la distance de défilement pour matcher la largeur d'une carte + gap
            const scrollDistance = 340; // w-80 (320px) + gap-6 (24px) ~ 344px
            carousel.scrollBy({ left: scrollDistance, behavior: 'smooth' });
          }
        }
      }, 5000); // Intervalle plus lent (5s) pour plus de calme
    };

    const handleInteractionStart = () => {
      isUserInteracting.current = true;
      clearTimers();
    };

    const handleInteractionEnd = () => {
      clearTimers();
      // Reprendre l'auto-scroll après un délai plus long (8s) pour laisser le temps de lire/finir le geste
      restartTimeout.current = setTimeout(() => {
        isUserInteracting.current = false;
        startAutoScroll();
      }, 8000);
    };

    // Démarrer initialement
    startAutoScroll();

    // Event listeners simplifiés et plus robustes
    // On écoute aussi 'touchmove' pour être sûr de détecter le scroll continu sur mobile
    carousel.addEventListener('mouseenter', handleInteractionStart);
    carousel.addEventListener('mouseleave', handleInteractionEnd);
    carousel.addEventListener('touchstart', handleInteractionStart, { passive: true });
    carousel.addEventListener('touchmove', handleInteractionStart, { passive: true });
    carousel.addEventListener('touchend', handleInteractionEnd);
    // On retire 'scroll' car il cause des boucles de feedback avec le smooth scroll automatique 
    // et l'interaction utilisateur est déjà bien couverte par hover/touch

    // Cleanup
    return () => {
      clearTimers();
      carousel.removeEventListener('mouseenter', handleInteractionStart);
      carousel.removeEventListener('mouseleave', handleInteractionEnd);
      carousel.removeEventListener('touchstart', handleInteractionStart);
      carousel.removeEventListener('touchmove', handleInteractionStart);
      carousel.removeEventListener('touchend', handleInteractionEnd);
    };
  }, [featuredServices.length]);

  return (
    <PublicLayout>
      {/* Hero Section avec animations */}
      <HeroSection
        backgroundImage={heroImageUrl}
        subtitle={
          <div className="flex items-center gap-2">
            <AkomaSymbol size={24} animated={true} color="yellow" />
            <span>Bienvenue chez {salon?.name || 'notre salon'}</span>
          </div>
        }
        title={
          <>
            Votre beauté,
            <br />
            <span className="text-accent">Notre passion</span>
          </>
        }
        description="Découvrez nos services de coiffure et prenez rendez-vous en ligne"
        actions={
          <>
            <Link to={routes.booking}>
              <Button size="lg" className="gap-2 shadow-lg hover:shadow-glow-primary transition-all hover:scale-105">
                <Calendar className="w-5 h-5" />
                Réserver maintenant
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to={routes.services}>
              <Button size="lg" variant="outline" className="gap-2 bg-background/10 backdrop-blur-sm border-background/30 text-background hover:bg-background/20">
                <Scissors className="w-5 h-5" />
                Voir nos services
              </Button>
            </Link>
          </>
        }
        decorativeElements={
          <>


          </>
        }
      />

      {/* Services en vedette avec design moderne et asymétrique */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-background via-secondary/20 to-background relative overflow-hidden">
        {/* Éléments décoratifs en arrière-plan */}
        <motion.div
          className="absolute top-20 left-10 text-primary/10"
          animate={{
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1],
            y: [0, -30, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Scissors className="w-32 h-32" />
        </motion.div>

        <motion.div
          className="absolute bottom-20 right-10 text-secondary/10"
          animate={{
            rotate: [360, 180, 0],
            scale: [1, 1.1, 1],
            y: [0, 20, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          <Clock className="w-24 h-24" />
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-1/4 text-yellow-500/10"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="w-24 h-24" />
        </motion.div>

        {/* Vague décorative */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/10 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          {/* Header de section amélioré */}
          <AnimatedSection variant="fadeInUp" className="text-center mb-16">
            <motion.div
              className="flex items-center justify-center gap-4 mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              >
                <AfricanStarSymbol size={40} animated={true} color="gradient" />
              </motion.div>
              <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Nos Services
              </h2>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 0.5 }}
              >
                <AfricanStarSymbol size={40} animated={true} color="gradient" />
              </motion.div>
            </motion.div>

            <motion.p
              className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Découvrez notre gamme complète de services de coiffure professionnels,
              conçus pour sublimer votre beauté et répondre à tous vos besoins
            </motion.p>


          </AnimatedSection>

          {/* Services Carousel - Réutilisation du carrousel de la page Services */}
          <div className="space-y-8 mb-12">
            <AnimatedSection variant="fadeInUp">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Nos services en vedette
                </h2>
                <p className="text-muted-foreground">
                  Découvrez notre sélection de prestations professionnelles
                </p>
              </div>

              {/* Carousel manuel avec navigation */}
              <div className="relative group px-4 lg:px-12">
                <motion.button
                  className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-background/80 backdrop-blur-md text-foreground p-3 rounded-full shadow-xl border border-border/50 hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100 transform -translate-x-1/2"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => document.getElementById('home-services-carousel')?.scrollBy({ left: -340, behavior: 'smooth' })}
                >
                  <ArrowRight className="w-6 h-6 rotate-180" />
                </motion.button>
                <motion.button
                  className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-background/80 backdrop-blur-md text-foreground p-3 rounded-full shadow-xl border border-border/50 hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100 transform translate-x-1/2"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => document.getElementById('home-services-carousel')?.scrollBy({ left: 340, behavior: 'smooth' })}
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.button>

                <div
                  ref={carouselRef}
                  id="home-services-carousel"
                  className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <style>{`#home-services-carousel::-webkit-scrollbar { display: none; }`}</style>

                  {featuredServices.map((service, index) => {
                    const serviceImage = service.image || getServiceImage(service.id.toString(), 400, 300);
                    return (
                      <motion.div
                        key={service.id}
                        className="flex-shrink-0 w-80 snap-center"
                        whileHover={{ y: -10, transition: { type: "spring", stiffness: 300 } }}
                      >
                        <div className="bg-card/80 backdrop-blur-sm border border-border/30 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                          <div className="relative h-52 overflow-hidden bg-gradient-to-br from-muted/10 to-secondary/10 group/card">
                            <div className="absolute inset-0 bg-cover bg-center filter blur-lg scale-110 opacity-30" style={{ backgroundImage: `url(${serviceImage})` }} />
                            <img src={serviceImage} alt={service.name} className="relative z-10 w-full h-full object-contain transition-transform duration-700 group-hover/card:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                            <div className="absolute top-3 left-3 right-3 flex justify-between z-20">
                              {service.category_name && <span className="px-3 py-1 text-xs font-bold rounded-full text-white shadow-lg bg-primary/90 backdrop-blur-sm">{service.category_name}</span>}
                            </div>
                            <div className="absolute bottom-3 right-3 z-20">
                              <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5 shadow-lg">
                                <Banknote className="w-3.5 h-3.5 text-accent" />
                                <span className="font-bold text-white text-sm">{formatPrice(Number(service.price) || 0, salon?.currency)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-5 flex flex-col flex-1">
                            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">{service.name}</h3>
                            {service.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">{service.description}</p>}
                            <div className="mt-auto pt-2">
                              <Link to={routes.booking} state={{ serviceId: service.id }} className="block w-full">
                                <Button className="w-full gap-2 shadow-sm hover:shadow-primary/50 transition-all font-semibold">Réserver<ArrowRight className="w-4 h-4" /></Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  {featuredServices.length > 0 && (
                    <div className="flex-shrink-0 w-48 snap-center flex items-center justify-center">
                      <Link to={routes.services} className="group flex flex-col items-center gap-3 text-muted-foreground hover:text-primary transition-colors p-4">
                        <div className="w-16 h-16 rounded-full bg-card border-2 border-dashed border-border group-hover:border-primary flex items-center justify-center transition-all group-hover:scale-110">
                          <ArrowRight className="w-6 h-6" />
                        </div>
                        <span className="font-medium text-sm">Voir tout</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Bouton voir tous */}
              <div className="text-center mt-8">
                <Link to={routes.services}>
                  <Button size="lg" className="gap-2 shadow-lg hover:shadow-glow-primary">
                    Voir tous les services
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>

          {/* Section catégories harmonisée */}
          <div className="bg-gradient-to-br from-card/80 to-background/60 backdrop-blur-xl rounded-2xl p-8 border border-border shadow-xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-2">
                Catégories de services
              </h3>
              <p className="text-muted-foreground">
                Explorez nos spécialités
              </p>
            </div>

            {featuredServices.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4">
                <Link to={routes.services}>
                  <motion.button
                    className="px-6 py-3 bg-card/60 backdrop-blur-sm border border-border rounded-full text-muted-foreground hover:border-primary hover:text-primary transition-all hover:shadow-md"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Voir tous nos services
                  </motion.button>
                </Link>
              </div>
            )}
          </div>


        </div>
      </section>

      {/* Pourquoi nous choisir avec animations */}
      <section className="py-12 lg:py-16 bg-secondary/50 relative overflow-hidden">
        <div className="absolute inset-0 pattern-mudcloth opacity-30" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <AnimatedSection variant="fadeInUp" className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Pourquoi nous choisir ?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Excellence, professionnalisme et passion pour votre beauté
            </p>
          </AnimatedSection>

          <StaggerGrid columns={3}>
            {[
              {
                icon: <Sparkles className="w-8 h-8 text-primary" />,
                title: 'Expertise',
                description: 'Des professionnels qualifiés avec des années d\'expérience',
                symbol: <Sparkles className="w-6 h-6 text-primary" />,
                color: 'from-green-500/20 to-yellow-500/20',
              },
              {
                icon: <Clock className="w-8 h-8 text-primary" />,
                title: 'Réservation en ligne',
                description: 'Réservez votre créneau en quelques clics, 24/7',
                symbol: <AkomaSymbol size={24} animated={true} color="green" />,
                color: 'from-yellow-500/20 to-blue-500/20',
              },
              {
                icon: <Users className="w-8 h-8 text-primary" />,
                title: 'Service client',
                description: 'Une équipe à votre écoute pour répondre à tous vos besoins',
                symbol: <SankofaSymbol size={24} animated={true} color="blue" />,
                color: 'from-blue-500/20 to-green-500/20',
              },
            ].map((feature, index) => (
              <StaggerItem key={index}>
                <motion.div
                  className="bg-card border border-border rounded-xl p-8 text-center relative overflow-hidden group"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative z-10">
                    <motion.div
                      className="flex justify-center mb-4"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <div className="p-4 bg-primary/10 rounded-full">
                        {feature.icon}
                      </div>
                    </motion.div>

                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* CTA Section */}
      <ParallaxSection speed={0.2}>
        <section className="py-12 lg:py-16 bg-gradient-gabon relative overflow-hidden">
          <div className="absolute inset-0 pattern-gabon opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/95 via-foreground/90 to-foreground/95" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            {/* CTA */}
            <AnimatedSection variant="scaleIn" className="text-center space-y-6">

              <h2 className="text-4xl font-bold text-white drop-shadow-lg">Prêt à prendre rendez-vous ?</h2>
              <p className="text-xl text-white/95 max-w-2xl mx-auto drop-shadow-md">
                Réservez votre créneau dès maintenant et laissez-nous prendre soin de vous
              </p>
              <Link to={routes.booking}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-6"
                >
                  <Button size="lg" variant="secondary" className="gap-2 shadow-xl hover:shadow-2xl transition-all bg-white text-foreground hover:bg-white/90">
                    <Calendar className="w-5 h-5" />
                    Réserver un rendez-vous
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              </Link>
            </AnimatedSection>
          </div>
        </section>
      </ParallaxSection>
    </PublicLayout>
  );
}