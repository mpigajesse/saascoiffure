import { useState } from 'react';
import { Plus, Scissors } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ServiceCard } from '@/components/services';
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
import { cn } from '@/lib/utils';
import { Service } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTarget, setSelectedTarget] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Récupérer les services depuis l'API
  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await apiClient.get('/services/');
      // DRF peut retourner un objet paginé ou un tableau
      return Array.isArray(response.data) ? response.data : (response.data.results || []);
    },
  });

  // Récupérer les catégories depuis l'API
  const { data: categories = [] } = useQuery({
    queryKey: ['serviceCategories'],
    queryFn: async () => {
      const response = await apiClient.get('/services/categories/');
      return Array.isArray(response.data) ? response.data : (response.data.results || []);
    },
  });

  const handleTogglePublish = async (service: Service) => {
    try {
      const response = await apiClient.post(`/services/${service.id}/toggle_published/`);
      
      toast({
        title: service.is_published ? "Service dépublié" : "Service publié",
        description: `"${service.name}" est maintenant ${service.is_published ? "hors ligne" : "en ligne"}.`,
      });

      // Invalider le cache pour refresh
      queryClient.invalidateQueries({ queryKey: ['services'] });
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de publication.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteService = async (service: Service) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${service.name}" ?`)) {
      return;
    }

    try {
      await apiClient.delete(`/services/${service.id}/`);
      
      toast({
        title: "Service supprimé",
        description: `"${service.name}" a été supprimé avec succès.`,
      });

      // Invalider le cache pour refresh
      queryClient.invalidateQueries({ queryKey: ['services'] });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le service.",
        variant: "destructive",
      });
    }
  };

  // Filtrer les services
  const filteredServices = services.filter(s => {
    const matchesCategory = selectedCategory === 'all' || s.category?.id.toString() === selectedCategory;
    const matchesTarget = selectedTarget === 'all' || s.target === selectedTarget;
    const matchesSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesTarget && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="animate-fade-in-left">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Scissors className="w-6 h-6 text-primary" />
              </div>
              Services
            </h1>
            <p className="text-muted-foreground mt-1">{services.length} services disponibles</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-md hover:shadow-glow-primary transition-all duration-300 hover:scale-105">
                <Plus className="w-4 h-4" />
                Nouveau service
              </Button>
            </DialogTrigger>
            <DialogContent className="border border-border rounded-xl animate-scale-in">
              <DialogHeader>
                <DialogTitle>Ajouter un service</DialogTitle>
              </DialogHeader>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du service</Label>
                  <Input id="name" placeholder="Ex: Coupe Homme, Tresses Africaines" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Durée (minutes)</Label>
                    <Input id="duration" type="number" placeholder="30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Prix (XAF)</Label>
                    <Input id="price" type="number" placeholder="25000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Input id="description" placeholder="Décrivez le service en détail..." />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" className="shadow-md hover:shadow-glow-primary">Enregistrer</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          {/* Recherche */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Rechercher</Label>
            <Input
              placeholder="Rechercher un service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Filtre par catégorie */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Scissors className="w-3.5 h-3.5 text-muted-foreground" />
              <Label className="text-xs font-medium">Catégorie</Label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className="h-7 text-xs px-2"
              >
                Toutes
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id.toString() ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id.toString())}
                  className="h-7 text-xs px-2"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Filtre par cible */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Scissors className="w-3.5 h-3.5 text-muted-foreground" />
              <Label className="text-xs font-medium">Cible</Label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant={selectedTarget === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTarget('all')}
                className="h-7 text-xs px-2"
              >
                Toutes
              </Button>
              <Button
                variant={selectedTarget === 'femme' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTarget('femme')}
                className="h-7 text-xs px-2"
              >
                Femme
              </Button>
              <Button
                variant={selectedTarget === 'homme' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTarget('homme')}
                className="h-7 text-xs px-2"
              >
                Homme
              </Button>
              <Button
                variant={selectedTarget === 'enfant_fille' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTarget('enfant_fille')}
                className="h-7 text-xs px-2"
              >
                Enfant (Fille)
              </Button>
              <Button
                variant={selectedTarget === 'enfant_garcon' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTarget('enfant_garcon')}
                className="h-7 text-xs px-2"
              >
                Enfant (Garçon)
              </Button>
            </div>
          </div>

          {/* Résumé des filtres actifs */}
          {(selectedCategory !== 'all' || selectedTarget !== 'all' || searchQuery) && (
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {filteredServices.length} service{filteredServices.length > 1 ? 's' : ''} trouvé{filteredServices.length > 1 ? 's' : ''}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedTarget('all');
                  setSearchQuery('');
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>

        {/* Affichage des services */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement des services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <Scissors className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun service trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard 
                key={service.id} 
                service={service}
                onTogglePublish={() => handleTogglePublish(service)}
                onDelete={() => handleDeleteService(service)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
