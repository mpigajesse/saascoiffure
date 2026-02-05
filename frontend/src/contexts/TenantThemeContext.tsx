import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useTenant } from './TenantContext';
import { TenantTheme } from '@/types';

interface TenantThemeContextType {
  theme: TenantTheme;
  updateTheme: (theme: Partial<TenantTheme>) => void;
  resetTheme: () => void;
  applyTheme: () => void;
}

const TenantThemeContext = createContext<TenantThemeContextType | undefined>(undefined);

// Thème amélioré avec plus de contrastes et cohérent
const defaultTheme: TenantTheme = {
  primaryColor: '15 70% 45%', // Terracotta plus vif
  secondaryColor: '35 35% 92%', // Warm Sand
  accentColor: '50 90% 60%', // Gold plus vibrants
  backgroundColor: '25 35% 97%', // Plus sombre et élégant
  textColor: '25 40% 15%', // Plus clair
  buttonColor: '15 90% 60%', // Plus visible
  linkColor: '15 90% 60%', // Plus visible au survol
  hoverColor: '15 95% 80%', // Plus clair au hover
  cardBackground: '255 255 255', // Blanc pur
  cardForeground: '45 25 95%', // Plus contrast pour la lisibilité
  borderColor: '200 200 200', // Bordures définies
  // Shadows plus marqués et visibles
  dropShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', // Shadows doux et profonds
  glowEffect: '0 0 20px rgba(255, 255, 255, 0.15)',
};

export function TenantThemeProvider({ children }: { children: ReactNode }) {
  const { salon } = useTenant();
  const [theme, setTheme] = useState<TenantTheme>(() => {
    // Charger le thème depuis le salon ou localStorage
    if (salon?.theme) {
      return { ...defaultTheme, ...salon.theme };
    }
    if (salon?.id) {
      const saved = localStorage.getItem(`tenant_theme_${salon.id}`);
      if (saved) {
        try {
          return { ...defaultTheme, ...JSON.parse(saved) };
        } catch {
          return defaultTheme;
        }
      }
    }
    return defaultTheme;
  });

  // Appliquer le thème via CSS variables
  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const updateTheme = (newTheme: Partial<TenantTheme>) => {
    const updatedTheme = { ...theme, ...newTheme };
    setTheme(updatedTheme);
    
    // Sauvegarder dans localStorage
    if (salon?.id) {
      localStorage.setItem(`tenant_theme_${salon.id}`, JSON.stringify(updatedTheme));
    }
    
    // Appliquer immédiatement
    applyThemeToDocument(updatedTheme);
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    if (salon?.id) {
      localStorage.removeItem(`tenant_theme_${salon.id}`);
    }
    applyThemeToDocument(defaultTheme);
  };

  const applyTheme = () => {
    applyThemeToDocument(theme);
  };

  return (
    <TenantThemeContext.Provider value={{ theme, updateTheme, resetTheme, applyTheme }}>
      {children}
    </TenantThemeContext.Provider>
  );
}

// Fonction pour appliquer le thème au document via CSS variables
function applyThemeToDocument(theme: TenantTheme) {
  const root = document.documentElement;
  
  if (theme.primaryColor) {
    root.style.setProperty('--tenant-primary', theme.primaryColor);
    root.style.setProperty('--primary', theme.primaryColor);
  }
  
  if (theme.secondaryColor) {
    root.style.setProperty('--tenant-secondary', theme.secondaryColor);
    root.style.setProperty('--secondary', theme.secondaryColor);
  }
  
  if (theme.accentColor) {
    root.style.setProperty('--tenant-accent', theme.accentColor);
    root.style.setProperty('--accent', theme.accentColor);
  }
  
  if (theme.backgroundColor) {
    root.style.setProperty('--tenant-background', theme.backgroundColor);
    root.style.setProperty('--background', theme.backgroundColor);
  }
  
  if (theme.textColor) {
    root.style.setProperty('--tenant-foreground', theme.textColor);
    root.style.setProperty('--foreground', theme.textColor);
  }
  
  if (theme.buttonColor) {
    root.style.setProperty('--tenant-button', theme.buttonColor);
  }
  
  if (theme.linkColor) {
    root.style.setProperty('--tenant-link', theme.linkColor);
  }
}

export function useTenantTheme() {
  const context = useContext(TenantThemeContext);
  if (context === undefined) {
    throw new Error('useTenantTheme must be used within a TenantThemeProvider');
  }
  return context;
}
