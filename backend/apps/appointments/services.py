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
        
        # Conversion de date si nécessaire
        if isinstance(date, str):
            date = datetime.strptime(date, '%Y-%m-%d').date()
        
        # Calcul de l'heure de fin du nouveau créneau
        new_start = datetime.combine(date, time)
        new_end = new_start + timedelta(minutes=duration)
        
        # Récupérer les rendez-vous existants pour cet employé ce jour
        existing_appointments = Appointment.objects.filter(
            salon=salon,
            employee=employee,
            date=date,
            status__in=['PENDING', 'CONFIRMED', 'IN_PROGRESS']
        )
        
        # Vérifier chaque rendez-vous existant pour un chevauchement
        for apt in existing_appointments:
            # Calculer l'heure de fin du RDV existant
            existing_start = datetime.combine(date, apt.time)
            existing_end = existing_start + timedelta(minutes=apt.duration)
            
            # Deux intervalles se chevauchent si:
            # new_start < existing_end AND new_end > existing_start
            if new_start < existing_end and new_end > existing_start:
                return False
        
        return True
    
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
        #Prend en compte la gestion avancée des horaires d'ouverture par jour.
        from apps.core.utils_openinghours import get_opening_hours_for_day, get_employee_working_hours_for_day

        # Get salon's opening hours
        salon_opening_time, salon_closing_time, salon_is_closed = get_opening_hours_for_day(salon, date)
        if salon_is_closed:
            return []

        # Get employee's working hours
        employee_start_time, employee_end_time, employee_is_off_day = get_employee_working_hours_for_day(employee, date)
        if employee_is_off_day:
            return []

        # Determine the effective start and end times for slot generation
        # The effective start time is the later of the salon's opening and the employee's start.
        effective_start_time = max(salon_opening_time, employee_start_time)
        # The effective end time is the earlier of the salon's closing and the employee's end.
        effective_end_time = min(salon_closing_time, employee_end_time)

        # If effective_start_time is after or equal to effective_end_time, no slots are possible.
        if effective_start_time >= effective_end_time:
            return []

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
        current_time = effective_start_time
        
        while current_time < effective_end_time:
            # Calculate potential end time of the current slot
            current_slot_end = (datetime.combine(date, current_time) + timedelta(minutes=service_duration)).time()

            # Ensure the entire service duration fits within effective working hours
            if current_slot_end > effective_end_time:
                break # This slot and subsequent ones are too long

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
