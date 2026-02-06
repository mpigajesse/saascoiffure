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
from apps.core.permissions import CanManageAppointments


class AppointmentViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des rendez-vous"""
    permission_classes = [IsAuthenticated, CanManageAppointments]
    
    def get_queryset(self):
        """Filtre par salon avec options de filtrage"""
        user = self.request.user
        
        # Prioritize salon context (whether from user or header)
        if self.request.salon:
            queryset = Appointment.objects.filter(salon=self.request.salon)
        # Fallback for superusers without specific salon context: see all
        elif user.is_superuser:
            queryset = Appointment.objects.all()
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
    def confirm(self, request, pk=None):
        """Confirme un rendez-vous en attente"""
        appointment = self.get_object()
        
        if appointment.status != 'PENDING':
            return Response({
                'success': False,
                'error': 'Seuls les rendez-vous en attente peuvent être confirmés'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        appointment.status = 'CONFIRMED'
        appointment.save()
        
        return Response({
            'success': True,
            'message': 'Rendez-vous confirmé',
            'appointment': AppointmentSerializer(appointment).data
        })
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Démarre un rendez-vous (passe en IN_PROGRESS)"""
        appointment = self.get_object()
        
        if appointment.status not in ['PENDING', 'CONFIRMED']:
            return Response({
                'success': False,
                'error': 'Ce rendez-vous ne peut pas être démarré'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        appointment.status = 'IN_PROGRESS'
        appointment.save()
        
        return Response({
            'success': True,
            'message': 'Rendez-vous démarré',
            'appointment': AppointmentSerializer(appointment).data
        })
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Termine un rendez-vous"""
        appointment = self.get_object()
        
        if appointment.status in ['COMPLETED', 'CANCELLED', 'NO_SHOW']:
            return Response({
                'success': False,
                'error': 'Ce rendez-vous est déjà terminé ou annulé'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        appointment.status = 'COMPLETED'
        appointment.save()
        
        return Response({
            'success': True,
            'message': 'Rendez-vous terminé',
            'appointment': AppointmentSerializer(appointment).data
        })
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annule un rendez-vous"""
        appointment = self.get_object()
        
        if appointment.status in ['COMPLETED', 'CANCELLED']:
            return Response({
                'success': False,
                'error': 'Ce rendez-vous ne peut pas être annulé'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        reason = request.data.get('reason', '')
        
        appointment.status = 'CANCELLED'
        if reason:
            appointment.notes = f"{appointment.notes}\nAnnulation: {reason}".strip()
        appointment.save()
        
        return Response({
            'success': True,
            'message': 'Rendez-vous annulé',
            'appointment': AppointmentSerializer(appointment).data
        })
    
    @action(detail=True, methods=['post'])
    def reschedule(self, request, pk=None):
        """Reporte un rendez-vous à une nouvelle date/heure"""
        appointment = self.get_object()
        
        if appointment.status in ['COMPLETED', 'CANCELLED']:
            return Response({
                'success': False,
                'error': 'Un rendez-vous terminé ou annulé ne peut pas être reporté'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        new_date = request.data.get('date')
        new_time = request.data.get('time')
        
        if not new_date or not new_time:
            return Response({
                'success': False,
                'error': 'Date et heure sont requises'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier la disponibilité
        is_available = AppointmentService.check_availability(
            salon=appointment.salon,
            employee=appointment.employee,
            date=new_date,
            time=new_time,
            duration=appointment.duration
        )
        
        if not is_available:
            return Response({
                'success': False,
                'error': 'Ce créneau n\'est pas disponible'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Sauvegarder l'ancienne date dans les notes
        old_info = f"Reporté de {appointment.date} {appointment.time}"
        appointment.notes = f"{appointment.notes}\n{old_info}".strip()
        
        # Mettre à jour
        appointment.date = new_date
        appointment.time = datetime.strptime(new_time, '%H:%M').time()
        appointment.status = 'PENDING'  # Retour en attente après report
        appointment.save()
        
        return Response({
            'success': True,
            'message': 'Rendez-vous reporté',
            'appointment': AppointmentSerializer(appointment).data
        })
    
    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        """Déplace un rendez-vous vers un autre employé"""
        appointment = self.get_object()
        
        if appointment.status in ['COMPLETED', 'CANCELLED']:
            return Response({
                'success': False,
                'error': 'Un rendez-vous terminé ou annulé ne peut pas être déplacé'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        new_employee_id = request.data.get('employee_id')
        
        if not new_employee_id:
            return Response({
                'success': False,
                'error': 'L\'ID de l\'employé est requis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        from apps.employees.models import Employee
        
        try:
            new_employee = Employee.objects.get(id=new_employee_id, salon=appointment.salon)
        except Employee.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Employé non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Vérifier la disponibilité du nouvel employé
        is_available = AppointmentService.check_availability(
            salon=appointment.salon,
            employee=new_employee,
            date=appointment.date,
            time=appointment.time,
            duration=appointment.duration
        )
        
        if not is_available:
            return Response({
                'success': False,
                'error': 'Le nouvel employé n\'est pas disponible à ce créneau'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Sauvegarder l'ancien employé dans les notes
        old_employee_name = appointment.employee.user.get_full_name()
        new_employee_name = new_employee.user.get_full_name()
        move_info = f"Déplacé de {old_employee_name} vers {new_employee_name}"
        appointment.notes = f"{appointment.notes}\n{move_info}".strip()
        
        # Mettre à jour
        appointment.employee = new_employee
        appointment.save()
        
        return Response({
            'success': True,
            'message': 'Rendez-vous déplacé',
            'appointment': AppointmentSerializer(appointment).data
        })
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Met à jour le statut d'un rendez-vous (legacy, à éviter)"""
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
    
    @action(detail=False, methods=['get'], url_path='available-slots')
    def available_slots(self, request):
        """Retourne les créneaux disponibles pour un employé et une date"""
        employee_id = request.query_params.get('employee_id')
        date = request.query_params.get('date')
        service_id = request.query_params.get('service_id')
        
        if not employee_id or not date:
            return Response({
                'error': 'employee_id et date sont requis'
            }, status=400)
        
        from apps.employees.models import Employee
        from apps.services.models import Service
        from datetime import datetime
        
        try:
            employee = Employee.objects.get(id=employee_id, salon=request.salon)
        except Employee.DoesNotExist:
            return Response({'error': 'Employé non trouvé'}, status=404)
        
        # Get service duration if provided
        service_duration = 30
        if service_id:
            try:
                service = Service.objects.get(id=service_id, salon=request.salon)
                service_duration = service.duration
            except Service.DoesNotExist:
                pass
        
        # Parse date
        try:
            appointment_date = datetime.strptime(date, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Format de date invalide'}, status=400)
        
        # Get available slots
        available = AppointmentService.get_available_slots(
            salon=request.salon,
            employee=employee,
            date=appointment_date,
            service_duration=service_duration
        )
        
        # Filter out past times if today
        today = datetime.now().date()
        if appointment_date == today:
            current_time = datetime.now().time()
            available = [
                slot for slot in available
                if datetime.strptime(slot, '%H:%M').time() > current_time
            ]
        
        return Response({
            'date': date,
            'employee_id': int(employee_id),
            'service_duration': service_duration,
            'slots': available
        })

