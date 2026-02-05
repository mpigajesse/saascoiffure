"""
Business logic for Employees app
"""
from django.db import transaction
from .models import Employee


class EmployeeService:
    """Service centralisant la logique métier des employés"""
    
    @staticmethod
    def get_available_employees(salon, date=None, time=None):
        """
        Retourne les employés disponibles pour une date/heure donnée.
        Prend en compte :
        - is_available = True
        - Planning de travail
        - Rendez-vous existants
        """
        employees = Employee.objects.filter(
            salon=salon,
            is_available=True
        )
        
        # TODO: Ajouter la logique de vérification des rendez-vous
        # pour filtrer les employés déjà occupés à cette date/heure
        
        return employees
    
    @staticmethod
    def get_employee_appointments(employee, date=None):
        """Récupère les rendez-vous d'un employé pour une date"""
        from apps.appointments.models import Appointment
        
        queryset = Appointment.objects.filter(employee=employee)
        
        if date:
            queryset = queryset.filter(date=date)
        
        return queryset.order_by('date', 'time')
    
    @staticmethod
    def update_work_schedule(employee, schedule_data):
        """
        Met à jour le planning de travail d'un employé.
        Format attendu: {"lundi": "9:00-18:00", ...}
        """
        with transaction.atomic():
            employee.work_schedule = schedule_data
            employee.save()
        
        return employee
