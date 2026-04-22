import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { LogIn, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('naoadmin@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: "Connexion réussie !",
          description: "Bienvenue dans votre espace d'administration.",
        });
        navigate(from, { replace: true });
      } else {
        toast({
          title: "Erreur de connexion",
          description: "Email ou mot de passe incorrect.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background pattern-mudcloth p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card de connexion */}
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header avec logo */}
          <div className="bg-sidebar p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-sidebar-accent rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-sidebar-foreground">SC</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-sidebar-foreground mb-1">SaaS Coiffure</h1>
            <p className="text-sidebar-foreground/80 text-xs">Espace d'administration</p>
          </div>

          {/* Formulaire */}
          <div className="p-6">
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold mb-1">Connexion</h2>
              <p className="text-muted-foreground text-xs">
                Connectez-vous pour accéder à votre tableau de bord
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  Adresse email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 pr-4 h-12 text-sm border-2 focus:border-primary transition-all"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" />
                  Mot de passe
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 text-sm border-2 focus:border-primary transition-all"
                    required
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-3.5 h-3.5 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer" 
                    defaultChecked
                  />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                    Se souvenir de moi
                  </span>
                </label>
                <Link 
                  to="/forgot-password"
                  className="text-primary hover:underline font-medium transition-all hover:text-primary/80 text-xs"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-sm font-semibold bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading || !email || !password}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-sidebar-foreground border-t-transparent rounded-full animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Se connecter
                  </>
                )}
              </Button>
            </form>

            {/* Badge démo professionnel */}
            <div className="mt-4 p-3 bg-secondary/50 rounded-lg border border-border">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground mb-1">Compte de démonstration</p>
                  <div className="space-y-0.5 text-xs text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Email:</span>
                      <code className="bg-background px-1.5 py-0.5 rounded text-primary font-mono text-xs">naoadmin@gmail.com</code>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Mot de passe:</span>
                      <code className="bg-background px-1.5 py-0.5 rounded text-primary font-mono text-xs">Admin@2026</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 bg-secondary/30 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              NaoService by MPJ - Made in Gabon
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

