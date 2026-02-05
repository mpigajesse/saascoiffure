"""
Views for Appointments app
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from datetime import datetime, timedelta

from .models import Appointment
from .serializers import (
    AppointmentSerializer,
    AppointmentCreateSerializer,
    AppointmentUpdateStatusSerializer
)
from .services import AppointmentService
from apps.core.permissions import IsSalonEmployee


class AppointmentViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des rendez-vous"""
    permission_classes = [IsAuthenticated, IsSalonEmployee]
    
    def get_queryset(self):
        """Filtre par salon avec options de filtrage"""
        user = self.request.user
        
        # Superusers see all appointments
        if user.is_superuser:
            queryset = Appointment.objects.all()
        # Regular users see only their salon's appointments
        elif self.request.salon:
            queryset = Appointment.objects.filter(salon=self.request.salon)
        # No access
        else:
            queryset = Appointment.objects.none()
        
        # Filtres
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter.upper())
        
        date_filter = self.request.query_params.get('date', None)
        if date_filter:
            queryset = queryset.filter(date=date_filter)
        
        employee_id = self.request.query_params.get('employee', None)
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        
        client_id = self.request.query_params.get('client', None)
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        
        return queryset.select_related(
            'client', 'employee', 'employee__user', 'service', 'salon'
        )
    
    def get_serializer_class(self):
        """Utilise des serializers différents selon l'action"""
        if self.action == 'create':
            return AppointmentCreateSerializer
        return AppointmentSerializer
    
    def get_permissions(self):
        """Création publique (pour booking), le reste authentifié"""
        if self.action == 'create':
            return [AllowAny()]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Rendez-vous du jour"""
        today = datetime.now().date()
        appointments = self.get_queryset().filter(date=today)
        serializer = self.get_serializer(appointments, many=True)
        
        return Response({
            'success': True,
            'date': today,
            'count': appointments.count(),
            'appointments': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Rendez-vous à venir (7 prochains jours)"""
        today = datetime.now().date()
        end_date = today + timedelta(days=7)
        
        appointments = self.get_queryset().filter(
            date__range=[today, end_date],
            status__in=['PENDING', 'CONFIRMED']
        )
        serializer = self.get_serializer(appointments, many=True)
        
        return Response({
            'success': True,
            'period': f"{today} - {end_date}",
            'count': appointments.count(),
            'appointments': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Met à jour le statut d'un rendez-vous"""
        appointment = self.get_object()
        serializer = AppointmentUpdateStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        appointment.status = serializer.validated_data['status']
        if 'notes' in serializer.validated_data:
            appointment.notes = serializer.validated_data['notes']
        appointment.save()
        
        return Response({
            'success': True,
            'message': 'Statut mis à jour',
            'appointment': AppointmentSerializer(appointment).data
        })
    
    @action(detail=False, methods=['post'])
    def check_availability(self, request):
        """Vérifie la disponibilité pour un créneau"""
        employee_id = request.data.get('employee_id')
        date = request.data.get('date')
        time = request.data.get('time')
        duration = request.data.get('duration', 30)
        
        from apps.employees.models import Employee
        employee = Employee.objects.get(id=employee_id, salon=request.salon)
        
        is_available = AppointmentService.check_availability(
            salon=request.salon,
            employee=employee,
            date=date,
            time=time,
            duration=duration
        )
        
        return Response({
            'success': True,
            'available': is_available
        })
