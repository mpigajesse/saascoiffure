"""
Views for Services app
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q

from rest_framework.parsers import MultiPartParser, FormParser

from .models import Service, ServiceCategory
from .serializers import (
    ServiceSerializer,
    ServiceCreateSerializer,
    ServiceCategorySerializer
)
from apps.core.permissions import IsSalonAdmin, IsSalonEmployee


class ServiceCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet pour les catégories de services"""
    serializer_class = ServiceCategorySerializer
    permission_classes = [IsAuthenticated, IsSalonEmployee]
    
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
        serializer.save(salon=self.request.salon)


class ServiceViewSet(viewsets.ModelViewSet):
    """ViewSet pour les services"""
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    
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
        serializer.save(salon=self.request.salon)

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
