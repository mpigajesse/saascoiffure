import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Service } from '@/types';
import { ServiceCategory } from '@/types';
import { Clock, Banknote, Scissors, Pencil, Trash2, ArrowRight, MoreHorizontal, Eye, User, UserCircle, Baby, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AkomaSymbol } from '@/components/african-symbols/AfricanSymbols';
import { getServiceImage } from '@/lib/unsplash';

interface ServiceCardProps {
  service: Service;
  category?: ServiceCategory | null;
  variant?: 'admin' | 'public';
  index?: number;
  onEdit?: (service: Service) => void;
  onDelete?: (service: Service) => void;
  onReserve?: (service: Service) => void;
  onPublishChange?: (service: Service, isPublished: boolean) => void;
  onTogglePublish?: () => void;
  currency?: string; // Devise du salon
  className?: string;
}

export function ServiceCard({
  service,
  category,
  variant = 'admin',
  index = 0,
  onEdit,
  onDelete,
  onReserve,
  onPublishChange,
  onTogglePublish,
  currency = 'XAF',
  className,
}: ServiceCardProps) {
  const isAdmin = variant === 'admin';
  const isPublic = variant === 'public';
  const serviceImage = service.image || getServiceImage(service.id, 800, 600);

  const cardContent = (
    <div
      className={cn(
        "bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 group",
        isAdmin && "hover:shadow-lg hover:-translate-y-1",
        isPublic && "hover:shadow-xl hover:-translate-y-2",
        className
      )}
    >
      {/* Image du service avec effets avancés */}
      <motion.div 
        className="relative h-48 overflow-hidden bg-secondary group"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <motion.img
          src={serviceImage}
          alt={service.name}
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          whileHover={{ scale: 1.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        
        {/* Overlays multiples */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 opacity-0 group-hover:opacity-100"
          transition={{ duration: 0.3 }}
        />
        
        {/* Symboles animés flottants */}
        {isPublic && (
          <>
            <motion.div
              className="absolute top-3 right-3 text-yellow-400"
              animate={{ 
                rotate: [0, 360], 
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            >
              <AkomaSymbol size={24} animated={true} color="yellow" />
            </motion.div>
            
            <motion.div
              className="absolute top-3 left-3 text-pink-400 opacity-0 group-hover:opacity-100"
              initial={{ scale: 0, rotate: -180 }}
              whileHover={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.3, type: "spring" }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
            
            <motion.div
              className="absolute bottom-3 right-3 text-blue-400 opacity-0 group-hover:opacity-100"
              initial={{ scale: 0, y: 10 }}
              whileHover={{ scale: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Star className="w-5 h-5" />
            </motion.div>
          </>
        )}
        
        {/* Badges animés sur l'image */}
        <motion.div 
          className="absolute bottom-3 left-3 right-3 flex items-center gap-2 flex-wrap"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.span
            className="px-3 py-1 text-xs font-medium rounded-full shadow-lg backdrop-blur-sm text-white border border-white/20"
            style={{
              backgroundColor: category?.color || 'hsl(var(--muted))',
            }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            {category?.name || 'Sans catégorie'}
          </motion.span>
          
          {service.target && (
            <motion.span
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1 border border-white/20",
                service.target === 'homme' && "bg-gradient-to-r from-blue-600 to-blue-700 text-white",
                service.target === 'femme' && "bg-gradient-to-r from-pink-600 to-pink-700 text-white",
                service.target === 'enfant' && "bg-gradient-to-r from-yellow-600 to-orange-600 text-white"
              )}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {service.target === 'homme' && <>Homme</>}
              {service.target === 'femme' && <>Femme</>}
              {service.target === 'enfant' && <>Enfant</>}
            </motion.span>
          )}
        </motion.div>
        
        {/* Effet de brillance au hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"
          initial={{ x: -200 }}
          whileHover={{ x: 200 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </motion.div>

      <div className="p-5">
      {/* Header avec catégorie et actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* Nom du service */}
          <h3
            className={cn(
              "font-bold group-hover:text-primary transition-colors",
              isAdmin && "text-lg",
              isPublic && "text-xl mb-2"
            )}
          >
            {service.name}
          </h3>

          {/* Description */}
          {service.description && (
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {service.description}
            </p>
          )}
        </div>

        {/* Menu actions pour admin */}
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Informations durée et prix avec micro-interactions */}
      <div
        className={cn(
          "flex items-center gap-6 mb-4",
          isPublic && "justify-between"
        )}
      >
        <motion.div
          className={cn(
            "flex items-center gap-2",
            isPublic && "text-muted-foreground"
          )}
          whileHover={{ scale: 1.05, x: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div
            className={cn(
              "p-1.5 rounded-lg",
              isAdmin && "bg-secondary",
              isPublic && "bg-gradient-to-r from-primary/10 to-primary/20"
            )}
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <Clock
              className={cn(
                "w-4 h-4",
                isAdmin && "text-muted-foreground",
                isPublic && "text-primary"
              )}
            />
          </motion.div>
          <motion.span 
            className={cn(isAdmin && "font-mono", isPublic && "text-sm font-medium")}
            whileHover={{ scale: 1.05 }}
          >
            {service.duration} min
          </motion.span>
        </motion.div>

        <motion.div
          className={cn(
            "flex items-center gap-2",
            isPublic && "relative group/price"
          )}
          whileHover={{ scale: 1.05, x: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div
            className={cn(
              "p-1.5 rounded-lg",
              isAdmin && "bg-accent/30",
              isPublic && "bg-gradient-to-r from-primary/10 to-secondary/20"
            )}
            whileHover={{ rotate: -15, scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <Banknote
              className={cn(
                "w-4 h-4",
                isAdmin && "text-accent-foreground",
                isPublic && "text-primary"
              )}
            />
          </motion.div>
          <motion.span 
            className={cn(
              isAdmin && "font-bold text-lg text-primary", 
              isPublic && "text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            )}
            whileHover={{ scale: 1.1 }}
          >
            {formatPrice(Number(service.price) || 0, currency)}
          </motion.span>
          {/* Indicateur de popularité */}
          {isPublic && (
            <motion.div
              className="absolute -top-2 -right-2 text-yellow-500 opacity-0 group-hover/price:opacity-100"
              initial={{ scale: 0 }}
              whileHover={{ scale: 1, rotate: 360 }}
              transition={{ duration: 0.3, type: "spring" }}
            >
              <Star className="w-4 h-4 fill-current" />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Statut actif/inactif et publication pour admin */}
      {isAdmin && (
        <div className="flex items-center justify-between mb-4">
          <div
            className={cn(
              "inline-block px-3 py-1 text-xs font-medium rounded-full",
              service.is_active || service.isActive
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {(service.is_active || service.isActive) ? '● Actif' : '○ Inactif'}
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id={`publish-${service.id}`}
              checked={service.is_published || service.isPublished}
              onCheckedChange={() => onTogglePublish?.()}
              aria-label="Publier le service"
            />
            <Label htmlFor={`publish-${service.id}`} className="text-sm">
              Publié sur le site
            </Label>
          </div>
        </div>
      )}
      </div>
      {/* Actions footer avec micro-interactions avancées */}
      <div
        className={cn(
          "px-5 pb-5 pt-4 border-t border-border",
          isAdmin && "flex gap-2",
          isPublic && "space-y-3"
        )}
      >
        {isAdmin ? (
          <>
            <Link to={`/services/${service.id}`} className="flex-1">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98, y: 0 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all group"
                >
                  <Eye className="w-3 h-3 group-hover:scale-110 transition-transform" />
                  Détails
                </Button>
              </motion.div>
            </Link>
            <Link to={`/services/${service.id}/edit`} className="flex-1">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98, y: 0 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 hover:bg-accent/10 hover:border-accent/30 hover:text-accent-foreground transition-all group"
                >
                  <Pencil className="w-3 h-3 group-hover:scale-110 transition-transform" />
                  Modifier
                </Button>
              </motion.div>
            </Link>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95, y: 0 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive hover:shadow-lg hover:shadow-destructive/20 transition-all group"
                onClick={() => onDelete?.(service)}
              >
                <Trash2 className="w-3 h-3 group-hover:scale-110 transition-transform" />
              </Button>
            </motion.div>
          </>
        ) : (
          <>
            <Link to={`/public/services/${service.id}`}>
              <motion.div
                className="relative overflow-hidden"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97, y: 0 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ opacity: 1 }}
                />
                <Button 
                  className="w-full gap-2 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 group" 
                  variant="outline"
                >
                  <motion.div
                    className="w-4 h-4 flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Eye className="w-4 h-4" />
                  </motion.div>
                  <span className="group-hover:text-primary transition-colors">Voir les détails</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </Link>
            
            <Link to="/public/booking" state={{ serviceId: service.id }}>
              <motion.div
                className="relative overflow-hidden group/booking"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97, y: 0 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {/* Effet de brillance */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary opacity-0 group/booking:opacity-100 transition-opacity -skew-x-12"
                  initial={{ x: -200 }}
                  whileHover={{ x: 200 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
                
                <Button 
                  className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white border-0 shadow-lg group/booking shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all" 
                  size="sm"
                >
                  <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ gap: 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="group/booking:animate-pulse"
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    <span>Réserver ce service</span>
                    <motion.div
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </motion.div>
                </Button>
                
                {/* Particules décoratives */}
                <motion.div
                  className="absolute -top-1 -right-1 text-yellow-300 opacity-0 group/booking:opacity-100"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1, rotate: 360 }}
                  transition={{ duration: 0.3, type: "spring" }}
                >
                  <Star className="w-3 h-3 fill-current" />
                </motion.div>
              </motion.div>
            </Link>
          </>
        )}
      </div>
    </div>
  );

  // Pour le public, on peut wrapper dans AnimatedCard si nécessaire
  if (isPublic) {
    return cardContent;
  }

  // Pour l'admin, on ajoute l'animation fade-in
  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {cardContent}
    </div>
  );
}

