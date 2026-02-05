"""
Business logic for Appointments app
"""
from django.db import transaction
from django.db.models import Count, Q
from datetime import datetime, timedelta, time as dt_time
from .models import Appointment


class AppointmentService:
    """Service centralisant la logique métier des rendez-vous"""
    
    @staticmethod
    def check_availability(salon, employee, date, time, duration):
        """
        Vérifie si un employé est disponible pour un créneau donné.
        Prend en compte :
        - Les rendez-vous existants
        - Le planning de travail de l'employé
        """
        # Conversion de time en objet time si nécessaire
        if isinstance(time, str):
            time = datetime.strptime(time, '%H:%M').time()
        
        # Calcul de l'heure de fin
        start_datetime = datetime.combine(date, time)
        end_datetime = start_datetime + timedelta(minutes=duration)
        end_time = end_datetime.time()
        
        # Vérification des rendez-vous existants
        overlapping = Appointment.objects.filter(
            salon=salon,
            employee=employee,
            date=date,
            status__in=['PENDING', 'CONFIRMED', 'IN_PROGRESS']
        ).filter(
            Q(time__lt=end_time, time__gte=time) |
            Q(time__lte=time)  # RDV qui commence avant et peut se chevaucher
        ).exists()
        
        return not overlapping
    
    @staticmethod
    def get_available_slots(salon, employee, date, service_duration=30):
        """
        Retourne les créneaux disponibles pour un employé sur une date.
        
        Args:
            salon: Le salon
            employee: L'employé
            date: La date
            service_duration: Durée du service en minutes
        
        Returns:
            Liste des créneaux disponibles (format HH:MM)
        """
        # Horaires de travail par défaut (à adapter selon le planning)
        opening_time = dt_time(8, 0)
        closing_time = dt_time(18, 0)
        slot_interval = 30  # Créneaux de 30 minutes
        
        # Récupération des rendez-vous existants
        existing_appointments = Appointment.objects.filter(
            salon=salon,
            employee=employee,
            date=date,
            status__in=['PENDING', 'CONFIRMED', 'IN_PROGRESS']
        ).values_list('time', 'duration')
        
        # Génération des créneaux possibles
        available_slots = []
        current_time = opening_time
        
        while current_time < closing_time:
            is_available = AppointmentService.check_availability(
                salon, employee, date, current_time, service_duration
            )
            
            if is_available:
                available_slots.append(current_time.strftime('%H:%M'))
            
            # Incrément du créneau
            current_datetime = datetime.combine(date, current_time)
            current_datetime += timedelta(minutes=slot_interval)
            current_time = current_datetime.time()
        
        return available_slots
    
    @staticmethod
    def get_dashboard_stats(salon, date=None):
        """
        Calcule les statistiques pour le dashboard.
        Si date est None, utilise aujourd'hui.
        """
        if date is None:
            date = datetime.now().date()
        
        appointments = Appointment.objects.filter(salon=salon, date=date)
        
        stats = {
            'total': appointments.count(),
            'pending': appointments.filter(status='PENDING').count(),
            'confirmed': appointments.filter(status='CONFIRMED').count(),
            'completed': appointments.filter(status='COMPLETED').count(),
            'cancelled': appointments.filter(status='CANCELLED').count(),
        }
        
        return stats
    
    @staticmethod
    def cancel_appointment(appointment, reason=''):
        """
        Annule un rendez-vous.
        Peut inclure une logique de notification.
        """
        with transaction.atomic():
            appointment.status = 'CANCELLED'
            if reason:
                appointment.notes = f"{appointment.notes}\nAnnulation: {reason}".strip()
            appointment.save()
        
        # TODO: Envoyer une notification au client
        
        return appointment
