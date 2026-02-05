import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { AfricanStarSymbol } from '@/components/african-symbols/AfricanSymbols';
import { apiClient } from '@/lib/api-client';
import { useTenant } from '@/contexts/TenantContext';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import type { Service, ServiceCategory } from '@/types';

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { salon } = useTenant();

  // Fetch service data - CALL FIRST
  const { data: service, isLoading } = useQuery<Service>({
    queryKey: ['service', id],
    queryFn: async () => {
      const response = await apiClient.get(`/services/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });

  // Fetch categories - CALL SECOND
  const { data: categories = [] } = useQuery<ServiceCategory[]>({
    queryKey: ['serviceCategories'],
    queryFn: async () => {
      const response = await apiClient.get('/services/categories/');
      return Array.isArray(response.data) ? response.data : (response.data.results || []);
    },
  });

  // Fetch all services for image gallery
  const { data: allServices = [] } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await apiClient.get('/services/');
      return Array.isArray(response.data) ? response.data : (response.data.results || []);
    },
  });

  // Update mutation - CALL THIRD (BEFORE conditional returns)
  const updateMutation = useMutation({
    mutationFn: async (formDataToSubmit: FormData) => {
      return await apiClient.patch(`/services/${id}/`, formDataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Service modifié !",
        description: "Les modifications ont été enregistrées avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service', id] });
      navigate('/services');
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification du service.",
        variant: "destructive",
      });
      console.error('Update error:', error);
    },
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    category: '',
    target: 'femme',
    is_active: true,
    image: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Update form data when service loads
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        duration: service.duration || 30,
        price: service.price || 0,
        category: service.category ? (typeof service.category === 'object' ? String(service.category.id) : String(service.category)) : '',
        target: service.target || 'femme',
        is_active: service.is_active ?? true,
        image: service.image || '',
      });
    }
  }, [service]);

  const selectedCategory = categories.find(c => c.id.toString() === formData.category?.toString());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('duration', formData.duration.toString());
    data.append('price', formData.price.toString());
    data.append('category', formData.category);
    data.append('target', formData.target);
    data.append('is_active', formData.is_active.toString());
    if (imageFile) {
      data.append('image', imageFile);
    }
    await updateMutation.mutateAsync(data);
  };

  const handleDeleteImage = async () => {
    try {
      await apiClient.delete(`/services/${id}/delete_image/`);
      toast({ title: "Image supprimée" });
      setFormData({ ...formData, image: '' });
      queryClient.invalidateQueries({ queryKey: ['service', id] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    } catch (error) {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    }
  };

  // NOW we can use conditional returns after all hooks are called
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Chargement du service...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!service) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <X className="w-16 h-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Service introuvable</h2>
          <p className="text-muted-foreground">Le service demandé n'existe pas.</p>
          <Button onClick={() => navigate('/services')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux services
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/services/${service.id}`)}
            className="hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <AfricanStarSymbol size={24} animated={true} color="gradient" />
              </div>
              Modifier le service
            </h1>
            <p className="text-muted-foreground mt-1">Modifiez les informations du service</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informations de base */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-bold">Informations de base</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du service *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Ex: Coupe Homme, Tresses Africaines, Coloration"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Décrivez le service en détail..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Durée (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Prix ({salon?.currency || 'XAF'}) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie *</Label>
                    <Select
                      value={formData.category?.toString() || ''}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target">Cible du service</Label>
                    <Select
                      value={formData.target}
                      onValueChange={(value) => setFormData({ ...formData, target: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une cible" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="femme">Femme</SelectItem>
                        <SelectItem value="homme">Homme</SelectItem>
                        <SelectItem value="enfant_fille">Enfant (Fille)</SelectItem>
                        <SelectItem value="enfant_garcon">Enfant (Garçon)</SelectItem>

                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(value) => setFormData({ ...formData, is_active: value })}
                  />
                  <Label htmlFor="is_active" className="text-sm">
                    {formData.is_active ? 'Service actif' : 'Service inactif'}
                  </Label>
                </div>
              </div>

              {/* Image du service */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="text-xl font-bold">Image du service</h2>
                
                <div className="space-y-4">
                  {formData.image && (
                    <div className="relative group h-64 rounded-lg overflow-hidden bg-secondary border border-border">
                      <img
                        src={formData.image}
                        alt={formData.name || 'Service'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleDeleteImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="image-upload">Télécharger une nouvelle image</Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                    />
                    <p className="text-xs text-muted-foreground">
                      L'ajout d'une nouvelle image remplacera l'ancienne lors de l'enregistrement.
                    </p>
                  </div>
                </div>
              </div>

              {/* Galerie d'images */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="text-xl font-bold">Galerie d'images</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-64 overflow-y-auto">
                  {allServices.filter(s => s.image).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={cn(
                        "relative aspect-square rounded-lg overflow-hidden transition-transform hover:scale-105",
                        formData.image === s.image && "ring-2 ring-primary ring-offset-2"
                      )}
                      onClick={() => {
                        setFormData({ ...formData, image: s.image || '' });
                        setImageFile(null); // Clear file input if gallery image is selected
                      }}
                    >
                      <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                      {formData.image === s.image && (
                        <div className="absolute inset-0 bg-primary/50 flex items-center justify-center">
                          <X className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Colonne latérale */}
            <div className="space-y-6">
              {/* Catégorie */}
              {selectedCategory && (
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                  <h2 className="text-xl font-bold">Catégorie</h2>
                  <p className="text-sm text-muted-foreground">Catégorie sélectionnée</p>
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-primary text-primary-foreground">
                    {selectedCategory.name}
                  </span>
                </div>
              )}

              {/* Aperçu */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="text-xl font-bold">Aperçu</h2>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durée:</span>
                    <span className="font-semibold">{formData.duration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prix:</span>
                    <span className="font-semibold text-primary">{formatPrice(formData.price || 0, salon?.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Statut:</span>
                    <span className={cn(
                      "font-semibold",
                      formData.is_active ? "text-green-500" : "text-muted-foreground"
                    )}>
                      {formData.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/services/${service.id}`)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

