import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation, scaleIn } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  onClick?: () => void;
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
  hover = true,
  onClick,
}: AnimatedCardProps) {
  const { ref, controls } = useScrollAnimation(0.1);

  const cardVariants = {
    ...scaleIn,
    visible: {
      ...scaleIn.visible,
      transition: {
        ...scaleIn.visible.transition,
        delay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={cardVariants}
      whileHover={hover ? { y: -8, scale: 1.02 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "bg-card border border-border rounded-xl p-6 transition-all duration-300",
        hover && "hover:shadow-xl cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

