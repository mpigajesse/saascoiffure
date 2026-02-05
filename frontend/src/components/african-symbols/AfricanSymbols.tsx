import { cn } from '@/lib/utils';

// Couleurs du drapeau gabonais
export const GABON_COLORS = {
  green: '#00A859',   // Vert
  yellow: '#FCD116',  // Jaune
  blue: '#009E60',    // Bleu (vert-bleu)
};

interface AfricanSymbolProps {
  className?: string;
  size?: number;
  animated?: boolean;
  color?: 'green' | 'yellow' | 'blue' | 'gradient';
}

// Symbole Adinkra : Sankofa (retourner chercher)
export function SankofaSymbol({ className, size = 24, animated = true, color = 'gradient' }: AfricanSymbolProps) {
  const colorValue = color === 'gradient' 
    ? `url(#sankofa-gradient-${size})` 
    : GABON_COLORS[color];
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn(animated && 'animate-float', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`sankofa-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={GABON_COLORS.green} />
          <stop offset="50%" stopColor={GABON_COLORS.yellow} />
          <stop offset="100%" stopColor={GABON_COLORS.blue} />
        </linearGradient>
      </defs>
      <path
        d="M12 2 L12 8 M12 8 L8 12 M12 8 L16 12 M8 12 L8 18 M16 12 L16 18 M8 18 L12 22 M16 18 L12 22"
        stroke={colorValue}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? 'animate-pulse-glow' : ''}
      />
      <circle cx="12" cy="6" r="2" fill={colorValue} />
    </svg>
  );
}

// Symbole Adinkra : Gye Nyame (sauf Dieu)
export function GyeNyameSymbol({ className, size = 24, animated = true, color = 'gradient' }: AfricanSymbolProps) {
  const colorValue = color === 'gradient' 
    ? `url(#gye-nyame-gradient-${size})` 
    : GABON_COLORS[color];
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn(animated && 'animate-spin-slow', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`gye-nyame-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={GABON_COLORS.green} />
          <stop offset="50%" stopColor={GABON_COLORS.yellow} />
          <stop offset="100%" stopColor={GABON_COLORS.blue} />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" stroke={colorValue} strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="6" stroke={colorValue} strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="2" fill={colorValue} />
      <path
        d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12"
        stroke={colorValue}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Symbole Adinkra : Akoma (cœur)
export function AkomaSymbol({ className, size = 24, animated = true, color = 'gradient' }: AfricanSymbolProps) {
  const colorValue = color === 'gradient' 
    ? `url(#akoma-gradient-${size})` 
    : GABON_COLORS[color];
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn(animated && 'animate-pulse-glow', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`akoma-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={GABON_COLORS.green} />
          <stop offset="50%" stopColor={GABON_COLORS.yellow} />
          <stop offset="100%" stopColor={GABON_COLORS.blue} />
        </linearGradient>
      </defs>
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={colorValue}
        className={animated ? 'animate-pulse' : ''}
      />
    </svg>
  );
}

// Symbole gabonais : Masque traditionnel stylisé
export function GabonMaskSymbol({ className, size = 24, animated = true, color = 'gradient' }: AfricanSymbolProps) {
  const colorValue = color === 'gradient' 
    ? `url(#gabon-mask-gradient-${size})` 
    : GABON_COLORS[color];
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn(animated && 'animate-float', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`gabon-mask-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={GABON_COLORS.green} />
          <stop offset="50%" stopColor={GABON_COLORS.yellow} />
          <stop offset="100%" stopColor={GABON_COLORS.blue} />
        </linearGradient>
      </defs>
      {/* Forme de masque stylisée */}
      <ellipse cx="12" cy="12" rx="8" ry="10" stroke={colorValue} strokeWidth="2" fill="none" />
      <ellipse cx="9" cy="10" rx="1.5" ry="2" fill={colorValue} />
      <ellipse cx="15" cy="10" rx="1.5" ry="2" fill={colorValue} />
      <path
        d="M9 15 Q12 18 15 15"
        stroke={colorValue}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M12 2 L10 6 L14 6 Z"
        fill={colorValue}
        className={animated ? 'animate-pulse' : ''}
      />
    </svg>
  );
}

// Symbole : Étoile africaine (inspirée des drapeaux)
export function AfricanStarSymbol({ className, size = 24, animated = true, color = 'gradient' }: AfricanSymbolProps) {
  const colorValue = color === 'gradient' 
    ? `url(#african-star-gradient-${size})` 
    : GABON_COLORS[color];
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn(animated && 'animate-spin-slow', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`african-star-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={GABON_COLORS.green} />
          <stop offset="50%" stopColor={GABON_COLORS.yellow} />
          <stop offset="100%" stopColor={GABON_COLORS.blue} />
        </linearGradient>
      </defs>
      <path
        d="M12 2 L14.5 8.5 L21.5 9.5 L16.5 14 L18 21 L12 17.5 L6 21 L7.5 14 L2.5 9.5 L9.5 8.5 Z"
        fill={colorValue}
        className={animated ? 'animate-pulse-glow' : ''}
      />
    </svg>
  );
}

// Symbole Adinkra : Gye Nyame (sauf Dieu)
export function AdinkraSymbol({ className, size = 24, animated = true, color = 'gradient' }: AfricanSymbolProps) {
  const colorValue = color === 'gradient' 
    ? `url(#adinkra-gradient-${size})` 
    : GABON_COLORS[color];
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn(animated && 'animate-pulse-glow', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`adinkra-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={GABON_COLORS.green} />
          <stop offset="50%" stopColor={GABON_COLORS.yellow} />
          <stop offset="100%" stopColor={GABON_COLORS.blue} />
        </linearGradient>
      </defs>
      {/* Symbole Adinkra stylisé - motif circulaire avec motifs internes */}
      <circle cx="12" cy="12" r="10" stroke={colorValue} strokeWidth="2" fill="none" />
      <path
        d="M12 4 L12 8 M12 16 L12 20 M4 12 L8 12 M16 12 L20 12"
        stroke={colorValue}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="4" stroke={colorValue} strokeWidth="1.5" fill="none" />
      <path
        d="M8 8 L16 16 M16 8 L8 16"
        stroke={colorValue}
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="1.5" fill={colorValue} />
    </svg>
  );
}

// Symbole : Motif géométrique africain
export function GeometricPatternSymbol({ className, size = 24, animated = true, color = 'gradient' }: AfricanSymbolProps) {
  const colorValue = color === 'gradient' 
    ? `url(#geometric-gradient-${size})` 
    : GABON_COLORS[color];
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn(animated && 'animate-float', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`geometric-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={GABON_COLORS.green} />
          <stop offset="50%" stopColor={GABON_COLORS.yellow} />
          <stop offset="100%" stopColor={GABON_COLORS.blue} />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="6" height="6" fill={colorValue} className={animated ? 'animate-pulse' : ''} />
      <rect x="14" y="4" width="6" height="6" fill={colorValue} className={animated ? 'animate-pulse' : ''} style={{ animationDelay: '0.2s' }} />
      <rect x="4" y="14" width="6" height="6" fill={colorValue} className={animated ? 'animate-pulse' : ''} style={{ animationDelay: '0.4s' }} />
      <rect x="14" y="14" width="6" height="6" fill={colorValue} className={animated ? 'animate-pulse' : ''} style={{ animationDelay: '0.6s' }} />
      <circle cx="12" cy="12" r="3" stroke={colorValue} strokeWidth="2" fill="none" />
    </svg>
  );
}

// Composant wrapper pour afficher plusieurs symboles
export function AfricanSymbolsDecoration({ 
  className, 
  symbols = ['sankofa', 'gye-nyame', 'akoma'],
  size = 24 
}: { 
  className?: string; 
  symbols?: Array<'sankofa' | 'gye-nyame' | 'akoma' | 'gabon-mask' | 'star' | 'geometric' | 'adinkra'>;
  size?: number;
}) {
  const symbolComponents = {
    sankofa: SankofaSymbol,
    'gye-nyame': GyeNyameSymbol,
    akoma: AkomaSymbol,
    'gabon-mask': GabonMaskSymbol,
    star: AfricanStarSymbol,
    geometric: GeometricPatternSymbol,
    adinkra: AdinkraSymbol,
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {symbols.map((symbol, index) => {
        const SymbolComponent = symbolComponents[symbol];
        return (
          <SymbolComponent
            key={`${symbol}-${index}`}
            size={size}
            animated={true}
            color="gradient"
            className="opacity-80 hover:opacity-100 transition-opacity"
          />
        );
      })}
    </div>
  );
}

