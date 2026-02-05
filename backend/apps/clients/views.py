"""
Views for Clients app
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count

from .models import Client
from .serializers import ClientSerializer, ClientCreateSerializer
from .services import ClientService
from apps.core.permissions import IsSalonEmployee, IsSalonOwner


class ClientViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des clients.
    Toutes les opérations sont filtrées par salon automatiquement.
    """
    permission_classes = [IsAuthenticated, IsSalonEmployee]
    
    def get_queryset(self):
        """Filtre automatiquement par salon"""
        user = self.request.user
        
        # Superusers see all clients
        if user.is_superuser:
            queryset = Client.objects.all()
        # Regular users see only their salon's clients
        elif self.request.salon:
            queryset = Client.objects.filter(salon=self.request.salon)
        # No access
        else:
            queryset = Client.objects.none()
        
        # Filtres optionnels
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Recherche
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(phone__icontains=search)
            )
        
        return queryset.select_related('preferred_employee', 'salon')
    
    def get_serializer_class(self):
        """Utilise des serializers différents selon l'action"""
        if self.action == 'create':
            return ClientCreateSerializer
        return ClientSerializer
    
    def perform_create(self, serializer):
        """Associe automatiquement le salon"""
        serializer.save(salon=self.request.salon)
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Récupère l'historique des rendez-vous d'un client"""
        client = self.get_object()
        history = ClientService.get_client_history(client)
        
        from apps.appointments.serializers import AppointmentSerializer
        serializer = AppointmentSerializer(history, many=True)
        
        return Response({
            'success': True,
            'client': ClientSerializer(client).data,
            'appointments': serializer.data
        })
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Statistiques d'un client"""
        client = self.get_object()
        stats = ClientService.get_client_stats(client)
        
        return Response({
            'success': True,
            'stats': stats
        })
