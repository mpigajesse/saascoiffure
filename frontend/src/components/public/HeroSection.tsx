import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getAfricanHairImage } from '@/lib/unsplash';

interface HeroSectionProps {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  description?: string;
  backgroundImage?: string;
  overlay?: boolean;
  actions?: ReactNode;
  className?: string;
  decorativeElements?: ReactNode;
}

export function HeroSection({
  title,
  subtitle,
  description,
  backgroundImage,
  overlay = true,
  actions,
  className,
  decorativeElements,
}: HeroSectionProps) {
  // Utilise une image Unsplash par défaut si aucune image n'est fournie
  const heroImage = backgroundImage || getAfricanHairImage(1920, 1080);
  
  return (
    <section className={cn("relative h-[600px] lg:h-[700px] overflow-hidden", className)}>
      {heroImage && (
        <>
          <div className="absolute inset-0">
            <motion.img
              src={heroImage}
              alt="Salon de coiffure africain"
              className="w-full h-full object-cover"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              loading="eager"
            />
          </div>
          {overlay && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            />
          )}
          <div className="absolute inset-0 pattern-gabon opacity-20" />
        </>
      )}

      {decorativeElements}

      <div className="relative container mx-auto px-4 lg:px-8 h-full flex items-center">
        <motion.div
          className="max-w-2xl text-background space-y-6"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {subtitle && (
            <motion.div
              className="text-sm font-medium uppercase tracking-widest opacity-90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.9, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {typeof subtitle === 'string' ? subtitle : subtitle}
            </motion.div>
          )}
          <motion.h1
            className="text-5xl lg:text-6xl font-bold leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {title}
          </motion.h1>
          {description && (
            <motion.p
              className="text-xl opacity-90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.9, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {description}
            </motion.p>
          )}
          {actions && (
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {actions}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

