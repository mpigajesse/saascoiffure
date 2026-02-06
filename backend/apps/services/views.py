"""
Views for Services app
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q

from rest_framework.parsers import MultiPartParser, FormParser

from .models import Service, ServiceCategory, ServiceImage
from .serializers import (
    ServiceSerializer,
    ServiceCreateSerializer,
    ServiceCategorySerializer,
    ServiceImageSerializer
)
from apps.core.permissions import IsSalonAdmin, IsSalonEmployee


class ServiceCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet pour les catégories de services"""
    serializer_class = ServiceCategorySerializer
    permission_classes = [IsAuthenticated, IsSalonEmployee]
    
    def _get_salon_for_superuser(self):
        """Récupère le salon depuis le header X-Salon-Id pour les superusers"""
        from apps.core.models import Salon
        salon_id = self.request.headers.get('X-Salon-Id') or self.request.META.get('HTTP_X_SALON_ID')
        if salon_id:
            try:
                return Salon.objects.get(id=salon_id)
            except (Salon.DoesNotExist, ValueError):
                pass
        salon_id = self.request.query_params.get('salon')
        if salon_id:
            try:
                return Salon.objects.get(id=salon_id)
            except (Salon.DoesNotExist, ValueError):
                pass
        return None
    
    def get_queryset(self):
        """Filtre par salon"""
        user = self.request.user
        
        # Superusers see all service categories
        if user.is_superuser:
            queryset = ServiceCategory.objects.all()
        # Regular users see only their salon's categories
        elif self.request.salon:
            queryset = ServiceCategory.objects.filter(salon=self.request.salon)
        # No access
        else:
            queryset = ServiceCategory.objects.none()
        
        return queryset
    
    def get_permissions(self):
        """Seuls les admins peuvent créer/modifier/supprimer"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSalonAdmin()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        salon = self.request.salon
        if not salon and self.request.user.is_superuser:
            salon = self._get_salon_for_superuser()
        if not salon:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": "Aucun salon sélectionné."})
        serializer.save(salon=salon)


class ServiceViewSet(viewsets.ModelViewSet):
    """ViewSet pour les services"""
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    
    def _get_salon_for_superuser(self):
        """Récupère le salon depuis le header X-Salon-Id pour les superusers"""
        from apps.core.models import Salon
        salon_id = self.request.headers.get('X-Salon-Id') or self.request.META.get('HTTP_X_SALON_ID')
        if salon_id:
            try:
                return Salon.objects.get(id=salon_id)
            except (Salon.DoesNotExist, ValueError):
                pass
        salon_id = self.request.query_params.get('salon')
        if salon_id:
            try:
                return Salon.objects.get(id=salon_id)
            except (Salon.DoesNotExist, ValueError):
                pass
        return None
    
    def get_queryset(self):
        """Filtre par salon"""
        user = self.request.user
        
        # Superusers see all services
        if user.is_superuser:
            queryset = Service.objects.all()
        # Regular users see only their salon's services
        elif self.request.salon:
            queryset = Service.objects.filter(salon=self.request.salon)
        # No access
        else:
            queryset = Service.objects.none()
        
        # Filtres
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Recherche
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset.select_related('category', 'salon')
    
    def get_serializer_class(self):
        """Utilise des serializers différents selon l'action"""
        if self.action == 'create':
            return ServiceCreateSerializer
        if self.action == 'partial_update':
            return ServiceSerializer
        return ServiceSerializer
    
    def get_permissions(self):
        """
        Liste des services accessible publiquement (pour booking)
        Création/modification/suppression réservées aux admins
        """
        if self.action == 'list':
            return [AllowAny()]
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSalonAdmin()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        salon = self.request.salon
        if not salon and self.request.user.is_superuser:
            salon = self._get_salon_for_superuser()
        if not salon:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": "Aucun salon sélectionné."})
        serializer.save(salon=salon)

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_image(self, request, pk=None):
        service = self.get_object()
        serializer = ServiceSerializer(service, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'])
    def delete_image(self, request, pk=None):
        service = self.get_object()
        if service.image:
            service.image.delete(save=True)
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'detail': 'No image to delete.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser], url_path='gallery/add')
    def add_gallery_image(self, request, pk=None):
        """Ajoute une image à la galerie du service"""
        service = self.get_object()
        
        # Vérifier si l'image est fournie
        if 'image' not in request.data:
            return Response({'detail': 'Aucune image fournie.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Créer les données pour le serializer
        data = {
            'image': request.data['image'],
            'service': service.id,
            'salon': service.salon.id
        }
        
        # Définir l'ordre (à la fin)
        last_image = ServiceImage.objects.filter(service=service).order_by('-order').first()
        data['order'] = (last_image.order + 1) if last_image else 0
        
        # Définir comme primaire si c'est la seule image
        if not ServiceImage.objects.filter(service=service).exists():
            data['is_primary'] = True
            
        serializer = ServiceImageSerializer(data=data)
        if serializer.is_valid():
            serializer.save(service=service, salon=service.salon)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='gallery/(?P<image_id>[^/.]+)/delete')
    def delete_gallery_image(self, request, pk=None, image_id=None):
        """Supprime une image de la galerie"""
        service = self.get_object()
        try:
            image = ServiceImage.objects.get(pk=image_id, service=service)
            image.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ServiceImage.DoesNotExist:
            return Response({'detail': 'Image non trouvée.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], url_path='gallery/(?P<image_id>[^/.]+)/primary')
    def set_primary_gallery_image(self, request, pk=None, image_id=None):
        """Définit une image de la galerie comme principale"""
        service = self.get_object()
        try:
            image = ServiceImage.objects.get(pk=image_id, service=service)
            image.is_primary = True
            image.save() # Le save() gère déjà la déselection des autres primaires
            
            # Mise à jour de l'image principale du service pour compatibilité
            # On copie le fichier de la galerie vers le champ image principal
            if image.image:
                from django.core.files.base import ContentFile
                with image.image.open() as f:
                     # On utilise le nom du fichier d'origine
                    service.image.save(image.image.name.split('/')[-1], ContentFile(f.read()), save=True)
            
            return Response(status=status.HTTP_200_OK)
        except ServiceImage.DoesNotExist:
            return Response({'detail': 'Image non trouvée.'}, status=status.HTTP_404_NOT_FOUND)
        
    @action(detail=True, methods=['post'], permission_classes=[IsSalonAdmin])
    def toggle_active(self, request, pk=None):
        """Active ou désactive un service"""
        service = self.get_object()
        service.is_active = not service.is_active
        service.save()
        
        return Response({
            'success': True,
            'message': f"Service {'activé' if service.is_active else 'désactivé'}",
            'is_active': service.is_active
        })
    
    @action(detail=True, methods=['post'])
    def toggle_published(self, request, pk=None):
        """Publie/dépublie un service sur le site public"""
        service = self.get_object()
        service.is_published = not service.is_published
        service.save()
        
        return Response({
            'success': True,
            'message': f"Service {'publié' if service.is_published else 'dépublié'}",
            'is_published': service.is_published
        })


class PublicServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet public pour les services d'un salon (accessible sans authentification).
    Utilisé par le site client pour afficher les services.
    """
    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        from apps.core.models import Salon
        
        slug = self.kwargs.get('salon_slug')
        if not slug:
            return Service.objects.none()
        
        try:
            salon = Salon.objects.get(slug=slug, is_active=True)
        except Salon.DoesNotExist:
            return Service.objects.none()
        
        # Retourne uniquement les services publiés et actifs
        return Service.objects.filter(
            salon=salon,
            is_active=True,
            is_published=True
        ).select_related('category').prefetch_related('images')


class PublicServiceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet public pour les catégories de services d'un salon.
    """
    serializer_class = ServiceCategorySerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        from apps.core.models import Salon
        
        slug = self.kwargs.get('salon_slug')
        if not slug:
            return ServiceCategory.objects.none()
        
        try:
            salon = Salon.objects.get(slug=slug, is_active=True)
        except Salon.DoesNotExist:
            return ServiceCategory.objects.none()
        
        # Seules les catégories contenant des services actifs et publiés sont retournées
        return ServiceCategory.objects.filter(
            salon=salon,
            services__is_active=True,
            services__is_published=True
        ).distinct()
