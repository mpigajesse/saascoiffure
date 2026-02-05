import { GabonMaskSymbol, AfricanStarSymbol } from '@/components/african-symbols/AfricanSymbols';
import { cn } from '@/lib/utils';

interface BrandingFooterProps {
  variant?: 'public' | 'admin';
  className?: string;
}

export function BrandingFooter({ variant = 'public', className }: BrandingFooterProps) {
  const isPublic = variant === 'public';
  
  return (
    <div className={cn(
      "flex flex-col items-center gap-2 text-center",
      isPublic ? "text-sidebar-foreground/60" : "text-sidebar-foreground/70",
      className
    )}>
      <div className="flex items-center justify-center gap-2">
        <AfricanStarSymbol size={16} animated={true} color="gradient" />
        <span className="text-sm font-semibold">
          NaoService by MPJ
        </span>
      </div>
      <div className="flex items-center justify-center gap-1.5">
        <GabonMaskSymbol size={14} animated={true} color="green" />
        <span className="text-xs font-medium">
          Made in Gabon
        </span>
        <span className="text-xs">🇬🇦</span>
      </div>
    </div>
  );
}

