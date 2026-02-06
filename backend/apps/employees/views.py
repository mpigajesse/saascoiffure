"""
Views for Employees app
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count
from django.utils import timezone

from .models import Employee
from .serializers import (
    EmployeeSerializer, 
    EmployeeCreateSerializer,
    EmployeeUpdateSerializer
)
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
        
        # SOFT DELETE: On ne montre que les comptes utilisateurs actifs
        queryset = queryset.filter(user__is_active=True)
        
        # Filtres
        is_available = self.request.query_params.get('is_available', None)
        if is_available is not None:
            queryset = queryset.filter(is_available=is_available.lower() == 'true')
        
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(user__role=role.upper())
        
        # Annotations pour les statistiques
        now = timezone.now()
        queryset = queryset.annotate(
            total_appointments_count=Count('appointments'),
            today_appointments_count=Count(
                'appointments',
                filter=Q(appointments__date=now.date())
            )
        )
        
        return queryset.select_related('user', 'salon').order_by('user__first_name', 'user__last_name')
    
    def get_serializer_class(self):
        """Utilise des serializers différents selon l'action"""
        if self.action == 'create':
            return EmployeeCreateSerializer
        if self.action in ['update', 'partial_update']:
            return EmployeeUpdateSerializer
        return EmployeeSerializer
    
    def get_permissions(self):
        """Seuls les admins peuvent créer/modifier/supprimer"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSalonAdmin()]
        return super().get_permissions()
    
    def get_serializer_context(self):
        """Ajoute le salon au contexte"""
        context = super().get_serializer_context()
        
        # For superusers, get salon from X-Salon-Id header (authentication is complete at this point)
        salon = self.request.salon
        if not salon and self.request.user.is_superuser:
            from apps.core.models import Salon
            # Try header first (Django converts to HTTP_X_SALON_ID in META)
            salon_id = self.request.headers.get('X-Salon-Id') or self.request.META.get('HTTP_X_SALON_ID')
            if salon_id:
                try:
                    salon = Salon.objects.get(id=salon_id)
                except (Salon.DoesNotExist, ValueError):
                    pass
            # Fallback to query param
            if not salon:
                salon_id = self.request.query_params.get('salon')
                if salon_id:
                    try:
                        salon = Salon.objects.get(id=salon_id)
                    except (Salon.DoesNotExist, ValueError):
                        pass
        
        context['salon'] = salon
        return context

    def perform_destroy(self, instance):
        """
        Soft delete: On désactive l'utilisateur au lieu de supprimer l'enregistrement.
        Cela permet de conserver l'historique des rendez-vous.
        """
        # Désactiver l'utilisateur (empêche la connexion)
        if instance.user:
            instance.user.is_active = False
            instance.user.save()
        
        # Marquer l'employé comme indisponible
        instance.is_available = False
        instance.save()
    
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
    
    @action(detail=True, methods=['get', 'put', 'patch'], permission_classes=[IsSalonAdmin])
    def permissions(self, request, pk=None):
        """
        Gère les permissions personnalisées d'un employé.
        GET: Récupère les permissions actuelles
        PUT/PATCH: Met à jour les permissions
        """
        from .permissions_model import EmployeePermission
        from .permissions_serializers import EmployeePermissionSerializer, EmployeePermissionUpdateSerializer
        
        employee = self.get_object()
        
        # GET: Récupérer les permissions
        if request.method == 'GET':
            # Créer l'objet de permissions s'il n'existe pas
            permission_obj, created = EmployeePermission.objects.get_or_create(employee=employee)
            serializer = EmployeePermissionSerializer(permission_obj)
            
            return Response({
                'success': True,
                'permissions': serializer.data
            })
        
        # PUT/PATCH: Mettre à jour les permissions
        else:
            permission_obj, created = EmployeePermission.objects.get_or_create(employee=employee)
            serializer = EmployeePermissionUpdateSerializer(
                permission_obj,
                data=request.data,
                partial=(request.method == 'PATCH')
            )
            
            if serializer.is_valid():
                serializer.save()
                # Retourner les données complètes
                full_serializer = EmployeePermissionSerializer(permission_obj)
                return Response({
                    'success': True,
                    'message': 'Permissions mises à jour avec succès',
                    'permissions': full_serializer.data
                })
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)


class PublicEmployeeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet public pour lister les coiffeurs d'un salon.
    Accessible sans authentification.
    """
    permission_classes = []  # Pas d'authentification requise
    serializer_class = EmployeeSerializer
    
    def get_queryset(self):
        """Filtre par salon slug depuis l'URL"""
        slug = self.kwargs.get('salon_slug')
        if not slug:
            return Employee.objects.none()
        
        from apps.core.models import Salon
        try:
            salon = Salon.objects.get(slug=slug, is_active=True)
        except Salon.DoesNotExist:
            return Employee.objects.none()
        
        # Retourne uniquement les coiffeurs disponibles et actifs
        return Employee.objects.filter(
            salon=salon,
            is_available=True,
            user__is_active=True,
            user__role='COIFFEUR'
        ).select_related('user', 'salon')
