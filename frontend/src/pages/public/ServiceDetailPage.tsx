import { useParams, useNavigate, Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Banknote, Calendar, ArrowRight, Search } from 'lucide-react';
import { getServiceById, getCategoryById } from '@/data/mockData';
import { HeroSection } from '@/components/public/HeroSection';
import { AnimatedSection } from '@/components/public/AnimatedSection';
import { getServiceImage } from '@/lib/unsplash';
import { useTenant } from '@/contexts/TenantContext';
import { motion } from 'framer-motion';
import { AkomaSymbol } from '@/components/african-symbols/AfricanSymbols';
import { formatPrice } from '@/lib/utils';


export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { salon } = useTenant();
  const service = id ? getServiceById(id) : null;
  const category = service ? getCategoryById(service.categoryId) : null;
  const heroImage = service?.image || getServiceImage(service?.id || '', 1920, 1080);

  if (!service) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-primary" />
            </div>
          </motion.div>
          <h2 className="text-3xl font-bold">Service introuvable</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Le service demandé n'existe pas ou n'est plus disponible.
          </p>
          <Button onClick={() => navigate('/public/services')} variant="outline" size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux services
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <HeroSection
        backgroundImage={heroImage}
        title={service.name}
        description={service.description || `Découvrez notre service ${service.name}`}
        decorativeElements={null}
      />

      {/* Détails du service */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <AnimatedSection variant="fadeInUp">
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/public/services')}
                className="hover:scale-105 transition-transform"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <span
                className="px-4 py-2 text-sm font-medium rounded-full text-white"
                style={{ backgroundColor: category?.color || 'hsl(var(--muted))' }}
              >
                {category?.name || 'Sans catégorie'}
              </span>
            </div>

            {/* Image du service en grand */}
            <div className="relative h-80 rounded-xl overflow-hidden bg-secondary mb-8">
              <motion.img
                src={service.image || getServiceImage(service.id, 1200, 800)}
                alt={service.name}
                className="w-full h-full object-cover"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-2">{service.name}</h2>
                {service.description && (
                  <p className="text-white/90 drop-shadow-md">{service.description}</p>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 space-y-8">
              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  className="flex items-center gap-4 p-6 bg-secondary/50 rounded-lg"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Durée</p>
                    <p className="text-2xl font-bold">{service.duration} minutes</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-4 p-6 bg-secondary/50 rounded-lg"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Banknote className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prix</p>
                    <p className="text-2xl font-bold text-primary">{formatPrice(service.price, salon?.currency)}</p>
                  </div>
                </motion.div>
              </div>

              {/* Description détaillée */}
              {service.description && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <AkomaSymbol size={24} animated={true} color="gradient" />
                    Description
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                </div>
              )}

              {/* CTA Réservation */}
              <div className="pt-6 border-t border-border">
                <Link to="/public/booking" state={{ serviceId: service.id }}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button size="lg" className="w-full gap-2">
                      <Calendar className="w-5 h-5" />
                      Réserver ce service
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </PublicLayout>
  );
}

