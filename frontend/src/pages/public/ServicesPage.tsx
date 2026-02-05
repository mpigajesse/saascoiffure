import { PublicLayout } from '@/components/layout/PublicLayout';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { Scissors, ArrowRight, Filter, Users, User, UserCircle, Baby, Sparkles, Clock, Star, Heart, Grid3x3, Layers, Eye, Banknote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useServices, useServiceCategories } from '@/hooks/useApi';
import { AfricanStarSymbol } from '@/components/african-symbols/AfricanSymbols';
import { formatPrice } from '@/lib/utils';

import { AnimatedSection, StaggerGrid, StaggerItem, HeroSection } from '@/components/public';
import { ServiceCard } from '@/components/services';
import { getPageHeroImage, getServiceImage } from '@/lib/unsplash';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ServicesPage() {
  const { salon } = useTenant();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTarget, setSelectedTarget] = useState<string>('all');
  const [hoveredServiceId, setHoveredServiceId] = useState<string | number | null>(null);
  const [isFilterAnimating, setIsFilterAnimating] = useState(false);
  const [viewMode, setViewMode] = useState<'mosaic' | 'carousel'>('mosaic');
  const { scrollY } = useScroll();
  
  // Récupération des données via API
  const { data: servicesData, isLoading: servicesLoading } = useServices();
  const { data: categoriesData, isLoading: categoriesLoading } = useServiceCategories();
  
  const services = servicesData?.results || [];
  const categories = categoriesData || [];
  
  // Debug: Log data structure
  console.log('Services data:', services[0]);
  console.log('Categories data:', categories[0]);
  
  // Gestion du chargement
  const isLoading = servicesLoading || categoriesLoading;
  
  // Fonction pour trouver une catégorie par ID
  const getCategoryById = (id: string | number) => {
    return categories.find(cat => cat.id === id || cat.id === String(id));
  };
  
  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scaleHero = useTransform(scrollY, [0, 300], [1, 0.8]);
  
  // Image unique pour la page services - Tresses et coiffures traditionnelles
  const heroImage = salon?.heroImage || getPageHeroImage('services', 1920, 1080);

  const filteredServices = services.filter(s => {
    if (!(s.is_active ?? s.isActive) || !(s.is_published ?? s.isPublished)) return false;
    const matchesCategory = selectedCategory === 'all' || 
      (s.category && (String(s.category.id || s.category) === selectedCategory));
    const matchesTarget = selectedTarget === 'all' || !s.target || s.target === selectedTarget;
    return matchesCategory && matchesTarget;
  });

  // Animation des filtres
  useEffect(() => {
    setIsFilterAnimating(true);
    const timer = setTimeout(() => setIsFilterAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedTarget]);

  // Animation stats dynamiques
  const serviceCount = filteredServices.length;
  const averagePrice = Math.round(
    filteredServices.reduce((acc, s) => acc + (Number(s.price) || 0), 0) / serviceCount || 0
  );
  const totalDuration = filteredServices.reduce((acc, s) => acc + s.duration, 0);

  // Affichage de chargement
  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Chargement des services...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Hero Section immersive avec parallax */}
      <motion.div 
        className="relative h-[70vh] min-h-[600px] overflow-hidden"
        style={{ y: heroY, scale: scaleHero, opacity: heroOpacity }}
      >
        {/* Background with parallax effect */}
        <div className="absolute inset-0">
          <motion.img
            src={heroImage}
            alt="Services de coiffure"
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1.2 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
          {/* Animated overlay effects */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20"
            animate={{ x: [-100, 100] }}
            transition={{ duration: 8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
        </div>
        
        {/* Floating elements */}
        <motion.div
          className="absolute top-10 left-10 text-yellow-400 opacity-60"
          animate={{ 
            rotate: [0, 15, -15, 0], 
            scale: [1, 1.2, 1],
            y: [0, -10, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="w-8 h-8" />
        </motion.div>
        
        <motion.div
          className="absolute top-20 right-20 text-pink-400 opacity-60"
          animate={{ 
            rotate: [0, -20, 20, 0], 
            scale: [1, 1.3, 1],
            x: [0, 10, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <Heart className="w-6 h-6" />
        </motion.div>
        
        <motion.div
          className="absolute bottom-20 left-20 text-blue-400 opacity-60"
          animate={{ 
            rotate: [0, 25, -25, 0], 
            scale: [1, 1.1, 1],
            y: [0, -15, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          <Star className="w-7 h-7" />
        </motion.div>

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-6"
            >
              <div className="flex items-center justify-center gap-4 mb-4">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <AfricanStarSymbol size={50} animated={true} color="yellow" />
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-yellow-200 to-white">
                  Nos Services
                </h1>
                <motion.div
                  animate={{ scale: [1.2, 1, 1.2], rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                  <AfricanStarSymbol size={50} animated={true} color="gradient" />
                </motion.div>
              </div>
            </motion.div>
            
            <motion.p 
              className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Découvrez notre gamme complète de services de coiffure pour tous vos besoins
            </motion.p>
            
            {/* Animated stats */}
            <motion.div 
              className="grid grid-cols-3 gap-8 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div 
                  className="text-4xl font-bold text-yellow-300"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
                >
                  {serviceCount}
                </motion.div>
                <div className="text-sm text-white/80">Services</div>
              </motion.div>
              
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div 
                  className="text-4xl font-bold text-pink-300"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1, type: "spring" }}
                >
                  {categories.length}
                </motion.div>
                <div className="text-sm text-white/80">Catégories</div>
              </motion.div>
              
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div 
                  className="text-4xl font-bold text-blue-300"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.2, type: "spring" }}
                >
                  {formatPrice(averagePrice, salon?.currency)}
                </motion.div>
                <div className="text-sm text-white/80">Prix moyen</div>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-full text-white hover:bg-white/20 transition-all"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.25)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span>Explorer nos services</span>
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2" />
          </div>
        </motion.div>
      </motion.div>

      {/* Filtres dynamiques avec animations fluides */}
      <AnimatedSection variant="fadeInDown">
        <section className="py-6 bg-gradient-to-b from-background to-secondary/20 border-b border-border sticky top-20 z-40 backdrop-blur-sm bg-background/95 shadow-lg">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div 
              className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-6 space-y-6 shadow-xl"
              animate={isFilterAnimating ? { scale: [1, 0.98, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {/* Header filtres */}
              <motion.div 
                className="flex items-center justify-between mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Filter className="w-5 h-5 text-primary" />
                  </motion.div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Filtres interactifs
                  </h3>
                </div>
                <AnimatePresence>
                  {(selectedCategory !== 'all' || selectedTarget !== 'all') && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory('all');
                          setSelectedTarget('all');
                        }}
                        className="h-8 text-xs px-3 hover:bg-destructive/10 hover:text-destructive transition-all"
                      >
                        Réinitialiser
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Filtre par catégorie */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Catégories</span>
                  <motion.div
                    className="ml-auto"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
                      {categories.length} disponibles
                    </span>
                  </motion.div>
                </div>
                <motion.div 
                  className="flex flex-wrap gap-2"
                  layout
                >
                  <motion.div
                    key="cat-all"
                    layout
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={selectedCategory === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('all')}
                      className={cn(
                        "h-8 text-xs px-3 transition-all",
                        selectedCategory === 'all' 
                          ? "shadow-lg shadow-primary/25 scale-105" 
                          : "hover:shadow-md hover:scale-105"
                      )}
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Toutes
                    </Button>
                  </motion.div>
                  {categories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={selectedCategory === category.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className={cn(
                          "h-8 text-xs px-3 transition-all",
                          selectedCategory === category.id 
                            ? "shadow-lg scale-105" 
                            : "hover:shadow-md hover:scale-105"
                        )}
                        style={
                          selectedCategory === category.id
                            ? {
                                backgroundColor: category.color,
                                color: 'white',
                                borderColor: category.color,
                                boxShadow: `0 4px 12px ${category.color}40`
                              }
                            : undefined
                        }
                      >
                        {category.name}
                        <motion.div
                          className="w-2 h-2 rounded-full ml-1"
                          style={{ backgroundColor: category.color }}
                          animate={selectedCategory === category.id ? { scale: [1, 1.5, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        />
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Filtre par type de client */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Type de client</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'Tous', icon: Users, color: 'default' },
                    { id: 'homme', label: 'Homme', icon: User, color: 'blue' },
                    { id: 'femme', label: 'Femme', icon: UserCircle, color: 'pink' },
                    { id: 'enfant', label: 'Enfant', icon: Baby, color: 'yellow' }
                  ].map((target, index) => (
                    <motion.div
                      key={target.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={selectedTarget === target.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTarget(target.id)}
                        className={cn(
                          "h-8 text-xs px-3 transition-all gap-1.5",
                          selectedTarget === target.id 
                            ? "shadow-lg scale-105" 
                            : "hover:shadow-md hover:scale-105",
                          target.color === 'blue' && selectedTarget === target.id && "bg-blue-600 hover:bg-blue-700 text-white border-blue-600",
                          target.color === 'pink' && selectedTarget === target.id && "bg-pink-600 hover:bg-pink-700 text-white border-pink-600",
                          target.color === 'yellow' && selectedTarget === target.id && "bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600"
                        )}
                      >
                        <target.icon className="w-3 h-3" />
                        {target.label}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Résumé animé des filtres actifs */}
              <AnimatePresence>
                {(selectedCategory !== 'all' || selectedTarget !== 'all') && (
                  <motion.div 
                    className="flex items-center justify-between pt-4 border-t border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Scissors className="w-4 h-4 text-primary" />
                      </motion.div>
                      <span className="text-sm font-medium">
                        <motion.span
                          key={filteredServices.length}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-primary font-bold"
                        >
                          {filteredServices.length}
                        </motion.span>
                        <span className="text-muted-foreground ml-1">
                          service{filteredServices.length > 1 ? 's' : ''} trouvé{filteredServices.length > 1 ? 's' : ''}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedCategory !== 'all' && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                        >
                          {getCategoryById(selectedCategory)?.name}
                        </motion.span>
                      )}
                      {selectedTarget !== 'all' && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded-full"
                        >
                          {selectedTarget}
                        </motion.span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>
      </AnimatedSection>

      {/* Galerie interactive de services avec effets visuels avancés */}
      <section className="py-12 lg:py-16 bg-gradient-to-b from-background via-background to-secondary/30">
        <div className="container mx-auto px-4 lg:px-8">
          {filteredServices.length > 0 ? (
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header de la galerie avec sélecteur de vue */}
              <motion.div 
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Nos services de coiffure
                </h2>
                <p className="text-muted-foreground mb-6">
                  Explorez notre sélection de prestations professionnelles
                </p>
                
                {/* Sélecteur de mode d'affichage */}
                <motion.div 
                  className="inline-flex items-center gap-1 bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {[
                    { id: 'mosaic', label: 'Mosaïque', icon: Grid3x3 },
                    { id: 'carousel', label: 'Carrousel', icon: Layers }
                  ].map((mode) => (
                    <motion.button
                      key={mode.id}
                      onClick={() => setViewMode(mode.id as 'mosaic' | 'carousel')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                        viewMode === mode.id
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <mode.icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{mode.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>

              {/* Conteneur principal avec condition de vue */}
              <AnimatePresence mode="wait">
                {viewMode === 'mosaic' && (
                  <motion.div
                    key="mosaic"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  >
                    <AnimatePresence>
                      {filteredServices.map((service, index) => {
                        const category = service.category || getCategoryById(service.categoryId);
                        
                        return (
                          <motion.div
                            key={service.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8, y: 30 }}
                            animate={{ 
                              opacity: 1, 
                              scale: 1, 
                              y: 0,
                              transition: { 
                                delay: index * 0.03,
                                duration: 0.4,
                                type: "spring",
                                stiffness: 100
                              }
                            }}
                            exit={{ 
                              opacity: 0, 
                              scale: 0.8, 
                              y: -30,
                              transition: { duration: 0.2 }
                            }}
                            whileHover={{ 
                              scale: 1.02,
                              transition: { type: "spring", stiffness: 400 }
                            }}
                            onMouseEnter={() => setHoveredServiceId(service.id)}
                            onMouseLeave={() => setHoveredServiceId(null)}
                            className="relative group"
                          >
                            <div className="h-64 bg-card/80 backdrop-blur-sm border border-border/30 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                              {/* Image avec overlay */}
                              <div className="relative h-40 overflow-hidden">
                                <motion.img
                                  src={service.image || getServiceImage(service.id, 400, 300)}
                                  alt={service.name}
                                  className="w-full h-full object-cover"
                                  whileHover={{ scale: 1.1 }}
                                  transition={{ duration: 0.6 }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                
                                {/* Badge catégorie */}
                                <motion.div
                                  className="absolute top-3 left-3"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 }}
                                >
                                  <span
                                    className="px-2 py-1 text-xs font-semibold rounded-full text-white shadow-md"
                                    style={{
                                      backgroundColor: category?.color || 'hsl(var(--primary))',
                                    }}
                                  >
                                    {category?.name || 'Service'}
                                  </span>
                                </motion.div>
                                
                                {/* Badge type client */}
                                {service.target && (
                                  <motion.div
                                    className="absolute top-3 right-3"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 }}
                                  >
                                    <span 
                                      className={cn(
                                        "px-2 py-1 text-xs font-semibold rounded-full text-white shadow-md",
                                        service.target === 'homme' && "bg-blue-600",
                                        service.target === 'femme' && "bg-pink-600",
                                        service.target === 'enfant' && "bg-yellow-600"
                                      )}
                                    >
                                      {service.target}
                                    </span>
                                  </motion.div>
                                )}
                              </div>
                              
                              {/* Contenu */}
                              <div className="p-4">
                                <h3 className="font-semibold text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                                  {service.name}
                                </h3>
                                
                                {service.description && (
                                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                    {service.description}
                                  </p>
                                )}
                                
                                {/* Info bar */}
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    <span>{service.duration}min</span>
                                  </div>
                                  <div className="flex items-center gap-1 font-semibold text-primary">
                                    <Banknote className="w-3 h-3" />
                                    <span>{formatPrice(Number(service.price) || 0, salon?.currency)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Actions au hover */}
                            <motion.div
                              className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 p-4"
                              initial={{ opacity: 0 }}
                            >
                              <Link to={`/public/services/${service.id}`}>
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white"
                                >
                                  <Eye className="w-4 h-4" />
                                </motion.div>
                              </Link>
                              
                              <Link to="/public/booking" state={{ serviceId: service.id }}>
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="w-10 h-10 bg-primary/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-white"
                                >
                                  <ArrowRight className="w-4 h-4" />
                                </motion.div>
                              </Link>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                )}

                {viewMode === 'carousel' && (
                  <motion.div
                    key="carousel"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    {/* Navigation arrows simplifiés */}
                    {filteredServices.length > 2 && (
                      <>
                        <motion.button
                          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm text-foreground p-2 rounded-full shadow-md"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            const carousel = document.getElementById('services-carousel');
                            carousel?.scrollBy({ left: -320, behavior: 'smooth' });
                          }}
                        >
                          <ArrowRight className="w-4 h-4 rotate-180" />
                        </motion.button>
                        <motion.button
                          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm text-foreground p-2 rounded-full shadow-md"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            const carousel = document.getElementById('services-carousel');
                            carousel?.scrollBy({ left: 320, behavior: 'smooth' });
                          }}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.button>
                      </>
                    )}
                    
                    {/* Carousel container */}
                    <div 
                      id="services-carousel"
                      className="flex gap-4 overflow-x-auto pb-4 px-8"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      <AnimatePresence>
                        {filteredServices.map((service, index) => {
                          const category = service.category || getCategoryById(service.categoryId);
                          return (
                            <motion.div
                              key={service.id}
                              initial={{ opacity: 0, scale: 0.9, y: 30 }}
                              animate={{ 
                                opacity: 1, 
                                scale: 1,
                                y: 0,
                                transition: { 
                                  delay: index * 0.05,
                                  duration: 0.4,
                                  type: "spring"
                                }
                              }}
                              whileHover={{ 
                                scale: 1.05,
                                transition: { type: "spring", stiffness: 400 }
                              }}
                              onMouseEnter={() => setHoveredServiceId(service.id)}
                              onMouseLeave={() => setHoveredServiceId(null)}
                              className="flex-shrink-0 w-80"
                            >
                              <div className="bg-card/80 backdrop-blur-sm border border-border/30 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                                {/* Image avec overlay */}
                                <div className="relative h-44 overflow-hidden">
                                  <motion.img
                                    src={service.image || getServiceImage(service.id, 400, 300)}
                                    alt={service.name}
                                    className="w-full h-full object-cover"
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.6 }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                  
                                  {/* Badges */}
                                  <div className="absolute top-3 left-3 right-3 flex justify-between">
                                    <span
                                      className="px-2 py-1 text-xs font-semibold rounded-full text-white shadow-md"
                                      style={{
                                        backgroundColor: category?.color || 'hsl(var(--primary))',
                                      }}
                                    >
                                      {category?.name || 'Service'}
                                    </span>
                                    
                                    {service.target && (
                                      <span 
                                        className={cn(
                                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
                                          service.target === 'homme' && "bg-blue-600",
                                          service.target === 'femme' && "bg-pink-600",
                                          service.target === 'enfant' && "bg-yellow-600"
                                        )}
                                      >
                                        {service.target === 'homme' && 'H'}
                                        {service.target === 'femme' && 'F'}
                                        {service.target === 'enfant' && 'E'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Contenu */}
                                <div className="p-4">
                                  <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors">
                                    {service.name}
                                  </h3>
                                  
                                  {service.description && (
                                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                                      {service.description}
                                    </p>
                                  )}
                                  
                                  {/* Info et actions */}
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{service.duration}min</span>
                                      </div>
                                      <div className="flex items-center gap-1 font-semibold text-primary">
                                        <Banknote className="w-3 h-3" />
                                        <span>{formatPrice(Number(service.price) || 0, salon?.currency)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Link to={`/public/services/${service.id}`} className="flex-1">
                                      <Button variant="outline" size="sm" className="w-full">
                                        <Eye className="w-3 h-3 mr-1" />
                                        Détails
                                      </Button>
                                    </Link>
                                    <Link to="/public/booking" state={{ serviceId: service.id }} className="flex-1">
                                      <Button size="sm" className="w-full">
                                        <ArrowRight className="w-3 h-3 mr-1" />
                                        Réserver
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <AnimatedSection variant="scaleIn" className="text-center py-16">
              <motion.div 
                className="max-w-md mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div 
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-secondary/50 to-muted rounded-full flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Scissors className="w-12 h-12 text-muted-foreground" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">Aucun service trouvé</h3>
                <p className="text-muted-foreground mb-6">
                  Essayez de modifier vos filtres pour voir plus de services disponibles
                </p>
                <Button 
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedTarget('all');
                  }}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Réinitialiser les filtres
                </Button>
              </motion.div>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* Section CTA immersive avec effets sonores et vidéo-like animations */}
      <AnimatedSection variant="fadeInUp">
        <section className="py-16 lg:py-20 bg-gradient-to-br from-primary/5 via-secondary/10 to-primary/5 relative overflow-hidden">
          {/* Éléments décoratifs flottants */}

          

          
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

          {/* Effet de vague animé */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/10 to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          
          <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
            <motion.div
              className="max-w-3xl mx-auto space-y-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.h2 
                className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
                viewport={{ once: true }}
              >
                Prêt à transformer votre look ?
              </motion.h2>
              
              <motion.p 
                className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                viewport={{ once: true }}
              >
                Notre équipe d'experts vous accueille pour une expérience de coiffure unique et personnalisée. 
                Découvrez pourquoi nos clients nous font confiance depuis des années.
              </motion.p>

              {/* Avantages avec animations */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                viewport={{ once: true }}
              >
                {[
                  { title: 'Qualité Premium', desc: 'Produits professionnels' },
                  { title: 'Experts Certifiés', desc: 'Coiffeurs qualifiés' },
                  { title: 'Satisfaction Garantie', desc: 'Résultats exceptionnels' }
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    className="p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -5,
                      boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.1)"
                    }}
                    viewport={{ once: true }}
                  >
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                      <Scissors className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Boutons CTA animés */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Link to="/public/contact">
                    <motion.div
                      className="relative overflow-hidden group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100"
                        transition={{ duration: 0.3 }}
                      />
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="gap-2 relative z-10 border-2 border-primary/30 hover:border-primary/60 px-8 py-6 group"
                      >
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Sparkles className="w-5 h-5" />
                        </motion.div>
                        <span className="text-base font-medium">Nous contacter</span>
                        <motion.div
                          initial={{ x: 0 }}
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <ArrowRight className="w-5 h-5" />
                        </motion.div>
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Link to="/public/booking">
                    <motion.div
                      className="relative overflow-hidden group/booking"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Effet vidéo-like de brillance */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group/booking:opacity-100 -skew-x-12"
                        animate={{ x: [-200, 200] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeOut" }}
                      />
                      
                      <Button 
                        size="lg" 
                        className="gap-2 relative z-10 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white border-0 shadow-lg group/booking px-8 py-6"
                      >
                        <motion.div
                          className="w-5 h-5 flex items-center justify-center"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        >
                          <Clock className="w-5 h-5" />
                        </motion.div>
                        <span className="text-base font-medium">Prendre rendez-vous</span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <ArrowRight className="w-5 h-5" />
                        </motion.div>
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              </div>

              {/* Indicateur de confiance social */}
              <div className="flex items-center justify-center gap-8 pt-8 border-t border-border/30">
                <motion.div 
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: 180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 1.3 + i * 0.1, type: "spring" }}
                      viewport={{ once: true }}
                    >
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    </motion.div>
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">4.9/5</span>
                </motion.div>
                
                <div className="text-sm text-muted-foreground">•</div>
                
                <motion.div 
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, color: "var(--primary)" }}
                >
                  +500 clients satisfaits
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </AnimatedSection>
    </PublicLayout>
  );
}