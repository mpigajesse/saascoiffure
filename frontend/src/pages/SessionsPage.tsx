import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Monitor, Smartphone, Tablet, LogOut, Shield, MapPin, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Session {
  id: string;
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

// Mock data
const mockSessions: Session[] = [
  {
    id: 'session-1',
    device: 'Windows PC - Chrome',
    deviceType: 'desktop',
    browser: 'Chrome 120.0',
    location: 'Libreville, Gabon',
    ipAddress: '197.149.90.123',
    lastActive: new Date().toISOString(),
    isCurrent: true,
  },
  {
    id: 'session-2',
    device: 'iPhone 14 Pro - Safari',
    deviceType: 'mobile',
    browser: 'Safari 17.2',
    location: 'Libreville, Gabon',
    ipAddress: '197.149.90.124',
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Il y a 2 heures
    isCurrent: false,
  },
  {
    id: 'session-3',
    device: 'MacBook Pro - Chrome',
    deviceType: 'desktop',
    browser: 'Chrome 119.0',
    location: 'Port-Gentil, Gabon',
    ipAddress: '197.149.91.45',
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Il y a 1 jour
    isCurrent: false,
  },
  {
    id: 'session-4',
    device: 'iPad - Safari',
    deviceType: 'tablet',
    browser: 'Safari 17.1',
    location: 'Libreville, Gabon',
    ipAddress: '197.149.90.125',
    lastActive: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 7 jours
    isCurrent: false,
  },
];

const deviceIcons = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

export default function SessionsPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRevokeSession = async (sessionId: string) => {
    setIsRevoking(sessionId);
    try {
      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      toast({
        title: "Session révoquée",
        description: "La session a été révoquée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la révocation de la session.",
        variant: "destructive",
      });
    } finally {
      setIsRevoking(null);
    }
  };

  const handleRevokeAllSessions = async () => {
    setIsRevoking('all');
    try {
      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Garder uniquement la session actuelle
      setSessions(prev => prev.filter(s => s.isCurrent));
      
      toast({
        title: "Sessions révoquées",
        description: "Toutes les autres sessions ont été révoquées avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la révocation des sessions.",
        variant: "destructive",
      });
    } finally {
      setIsRevoking(null);
    }
  };

  const otherSessions = sessions.filter(s => !s.isCurrent);
  const currentSession = sessions.find(s => s.isCurrent);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/settings')}
              className="hover:scale-105 transition-transform"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Gérer les sessions actives</h1>
                <p className="text-muted-foreground text-sm">
                  Gérez les appareils connectés à votre compte
                </p>
              </div>
            </div>
          </div>

          {otherSessions.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Révoquer toutes les autres sessions
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Révoquer toutes les autres sessions ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action déconnectera tous vos autres appareils. Vous resterez connecté sur cet appareil.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRevokeAllSessions}
                    disabled={isRevoking === 'all'}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isRevoking === 'all' ? 'Révocation...' : 'Révoquer toutes'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </motion.div>

        {/* Session actuelle */}
        {currentSession && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {(() => {
                        const DeviceIcon = deviceIcons[currentSession.deviceType];
                        return <DeviceIcon className="w-5 h-5 text-primary" />;
                      })()}
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Session actuelle
                        <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                          Actif
                        </Badge>
                      </CardTitle>
                      <CardDescription>{currentSession.device}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Monitor className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-muted-foreground">Navigateur</p>
                      <p>{currentSession.browser}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-muted-foreground">Localisation</p>
                      <p>{currentSession.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-muted-foreground">Adresse IP</p>
                      <p className="font-mono text-xs">{currentSession.ipAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-muted-foreground">Dernière activité</p>
                      <p>{formatLastActive(currentSession.lastActive)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Autres sessions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Autres sessions actives</h2>
            <span className="text-sm text-muted-foreground">
              {otherSessions.length} session{otherSessions.length > 1 ? 's' : ''}
            </span>
          </div>

          {otherSessions.length > 0 ? (
            <div className="space-y-3">
              {otherSessions.map((session, index) => {
                const DeviceIcon = deviceIcons[session.deviceType];
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="p-2 bg-muted rounded-lg">
                              <DeviceIcon className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{session.device}</p>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Monitor className="w-3 h-3" />
                                  <span>{session.browser}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{session.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatLastActive(session.lastActive)}</span>
                                </div>
                              </div>
                              <p className="text-xs font-mono text-muted-foreground">
                                IP: {session.ipAddress}
                              </p>
                            </div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                disabled={isRevoking === session.id}
                              >
                                <LogOut className="w-4 h-4" />
                                Révoquer
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Révoquer cette session ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action déconnectera l'appareil "{session.device}" de votre compte.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRevokeSession(session.id)}
                                  disabled={isRevoking === session.id}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {isRevoking === session.id ? 'Révocation...' : 'Révoquer'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-card border border-border rounded-xl"
            >
              <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Aucune autre session active</p>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

