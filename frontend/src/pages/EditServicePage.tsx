import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, X, Upload, Image as ImageIcon, Star, Trash2 } from 'lucide-react';
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
import type { Service, ServiceCategory, ServiceImage } from '@/types';

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { salon } = useTenant();

  // Fetch service data - CALL FIRST
  const { data: service, isLoading } = useQuery<Service>({
    queryKey: ['service', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/services/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });

  // Fetch categories - CALL SECOND
  const { data: categories = [] } = useQuery<ServiceCategory[]>({
    queryKey: ['serviceCategories'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/services/categories/');
      return Array.isArray(response.data) ? response.data : (response.data.results || []);
    },
  });

  // Fetch all services for image gallery fallback
  const { data: allServices = [] } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/services/');
      return Array.isArray(response.data) ? response.data : (response.data.results || []);
    },
  });

  // Gallery mutations
  const addGalleryImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      return await apiClient.post(`/api/v1/services/${id}/gallery/add/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      toast({ title: "Image ajoutée à la galerie" });
      queryClient.invalidateQueries({ queryKey: ['service', id] });
    },
    onError: () => toast({ title: "Erreur lors de l'ajout", variant: "destructive" }),
  });

  const deleteGalleryImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      return await apiClient.delete(`/api/v1/services/${id}/gallery/${imageId}/delete/`);
    },
    onSuccess: () => {
      toast({ title: "Image supprimée de la galerie" });
      queryClient.invalidateQueries({ queryKey: ['service', id] });
    },
  });

  const setPrimaryImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      return await apiClient.post(`/api/v1/services/${id}/gallery/${imageId}/primary/`);
    },
    onSuccess: () => {
      toast({ title: "Image définie comme principale" });
      queryClient.invalidateQueries({ queryKey: ['service', id] });
    },
  });

  // Update mutation - CALL THIRD (BEFORE conditional returns)
  const updateMutation = useMutation({
    mutationFn: async (formDataToSubmit: FormData) => {
      return await apiClient.patch(`/api/v1/services/${id}/`, formDataToSubmit, {
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
      await apiClient.delete(`/api/v1/services/${id}/delete_image/`);
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
                    <div className="relative group aspect-[4/5] rounded-lg overflow-hidden bg-gradient-to-br from-muted/10 to-secondary/10 border border-border">
                      {/* Image floue en arrière-plan */}
                      <div
                        className="absolute inset-0 bg-cover filter blur-lg scale-110 opacity-30"
                        style={{ backgroundImage: `url(${formData.image})`, objectPosition: 'center 25%' }}
                      />

                      {/* Image principale nette - cadrage buste + tête pro */}
                      <img
                        src={formData.image}
                        alt={formData.name || 'Service'}
                        className="relative z-10 w-full h-full object-contain"
                        style={{ objectPosition: 'center 25%' }}
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

              {/* Galerie d'images du service */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Galerie photos</h2>
                  <div>
                    <input
                      type="file"
                      id="gallery-upload"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          Array.from(e.target.files).forEach(file => {
                            addGalleryImageMutation.mutate(file);
                          });
                          e.target.value = ''; // Reset input
                        }
                      }}
                    />
                    <Label
                      htmlFor="gallery-upload"
                      className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Ajouter des photos
                    </Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {service?.images?.map((img) => (
                    <div key={img.id} className="relative group aspect-[4/5] rounded-lg overflow-hidden border border-border bg-muted/20">
                      <img
                        src={img.image}
                        alt={img.alt_text}
                        className="w-full h-full object-cover"
                      />

                      {/* Badge principale */}
                      {img.is_primary && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shadow-sm">
                          Principale
                        </div>
                      )}

                      {/* Actions overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                        {!img.is_primary && (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="w-full text-xs"
                            onClick={() => setPrimaryImageMutation.mutate(img.id)}
                          >
                            <Star className="w-3 h-3 mr-1" />
                            Définir principale
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="w-full text-xs"
                          onClick={() => deleteGalleryImageMutation.mutate(img.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}

                  {(!service?.images || service.images.length === 0) && (
                    <div className="col-span-full py-8 text-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed border-muted-foreground/20">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Aucune image dans la galerie</p>
                      <p className="text-xs">Ajoutez des photos pour montrer les différentes vues</p>
                    </div>
                  )}
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

