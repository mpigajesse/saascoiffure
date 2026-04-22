import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';
import { usePublicRoutes } from '@/hooks/usePublicRoutes';
import { Button } from '@/components/ui/button';
import { Calendar, Scissors, Users, Phone, Mail, MapPin, Menu, X, Facebook, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { GabonMaskSymbol, AfricanStarSymbol } from '@/components/african-symbols/AfricanSymbols';
import { BrandingFooter } from '@/components/branding/BrandingFooter';

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const { salon } = useTenant();
  const location = useLocation();
  const routes = usePublicRoutes();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Accueil', href: routes.home, icon: <Calendar className="w-4 h-4" /> },
    { label: 'Services', href: routes.services, icon: <Scissors className="w-4 h-4" /> },
    { label: 'Réserver', href: routes.booking, icon: <Calendar className="w-4 h-4" /> },
    { label: 'Contact', href: routes.contact, icon: <Phone className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header avec branding du salon */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo et nom du salon */}
            <Link to={routes.home} className="flex items-center gap-3 group">
              <div className="relative">
                <GabonMaskSymbol size={40} animated={true} color="gradient" />
                <div className="absolute -top-1 -right-1">
                  <AfricanStarSymbol size={14} animated={true} color="yellow" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {salon?.name || 'Salon de coiffure'}
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {salon?.address?.split(',')[0] || ''}
                </p>
              </div>
            </Link>

            {/* Navigation desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Menu mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background animate-slide-in-down">
            <nav className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Contenu principal */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer avec informations du salon */}
      <footer className="bg-sidebar text-sidebar-foreground border-t border-sidebar-border">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Informations du salon */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <GabonMaskSymbol size={24} animated={true} color="yellow" />
                <h3 className="text-lg font-bold">{salon?.name || 'Salon de coiffure'}</h3>
              </div>
              <p className="text-sm text-sidebar-foreground/70">
                {salon?.address || ''}
              </p>              
              {/* Social Media Icons */}
              <div className="flex items-center gap-3 mt-4">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sidebar-foreground/60 hover:text-blue-600 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a 
                  href="https://tiktok.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sidebar-foreground/60 hover:text-black transition-colors"
                  aria-label="TikTok"
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
                <a 
                  href="https://wa.me/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sidebar-foreground/60 hover:text-green-600 transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={20} />
                </a>
              </div>            </div>

            {/* Horaires */}
            <div className="space-y-4">
              <h4 className="font-semibold">Horaires d'ouverture</h4>
              <p className="text-sm text-sidebar-foreground/70">
                {salon?.opening_hours || 'Veuillez nous contacter'}
              </p>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="font-semibold">Contact</h4>
              <div className="space-y-2 text-sm text-sidebar-foreground/70">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${salon?.phone || ''}`} className="hover:text-sidebar-foreground transition-colors">
                    {salon?.phone || 'N/A'}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${salon?.email || ''}`} className="hover:text-sidebar-foreground transition-colors">
                    {salon?.email || 'N/A'}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{salon?.address || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-sidebar-border space-y-4">
            <p className="text-center text-sm text-sidebar-foreground/60">
              © {new Date().getFullYear()} {salon?.name || 'Salon de coiffure'}. Tous droits réservés.
            </p>
            <BrandingFooter variant="public" />
          </div>
        </div>
      </footer>
    </div>
  );
}

