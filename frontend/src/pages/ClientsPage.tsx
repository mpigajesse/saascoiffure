import { useState } from 'react';
import { Search, Plus, Phone, Mail, Calendar, MoreHorizontal, Users, Clock, MessageCircle, X, Send, CheckCircle2, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClients, useEmployees, useServices, useCreateClient } from '@/hooks/useApi';
import { AkomaSymbol, AfricanStarSymbol } from '@/components/african-symbols/AfricanSymbols';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
];

export default function ClientsPage() {
  // Utiliser les hooks React Query
  const { data: clientsData } = useClients();
  const { data: employeesData } = useEmployees();
  const { data: servicesData } = useServices();
  const createClientMutation = useCreateClient();
  
  // Extraire les tableaux des réponses paginées
  const clients = clientsData?.results || [];
  const employees = employeesData?.results || [];
  const services = servicesData?.results || [];
  
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State for New Client
  const [newClient, setNewClient] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newClient.first_name || !newClient.last_name) {
        toast({ title: "Erreur", description: "Nom et prénom requis", variant: "destructive" });
        return;
      }
      
      await createClientMutation.mutateAsync(newClient);
      
      setIsDialogOpen(false);
      setNewClient({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        notes: '',
      });
    } catch (error) {
       // handled by mutation onError
    }
  };

  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [showWhatsAppSimulation, setShowWhatsAppSimulation] = useState(false);
  const [whatsAppMessages, setWhatsAppMessages] = useState<Array<{text: string; sender: 'salon' | 'client'; time: string}>>([]);
  const [whatsAppInput, setWhatsAppInput] = useState('');
  const [appointmentForm, setAppointmentForm] = useState({
    serviceId: '',
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    notes: '',
    source: 'website' as 'website' | 'whatsapp' | 'phone' | 'walk_in',
  });

  const coiffeurs = employees.filter(e => e.role === 'COIFFEUR');

  const filteredClients = clients.filter(client => 
    `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="animate-fade-in-left">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg relative">
                <Users className="w-6 h-6 text-primary" />
                <div className="absolute -top-1 -right-1">
                  <AkomaSymbol size={14} animated={true} color="green" />
                </div>
              </div>
              Clients
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <AfricanStarSymbol size={16} animated={true} color="yellow" />
              {clients.length} clients enregistrés
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-md hover:shadow-glow-primary transition-all duration-300 hover:scale-105">
                <Plus className="w-4 h-4" />
                Nouveau client
              </Button>
            </DialogTrigger>
            <DialogContent className="border border-border rounded-xl animate-scale-in">
              <DialogHeader>
                <DialogTitle>Ajouter un client</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateClient} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input 
                      id="firstName" 
                      value={newClient.first_name}
                      onChange={(e) => setNewClient({...newClient, first_name: e.target.value})}
                      placeholder="Prénom" 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input 
                      id="lastName" 
                      value={newClient.last_name}
                      onChange={(e) => setNewClient({...newClient, last_name: e.target.value})}
                      placeholder="Nom" 
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    placeholder="email@example.com" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input 
                    id="phone" 
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    placeholder="+33 6 XX XX XX XX" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optionnel)</Label>
                  <Input 
                    id="notes" 
                    value={newClient.notes}
                    onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                    placeholder="Préférences, allergies..." 
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    className="shadow-md hover:shadow-glow-primary"
                    disabled={createClientMutation.isPending}
                  >
                    {createClientMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative animate-fade-in">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un client..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl border-border focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Client list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client, index) => (
            <div 
              key={client.id}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 gradient-gabon flex items-center justify-center font-bold text-lg rounded-full shadow-md group-hover:shadow-glow group-hover:scale-110 transition-all duration-300 relative">
                    <span className="z-10">{client.first_name[0]}{client.last_name[0]}</span>
                    <div className="absolute -top-1 -right-1 opacity-80">
                      <AfricanStarSymbol size={12} animated={true} color="yellow" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold group-hover:text-primary transition-colors">{client.first_name} {client.last_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Client depuis {new Date(client.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground group-hover:translate-x-1 transition-transform">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground group-hover:translate-x-1 transition-transform delay-75">
                  <Phone className="w-4 h-4" />
                  <span>{client.phone}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex gap-2">
                <Link to={`/clients/${client.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full hover:scale-105 transition-transform">
                  Voir profil
                </Button>
                </Link>
                <Button 
                  size="sm" 
                  className="flex-1 hover:scale-105 transition-transform shadow-sm hover:shadow-glow-primary"
                  onClick={() => {
                    setSelectedClientId(client.id);
                    setIsAppointmentDialogOpen(true);
                  }}
                >
                  Nouveau RDV
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12 bg-card border border-border rounded-xl animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Aucun client trouvé</p>
          </div>
        )}

        {/* Dialog pour créer un rendez-vous */}
        <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
          <DialogContent className="border border-border rounded-xl animate-scale-in max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nouveau rendez-vous</DialogTitle>
            </DialogHeader>
            
            {/* Sélection de la source de réservation */}
            <div className="mb-4 p-4 bg-secondary/50 border border-border rounded-lg">
              <Label className="text-sm font-medium mb-3 block">Source de la réservation *</Label>
              <RadioGroup
                value={appointmentForm.source}
                onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, source: value as 'website' | 'whatsapp' | 'phone' | 'walk_in' }))}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="website" id="source-website" />
                  <Label htmlFor="source-website" className="flex items-center gap-2 cursor-pointer flex-1">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <span className="font-medium">Site web</span>
                      <p className="text-xs text-muted-foreground">Réservation effectuée via le site</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="whatsapp" id="source-whatsapp" />
                  <Label htmlFor="source-whatsapp" className="flex items-center gap-2 cursor-pointer flex-1">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <span className="font-medium">WhatsApp</span>
                      <p className="text-xs text-muted-foreground">Réservation effectuée via WhatsApp</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phone" id="source-phone" />
                  <Label htmlFor="source-phone" className="flex items-center gap-2 cursor-pointer flex-1">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Phone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <span className="font-medium">Téléphone</span>
                      <p className="text-xs text-muted-foreground">Réservation effectuée par téléphone</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="walk_in" id="source-walk_in" />
                  <Label htmlFor="source-walk_in" className="flex items-center gap-2 cursor-pointer flex-1">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Users className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <span className="font-medium">Sur place</span>
                      <p className="text-xs text-muted-foreground">Client venu directement au salon</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {/* Option pour ouvrir WhatsApp si sélectionné */}
              {appointmentForm.source === 'whatsapp' && (
                <div className="mt-3 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
                    onClick={() => {
                      const client = clients.find(c => c.id === selectedClientId);
                      if (!client) return;
                      
                      // Ouvrir la simulation WhatsApp
                      setShowWhatsAppSimulation(true);
                      
                      // Initialiser les messages
                      const initialMessage = `Bonjour ${client.first_name},\n\nJe vous contacte concernant une réservation.\n\nPouvez-vous me confirmer vos disponibilités ?\n\nMerci !`;
                      setWhatsAppMessages([{
                        text: initialMessage,
                        sender: 'salon',
                        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                      }]);
                      
                      // Simuler une réponse automatique après 2 secondes
                      setTimeout(() => {
                        setWhatsAppMessages(prev => [...prev, {
                          text: `Bonjour ! Oui, je suis disponible. Quels sont vos créneaux disponibles cette semaine ?`,
                          sender: 'client',
                          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                        }]);
                      }, 2000);
                    }}
                  >
                    <MessageCircle className="w-3 h-3 mr-2" />
                    Ouvrir WhatsApp pour échanger avec le client
                  </Button>
                </div>
              )}
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!selectedClientId || !appointmentForm.serviceId || !appointmentForm.employeeId || !appointmentForm.date || !appointmentForm.startTime) {
                  toast({
                    title: "Erreur",
                    description: "Veuillez remplir tous les champs obligatoires.",
                    variant: "destructive",
                  });
                  return;
                }

                // TODO: Implémenter la création de rendez-vous via API
                toast({
                  title: "Fonctionnalité en cours de développement",
                  description: "La création de rendez-vous sera bientôt disponible.",
                });

                setIsAppointmentDialogOpen(false);
                setAppointmentForm({
                  serviceId: '',
                  employeeId: '',
                  date: new Date().toISOString().split('T')[0],
                  startTime: '',
                  notes: '',
                  source: 'website',
                });
                setSelectedClientId(null);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Client</Label>
                <Input 
                  value={selectedClientId ? clients.find(c => c.id === selectedClientId)?.first_name + ' ' + clients.find(c => c.id === selectedClientId)?.last_name : ''}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label>Service *</Label>
                <Select 
                  value={appointmentForm.serviceId}
                  onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, serviceId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.filter(s => s.is_active).map(service => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name} - {service.price.toLocaleString()} FCFA ({service.duration} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Coiffeur *</Label>
                <Select 
                  value={appointmentForm.employeeId}
                  onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, employeeId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un coiffeur" />
                  </SelectTrigger>
                  <SelectContent>
                    {coiffeurs.map(emp => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.first_name} {emp.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointment-date">Date *</Label>
                  <Input 
                    id="appointment-date" 
                    type="date" 
                    value={appointmentForm.date}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointment-time">Heure *</Label>
                  <Select 
                    value={appointmentForm.startTime}
                    onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, startTime: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une heure" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointment-notes">Notes (optionnel)</Label>
                <Input 
                  id="appointment-notes" 
                  placeholder="Préférences, allergies, demandes spéciales..."
                  value={appointmentForm.notes}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAppointmentDialogOpen(false);
                    setAppointmentForm({
                      serviceId: '',
                      employeeId: '',
                      date: new Date().toISOString().split('T')[0],
                      startTime: '',
                      notes: '',
                      source: 'website',
                    });
                    setSelectedClientId(null);
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit" className="shadow-md hover:shadow-glow-primary">
                  Créer le RDV
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Simulation WhatsApp */}
        {showWhatsAppSimulation && selectedClientId && (
          <Dialog open={showWhatsAppSimulation} onOpenChange={setShowWhatsAppSimulation}>
            <DialogContent className="border border-border rounded-xl animate-scale-in max-w-md p-0 h-[600px] flex flex-col">
              {/* Header WhatsApp */}
              <div className="bg-green-500 text-white p-4 rounded-t-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {clients.find(c => c.id === selectedClientId)?.first_name} {clients.find(c => c.id === selectedClientId)?.last_name}
                    </h3>
                    <p className="text-xs text-white/80">en ligne</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => {
                    setShowWhatsAppSimulation(false);
                    setWhatsAppMessages([]);
                    setWhatsAppInput('');
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                {whatsAppMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'salon' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.sender === 'salon'
                          ? 'bg-green-500 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'salon' ? 'text-white/70' : 'text-gray-500'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input zone */}
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-border">
                <div className="flex items-center gap-2">
                  <Input
                    value={whatsAppInput}
                    onChange={(e) => setWhatsAppInput(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && whatsAppInput.trim()) {
                        setWhatsAppMessages(prev => [...prev, {
                          text: whatsAppInput,
                          sender: 'salon',
                          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                        }]);
                        setWhatsAppInput('');
                        
                        // Simuler une réponse du client après 1.5 secondes
                        setTimeout(() => {
                          const responses = [
                            "Parfait, je suis disponible demain à 14h.",
                            "D'accord, merci pour l'information.",
                            "Je préfère le matin si possible.",
                            "Très bien, je confirme pour ce créneau."
                          ];
                          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                          setWhatsAppMessages(prev => [...prev, {
                            text: randomResponse,
                            sender: 'client',
                            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                          }]);
                        }, 1500);
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => {
                      if (whatsAppInput.trim()) {
                        setWhatsAppMessages(prev => [...prev, {
                          text: whatsAppInput,
                          sender: 'salon',
                          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                        }]);
                        setWhatsAppInput('');
                        
                        // Simuler une réponse du client
                        setTimeout(() => {
                          const responses = [
                            "Parfait, je suis disponible demain à 14h.",
                            "D'accord, merci pour l'information.",
                            "Je préfère le matin si possible.",
                            "Très bien, je confirme pour ce créneau."
                          ];
                          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                          setWhatsAppMessages(prev => [...prev, {
                            text: randomResponse,
                            sender: 'client',
                            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                          }]);
                        }, 1500);
                      }
                    }}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Bouton pour terminer et créer le RDV */}
                <div className="mt-3 pt-3 border-t border-border">
                  <Button
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => {
                      setShowWhatsAppSimulation(false);
                      toast({
                        title: "Échange terminé",
                        description: "Remplissez maintenant le formulaire ci-dessous avec les détails convenus pour créer le rendez-vous.",
                      });
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Terminer l'échange et créer le RDV
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
