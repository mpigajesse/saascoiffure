import { useParams, useNavigate, Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Banknote, Calendar, ArrowRight, Search } from 'lucide-react';
import { HeroSection } from '@/components/public/HeroSection';
import { AnimatedSection } from '@/components/public/AnimatedSection';
import { getServiceImage } from '@/lib/unsplash';
import { useTenant } from '@/contexts/TenantContext';
import { motion } from 'framer-motion';
import { AkomaSymbol } from '@/components/african-symbols/AfricanSymbols';
import { formatPrice } from '@/lib/utils';
import { useServices, useCategories } from '@/hooks/useApi';
import { usePublicServices, usePublicServiceCategories } from '@/hooks/usePublicApi';
import { usePublicRoutes } from '@/hooks/usePublicRoutes';

export default function ServiceDetailPage() {
  const { id, slug } = useParams<{ id: string; slug?: string }>();
  const navigate = useNavigate();
  const { salon } = useTenant();
  const routes = usePublicRoutes();
  const isPublicRoute = !!slug;
  
  // Utiliser l'API réelle - public ou privée
  const privateServicesQuery = useServices();
  const publicServicesQuery = usePublicServices();
  const privateCategsQuery = useCategories();
  const publicCategsQuery = usePublicServiceCategories();
  
  const { data: servicesData, isLoading } = isPublicRoute ? publicServicesQuery : privateServicesQuery;
  const { data: categoriesData } = isPublicRoute ? publicCategsQuery : privateCategsQuery;
  
  const services = servicesData?.results || [];
  const categories = categoriesData || [];
  
  // Trouver le service par ID
  const service = id ? services.find(s => s.id.toString() === id) : null;
  const category = service && service.categoryId ? categories.find(c => String(c.id) === String(service.categoryId)) : null;
  const heroImage = service?.image || getServiceImage(service?.id || '', 1920, 1080);

  // Loading state
  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Chargement du service...</p>
        </div>
      </PublicLayout>
    );
  }

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
          <Button onClick={() => navigate(routes.services)} variant="outline" size="lg">
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
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <AnimatedSection variant="fadeInUp">
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(routes.services)}
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

            {/* Layout deux colonnes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              
              {/* Colonne gauche : Image principale et infos essentielles */}
              <div className="space-y-6">
                {/* Image principale */}
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gradient-to-br from-muted/10 to-secondary/10">
                  {/* Image floue en arrière-plan */}
                  <div 
                    className="absolute inset-0 bg-cover filter blur-lg scale-110 opacity-30"
                    style={{ backgroundImage: `url(${service.main_image_url || service.image || getServiceImage(service.id, 1200, 800)})`, objectPosition: 'center 25%' }}
                  />
                  
                  {/* Image principale nette */}
                  <motion.img
                    src={service.main_image_url || service.image || getServiceImage(service.id, 1200, 800)}
                    alt={service.name}
                    className="relative z-10 w-full h-full object-contain"
                    style={{ objectPosition: 'center 25%' }}
                    initial={{ scale: 1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.8 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-2">{service.name}</h2>
                  </div>
                </div>

                {/* Informations essentielles */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Durée</p>
                      <p className="font-bold">{service.duration} min</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Banknote className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Prix</p>
                      <p className="font-bold text-primary">{formatPrice(Number(service.price), salon?.currency)}</p>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Colonne droite : Galerie et détails enrichis */}
              <div className="space-y-8">
                
                {/* Galerie d'images supplémentaires */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <AkomaSymbol size={20} animated={true} color="gradient" />
                    Autres angles de cette coiffure
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Variations d'images pour cette coiffure - Support API et Mock */}
                    {service.images && service.images.length > 0 ? (
                      // Affichage via API (images réelles)
                      service.images.filter(img => !img.is_primary).map((img) => (
                        <motion.div
                          key={img.id}
                          className="relative aspect-[4/5] rounded-lg overflow-hidden cursor-pointer group"
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {/* Image floue en arrière-plan */}
                          <div 
                            className="absolute inset-0 bg-cover filter blur-lg scale-110 opacity-30"
                            style={{ backgroundImage: `url(${img.image})`, objectPosition: 'center 25%' }}
                          />
                          
                          {/* Image nette */}
                          <img
                            src={img.image}
                            alt={img.alt_text || `${service.name} - Vue détail`}
                            className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            style={{ objectPosition: 'center 25%' }}
                          />
                          
                          {/* Overlay au hover */}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="bg-white/90 rounded-full p-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      // Fallback Mock (si pas d'images API)
                      [2, 3, 4, 5].map((imageIndex) => (
                        <motion.div
                          key={imageIndex}
                          className="relative aspect-[4/5] rounded-lg overflow-hidden cursor-pointer group"
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {/* Image floue en arrière-plan */}
                          <div 
                            className="absolute inset-0 bg-cover filter blur-lg scale-110 opacity-30"
                            style={{ backgroundImage: `url(${getServiceImage(service.id + imageIndex, 800, 1000)})`, objectPosition: 'center 25%' }}
                          />
                          
                          {/* Image nette */}
                          <img
                            src={getServiceImage(service.id + imageIndex, 800, 1000)}
                            alt={`${service.name} - Vue ${imageIndex}`}
                            className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            style={{ objectPosition: 'center 25%' }}
                          />
                          
                          {/* Overlay au hover */}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="bg-white/90 rounded-full p-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* Détails enrichis */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                  
                  {/* Description */}
                  {service.description && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        Description du service
                      </h4>
                      <p className="text-muted-foreground leading-relaxed text-sm">{service.description}</p>
                    </div>
                  )}

                  {/* Avantages */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Pourquoi choisir ce service ?
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Coiffure personnalisée selon votre morphologie
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Produits professionnels de qualité premium
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Conseils d'entretien personnalisés
                      </div>
                    </div>
                  </div>

                  {/* Temps d'attente estimé */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Disponibilités
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-muted-foreground">Disponible cette semaine</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* CTA Réservation */}
                <div className="space-y-4">
                  <Link to={routes.booking} state={{ serviceId: service.id }}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button size="lg" className="w-full gap-2 text-lg py-6">
                        <Calendar className="w-6 h-6" />
                        Réserver maintenant - {formatPrice(Number(service.price), salon?.currency)}
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </motion.div>
                  </Link>
                  
                  <p className="text-center text-sm text-muted-foreground">
                    💡 Réservation gratuite • Annulation jusqu'à 24h avant
                  </p>
                </div>
              </div>
            </div>


          </AnimatedSection>
        </div>
      </section>
    </PublicLayout>
  );
}

