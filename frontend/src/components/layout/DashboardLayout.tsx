import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Scissors, 
  UserCircle,
  CreditCard,
  Settings,
  Menu,
  X,
  ChevronRight,
  Sun,
  Moon,
  ExternalLink,
  Globe,
  LogOut,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { GabonMaskSymbol, AfricanStarSymbol } from '@/components/african-symbols/AfricanSymbols';
import { BrandingFooter } from '@/components/branding/BrandingFooter';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from '@/hooks/use-toast';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Tableau de bord', href: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Tenants', href: '/admin/tenants', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Rendez-vous', href: '/appointments', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Clients', href: '/clients', icon: <Users className="w-5 h-5" /> },
  { label: 'Services', href: '/services', icon: <Scissors className="w-5 h-5" /> },
  { label: 'Employés', href: '/employees', icon: <UserCircle className="w-5 h-5" /> },
  { label: 'Caisse', href: '/payments', icon: <CreditCard className="w-5 h-5" /> },
  { label: 'Paramètres', href: '/settings', icon: <Settings className="w-5 h-5" /> },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isViewingTenant, selectedTenant, clearTenantSelection } = useAdmin();
  const { salon } = useTenant();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = () => {
    logout();
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès.",
    });
    navigate('/login');
  };

  const handleExitTenantView = () => {
    clearTenantSelection();
    toast({
      title: "Vue admin restaurée",
      description: "Vous êtes revenu à la vue globale.",
    });
    navigate('/admin/tenants');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-background flex pattern-mudcloth">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-sidebar transform transition-all duration-300 ease-bounce-in lg:transform-none shadow-xl",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo with gradient accent */}
          <div className="p-6 border-b border-sidebar-border relative overflow-hidden">
            <div className="absolute inset-0 gradient-gabon opacity-10" />
            <div className="relative flex items-center justify-between">
              <div className="animate-fade-in-left flex items-center gap-2">
                <div className="relative">
                  <GabonMaskSymbol size={32} animated={true} color="yellow" className="opacity-80" />
                  <div className="absolute -top-1 -right-1">
                    <AfricanStarSymbol size={12} animated={true} color="green" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-sidebar-foreground">{salon?.name || 'SaaS Coiffure'}</h1>
                  <p className="text-sm text-sidebar-foreground/70 mt-1">{salon?.address?.split(',')[0] || 'Libreville'}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.href || 
                (item.href === '/admin' && (location.pathname === '/' || location.pathname === '/admin'));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg group",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:translate-x-1"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className={cn(
                    "transition-transform duration-200",
                    !isActive && "group-hover:scale-110"
                  )}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto animate-fade-in-right" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border space-y-3">
            {/* Raccourci vers le site public */}
            <Link 
              to="/public" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 bg-gradient-gabon text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 group"
            >
              <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                <Globe className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Voir mon site</p>
                <p className="text-xs opacity-80">Site public</p>
              </div>
              <ExternalLink className="w-4 h-4 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>

            {/* Profil utilisateur */}
            <div className="flex items-center gap-3 px-4 py-3 bg-sidebar-accent rounded-lg">
              <div className="w-10 h-10 gradient-gabon flex items-center justify-center font-bold rounded-full animate-pulse-glow relative">
                <span className="z-10">
                  {user ? `${user.first_name[0]}${user.last_name[0]}` : 'MD'}
                </span>
                <div className="absolute -top-1 -right-1">
                  <AfricanStarSymbol size={10} animated={true} color="yellow" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user ? `${user.first_name} ${user.last_name}` : 'Utilisateur'}
                </p>
                <p className="text-xs text-sidebar-foreground/60">
                  {user?.role === 'ADMIN' ? 'Administrateur' : 
                   user?.role === 'COIFFEUR' ? 'Coiffeur' : 
                   user?.role === 'RECEPTIONNISTE' ? 'Réceptionniste' : 'Utilisateur'}
                </p>
              </div>
            </div>

            {/* Bouton de déconnexion */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>

            {/* Branding NaoService by MPJ */}
            <div className="px-4 py-3 bg-sidebar-accent/50 rounded-lg">
              <BrandingFooter variant="admin" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="lg:hidden hover:scale-105 transition-transform"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              {isViewingTenant && selectedTenant ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-sidebar-primary/10 border border-sidebar-primary/20 rounded-lg">
                    <Building2 className="w-4 h-4 text-sidebar-primary" />
                    <span className="text-sm font-semibold text-sidebar-primary">
                      Mode exploration: {selectedTenant.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-sidebar-primary/20"
                      onClick={handleExitTenantView}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              )}
            </div>
            <Link to="/public" target="_blank" rel="noopener noreferrer">
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2 hover:scale-105 transition-transform hover:bg-primary hover:text-primary-foreground"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">Voir mon site</span>
                <ExternalLink className="w-3 h-3" />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleDarkMode}
              className="hover:scale-105 transition-transform"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
