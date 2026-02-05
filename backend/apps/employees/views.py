"""
Views for Employees app
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import Employee
from .serializers import EmployeeSerializer, EmployeeCreateSerializer
from apps.core.permissions import IsSalonAdmin, IsSalonEmployee


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des employés.
    Seuls les admins peuvent créer/modifier/supprimer.
    """
    permission_classes = [IsAuthenticated, IsSalonEmployee]
    
    def get_queryset(self):
        """Filtre automatiquement par salon"""
        user = self.request.user
        
        # Superusers see all employees
        if user.is_superuser:
            queryset = Employee.objects.all()
        # Regular users see only their salon's employees
        elif self.request.salon:
            queryset = Employee.objects.filter(salon=self.request.salon)
        # No access
        else:
            queryset = Employee.objects.none()
        
        # Filtres
        is_available = self.request.query_params.get('is_available', None)
        if is_available is not None:
            queryset = queryset.filter(is_available=is_available.lower() == 'true')
        
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(user__role=role.upper())
        
        return queryset.select_related('user', 'salon')
    
    def get_serializer_class(self):
        """Utilise des serializers différents selon l'action"""
        if self.action == 'create':
            return EmployeeCreateSerializer
        return EmployeeSerializer
    
    def get_permissions(self):
        """Seuls les admins peuvent créer/modifier/supprimer"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSalonAdmin()]
        return super().get_permissions()
    
    def get_serializer_context(self):
        """Ajoute le salon au contexte"""
        context = super().get_serializer_context()
        context['salon'] = self.request.salon
        return context
    
    @action(detail=True, methods=['post'])
    def toggle_availability(self, request, pk=None):
        """Active/désactive la disponibilité d'un employé"""
        employee = self.get_object()
        employee.is_available = not employee.is_available
        employee.save()
        
        return Response({
            'success': True,
            'message': f"Employé {'activé' if employee.is_available else 'désactivé'}",
            'is_available': employee.is_available
        })
    
    @action(detail=True, methods=['get'])
    def schedule(self, request, pk=None):
        """Récupère le planning de l'employé"""
        employee = self.get_object()
        
        return Response({
            'success': True,
            'work_schedule': employee.work_schedule
        })
