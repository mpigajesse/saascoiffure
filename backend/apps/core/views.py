"""
Views for core app - Salon management
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Salon
from .serializers import SalonSerializer
from apps.core.permissions import IsSalonAdmin


class SalonViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des salons.
    Les utilisateurs ne peuvent voir et modifier que leur propre salon.
    """
    serializer_class = SalonSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Retourne uniquement le salon de l'utilisateur connecté"""
        user = self.request.user
        if user.is_superuser:
            # Les superusers peuvent voir tous les salons
            return Salon.objects.all()
        elif user.salon:
            # Les utilisateurs normaux ne voient que leur salon
            return Salon.objects.filter(id=user.salon_id)
        return Salon.objects.none()
    
    def get_permissions(self):
        """Seuls les admins peuvent modifier les informations du salon"""
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsSalonAdmin()]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'])
    def my_salon(self, request):
        """Retourne le salon de l'utilisateur connecté"""
        if not request.user.salon:
            return Response({
                'error': 'Utilisateur non rattaché à un salon'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(request.user.salon)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'], url_path='update-my-salon')
    def update_my_salon(self, request):
        """Met à jour le salon de l'utilisateur connecté"""
        if not request.user.salon:
            return Response({
                'error': 'Utilisateur non rattaché à un salon'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Vérifier que l'utilisateur est admin
        if request.user.role != 'ADMIN':
            return Response({
                'error': 'Seuls les administrateurs peuvent modifier les informations du salon'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(
            request.user.salon,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'success': True,
            'message': 'Informations du salon mises à jour avec succès',
            'salon': serializer.data
        })
