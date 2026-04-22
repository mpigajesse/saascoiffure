"""
Public views for booking (no authentication required)
Allows clients to book appointments without logging in
"""
from datetime import datetime, timedelta

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db import transaction

from apps.core.models import Salon
from apps.clients.models import Client
from apps.employees.models import Employee
from apps.services.models import Service
from apps.appointments.models import Appointment
from apps.appointments.services import AppointmentService
from apps.payments.models import Payment


class PublicCheckClientView(APIView):
    """Check if a client exists by email for a specific salon"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        email = request.query_params.get('email')
        salon_slug = request.query_params.get('salon_slug')
        
        if not email or not salon_slug:
            return Response({
                'error': 'Email et salon_slug requis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            salon = Salon.objects.get(slug=salon_slug, is_active=True)
        except Salon.DoesNotExist:
            return Response({
                'error': 'Salon non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        
        try:
            client = Client.objects.get(email=email, salon=salon)
            return Response({
                'exists': True,
                'client': {
                    'id': client.id,
                    'first_name': client.first_name,
                    'last_name': client.last_name,
                    'email': client.email,
                    'phone': client.phone,
                }
            })
        except Client.DoesNotExist:
            return Response({
                'exists': False,
                'client': None
            })


class PublicBookingView(APIView):
    """Create a booking without authentication"""
    permission_classes = [AllowAny]
    
    @transaction.atomic
    def post(self, request):
        data = request.data
        
        # Required fields
        salon_slug = data.get('salon_slug')
        service_id = data.get('service_id')
        employee_id = data.get('employee_id')
        date = data.get('date')
        time = data.get('time')
        
        # Client info
        client_email = data.get('email')
        client_first_name = data.get('first_name')
        client_last_name = data.get('last_name')
        client_phone = data.get('phone')
        
        # Optional
        notes = data.get('notes', '')
        payment_method = data.get('payment_method')
        
        # Validate required fields
        if not all([salon_slug, service_id, date, time, client_email, client_first_name, client_last_name]):
            return Response({
                'error': 'Champs requis manquants',
                'required': ['salon_slug', 'service_id', 'date', 'time', 'email', 'first_name', 'last_name']
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get salon
        try:
            salon = Salon.objects.get(slug=salon_slug, is_active=True)
        except Salon.DoesNotExist:
            return Response({
                'error': 'Salon non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get service
        try:
            service = Service.objects.get(id=service_id, salon=salon, is_active=True)
        except Service.DoesNotExist:
            return Response({
                'error': 'Service non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get employee (optional - can be assigned later)
        employee = None
        if employee_id:
            try:
                employee = Employee.objects.get(id=employee_id, salon=salon, is_available=True)
            except Employee.DoesNotExist:
                return Response({
                    'error': 'Coiffeur non disponible'
                }, status=status.HTTP_404_NOT_FOUND)
        
        # Get or create client
        client, created = Client.objects.get_or_create(
            email=client_email,
            salon=salon,
            defaults={
                'first_name': client_first_name,
                'last_name': client_last_name,
                'phone': client_phone or '',
            }
        )
        
        # Update client info if existing
        if not created:
            if client_phone:
                client.phone = client_phone
            client.save()
        
        # Parse date and time
        appointment_time = datetime.strptime(time, '%H:%M').time()
        appointment_date = datetime.strptime(date, '%Y-%m-%d').date()
        service_duration = service.duration
        
        # Check availability before booking (real-time check)
        if employee:
            is_available = AppointmentService.check_availability(
                salon=salon,
                employee=employee,
                date=appointment_date,
                time=appointment_time,
                duration=service_duration
            )
            
            if not is_available:
                return Response({
                    'error': 'Ce créneau n\'est plus disponible. Veuillez choisir un autre horaire.',
                    'code': 'SLOT_UNAVAILABLE'
                }, status=status.HTTP_409_CONFLICT)
        
        # Create appointment
        appointment = Appointment.objects.create(
            salon=salon,
            client=client,
            employee=employee,
            service=service,
            date=appointment_date,
            time=appointment_time,
            duration=service_duration,
            status='PENDING',
            notes=notes,
        )
        
        # Create payment record if payment method specified
        payment = None
        if payment_method:
            payment = Payment.objects.create(
                salon=salon,
                appointment=appointment,
                amount=service.price,
                payment_method=payment_method.upper(),
                status='PENDING',
            )
        
        return Response({
            'success': True,
            'message': 'Réservation créée avec succès',
            'booking': {
                'id': appointment.id,
                'date': str(appointment.date),
                'time': str(appointment.time),
                'service': {
                    'id': service.id,
                    'name': service.name,
                    'price': float(service.price),
                    'duration': service.duration,
                },
                'employee': {
                    'id': employee.id,
                    'name': f"{employee.user.first_name} {employee.user.last_name}",
                } if employee else None,
                'client': {
                    'id': client.id,
                    'name': f"{client.first_name} {client.last_name}",
                    'email': client.email,
                },
                'salon': {
                    'id': salon.id,
                    'name': salon.name,
                },
                'payment': {
                    'id': payment.id,
                    'method': payment_method,
                    'amount': float(service.price),
                    'status': 'PENDING',
                } if payment else None,
            }
        }, status=status.HTTP_201_CREATED)


class PublicAvailableSlotsView(APIView):
    """Get available time slots for a specific employee on a date"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        salon_slug = request.query_params.get('salon_slug')
        employee_id = request.query_params.get('employee_id')
        date_str = request.query_params.get('date')
        service_id = request.query_params.get('service_id')
        
        if not all([salon_slug, employee_id, date_str]):
            return Response({
                'error': 'Paramètres requis: salon_slug, employee_id, date'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get salon
        try:
            salon = Salon.objects.get(slug=salon_slug, is_active=True)
        except Salon.DoesNotExist:
            return Response({
                'error': 'Salon non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get employee
        try:
            employee = Employee.objects.get(id=employee_id, salon=salon, is_available=True)
        except Employee.DoesNotExist:
            return Response({
                'error': 'Coiffeur non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get service duration (default 30 min if not specified)
        service_duration = 30
        if service_id:
            try:
                service = Service.objects.get(id=service_id, salon=salon, is_active=True)
                service_duration = service.duration
            except Service.DoesNotExist:
                pass
        
        # Parse date
        try:
            appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({
                'error': 'Format de date invalide. Utilisez YYYY-MM-DD'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if date is not in the past
        today = datetime.now().date()
        if appointment_date < today:
            return Response({
                'error': 'Impossible de réserver une date passée',
                'slots': []
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get available slots
        available_slots = AppointmentService.get_available_slots(
            salon=salon,
            employee=employee,
            date=appointment_date,
            service_duration=service_duration
        )
        
        # If booking for today, filter out past time slots
        if appointment_date == today:
            current_time = datetime.now().time()
            available_slots = [
                slot for slot in available_slots
                if datetime.strptime(slot, '%H:%M').time() > current_time
            ]
        
        return Response({
            'date': date_str,
            'employee_id': int(employee_id),
            'service_duration': service_duration,
            'slots': available_slots
        })
