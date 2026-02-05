import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation, staggerContainer, staggerItem } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface StaggerGridProps {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function StaggerGrid({
  children,
  className,
  columns = 3,
}: StaggerGridProps) {
  const { ref, controls } = useScrollAnimation(0.1);

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={staggerContainer}
      className={cn("grid gap-6", gridCols[columns], className)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={staggerItem}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

