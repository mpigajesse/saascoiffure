import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation, fadeInUp } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  variant?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeInDown' | 'scaleIn';
  delay?: number;
  threshold?: number;
}

const variants = {
  fadeInUp,
  fadeInLeft: {
    hidden: { opacity: 0, x: -60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] },
    },
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] },
    },
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] },
    },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] },
    },
  },
};

export function AnimatedSection({
  children,
  className,
  variant = 'fadeInUp',
  delay = 0,
  threshold = 0.1,
}: AnimatedSectionProps) {
  const { ref, controls } = useScrollAnimation(threshold);

  const selectedVariant = variants[variant] || variants.fadeInUp;
  
  if (!selectedVariant || !selectedVariant.visible) {
    console.warn(`Variant "${variant}" not found, using fadeInUp as fallback`);
    return <div className={className}>{children}</div>;
  }

  const variantWithDelay = {
    hidden: selectedVariant.hidden,
    visible: {
      ...selectedVariant.visible,
      transition: {
        ...(selectedVariant.visible.transition || {}),
        delay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variantWithDelay as any}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

