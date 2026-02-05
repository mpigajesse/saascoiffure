import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  delay?: number;
}

export function StatCard({ title, value, subtitle, icon, trend, className, delay = 0 }: StatCardProps) {
  return (
    <div 
      className={cn(
        "bg-card border border-border rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Decorative gradient accent avec couleurs gabonaises */}
      <div className="absolute top-0 left-0 w-full h-1 gradient-gabon-horizontal opacity-80" />
      
      <div className="flex items-start justify-between relative">
        <div className="animate-fade-in-up" style={{ animationDelay: `${delay + 100}ms` }}>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold mt-2 animate-count-up" style={{ animationDelay: `${delay + 200}ms` }}>
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className={cn(
              "text-sm font-medium mt-2 flex items-center gap-1",
              trend.isPositive ? "text-accent-foreground" : "text-destructive"
            )}>
              <span className={cn(
                "inline-block transition-transform",
                trend.isPositive ? "animate-bounce-gentle" : ""
              )}>
                {trend.isPositive ? '↑' : '↓'}
              </span>
              {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-secondary rounded-lg group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
