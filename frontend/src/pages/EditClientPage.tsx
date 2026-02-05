import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, X, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { useAppointments } from '@/contexts/AppointmentsContext';
import { cn } from '@/lib/utils';
import { AfricanStarSymbol } from '@/components/african-symbols/AfricanSymbols';
import { toast } from '@/hooks/use-toast';

export default function EditClientPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClientById } = useAppointments();
  const client = id ? getClientById(id) : null;

  const [formData, setFormData] = useState({
    firstName: client?.firstName || '',
    lastName: client?.lastName || '',
    email: client?.email || '',
    phone: client?.phone || '',
    preferences: client?.preferences || '',
    notes: client?.notes || '',
  });

  const [isSaving, setIsSaving] = useState(false);

  if (!client) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <X className="w-16 h-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Client introuvable</h2>
          <p className="text-muted-foreground">Le client demandé n'existe pas.</p>
          <Button onClick={() => navigate('/clients')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux clients
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulation d'enregistrement
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Client modifié !",
      description: "Les modifications ont été enregistrées avec succès.",
    });

    setIsSaving(false);
    navigate(`/clients/${client.id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/clients/${client.id}`)}
            className="hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="w-6 h-6 text-primary" />
              </div>
              Modifier le client
            </h1>
            <p className="text-muted-foreground mt-1">Modifiez les informations du client</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informations personnelles */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <AfricanStarSymbol size={20} animated={true} color="gradient" />
                  Informations personnelles
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        className="pl-10"
                        placeholder="Ex: Awa, Fatou, Koffi, Mireille"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                        className="pl-10"
                        placeholder="Ex: Diallo, Traoré, Mba, Nguema"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="pl-10"
                        placeholder="Ex: awa.diallo@email.com"
                      />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="pl-10"
                        placeholder="Ex: +241 06 12 34 56 78"
                      />
                  </div>
                </div>
              </div>

              {/* Préférences et notes */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-bold">Informations complémentaires</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="preferences">Préférences</Label>
                  <Textarea
                    id="preferences"
                    value={formData.preferences}
                    onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                    rows={3}
                    placeholder="Préférences de coiffure, allergies, etc."
                  />
                  <p className="text-xs text-muted-foreground">
                    Informations importantes pour la prestation
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes internes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    placeholder="Notes privées sur le client..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Ces notes ne sont visibles que par l'équipe
                  </p>
                </div>
              </div>
            </div>

            {/* Colonne latérale */}
            <div className="space-y-6">
              {/* Aperçu */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="text-xl font-bold">Aperçu</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 gradient-gabon flex items-center justify-center font-bold text-lg rounded-full">
                      {formData.firstName[0] || '?'}{formData.lastName[0] || '?'}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {formData.firstName || 'Prénom'} {formData.lastName || 'Nom'}
                      </p>
                      <p className="text-sm text-muted-foreground">{formData.email || 'email@example.com'}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{formData.email || 'Non renseigné'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{formData.phone || 'Non renseigné'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations système */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="text-xl font-bold">Informations système</h2>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="font-mono text-xs">{client.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Créé le:</span>
                    <span>{new Date(client.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  {client.lastVisit && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dernière visite:</span>
                      <span>{new Date(client.lastVisit).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/clients/${client.id}`)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

