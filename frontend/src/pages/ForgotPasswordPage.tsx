import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Mail, ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { mockSalon } from '@/data/mockData';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulation d'envoi d'email
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Email envoyé !",
        description: "Un lien de réinitialisation a été envoyé à votre adresse email.",
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de l'email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background pattern-mudcloth p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-sidebar p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-sidebar-accent rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-sidebar-foreground">SM</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-sidebar-foreground mb-1">{mockSalon.name}</h1>
              <p className="text-sidebar-foreground/80 text-xs">Espace d'administration</p>
            </div>

            {/* Contenu de confirmation */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-sidebar-primary/20 rounded-full mb-4">
                  <CheckCircle2 className="w-8 h-8 text-sidebar-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">Email envoyé !</h2>
                <p className="text-muted-foreground text-xs">
                  Un lien de réinitialisation a été envoyé à votre adresse email.
                </p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4 mb-4 border border-border">
                <p className="text-sm text-muted-foreground text-center">
                  <strong className="text-foreground">{email}</strong>
                </p>
              </div>

              <div className="space-y-3 text-xs text-muted-foreground mb-6">
                <p className="text-center">
                  Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
                </p>
                <p className="text-center">
                  Si vous ne recevez pas l'email, vérifiez votre dossier spam ou contactez l'administrateur.
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full h-12 text-sm font-semibold bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour à la connexion
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  className="w-full h-12 text-sm"
                >
                  Réessayer
                </Button>
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background pattern-mudcloth p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card de réinitialisation */}
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header avec logo */}
          <div className="bg-sidebar p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-sidebar-accent rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-sidebar-foreground">SM</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-sidebar-foreground mb-1">{mockSalon.name}</h1>
            <p className="text-sidebar-foreground/80 text-xs">Espace d'administration</p>
          </div>

          {/* Formulaire */}
          <div className="p-6">
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold mb-1">Mot de passe oublié ?</h2>
              <p className="text-muted-foreground text-xs">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe
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

              <Button
                type="submit"
                className="w-full h-12 text-sm font-semibold bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-sidebar-foreground border-t-transparent rounded-full animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer le lien de réinitialisation
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-border">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </Link>
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

