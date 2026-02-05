"""
Business logic for Services app
"""
from django.db import transaction
from django.db.models import Count, Sum
from .models import Service, ServiceCategory


class ServiceService:
    """Service centralisant la logique métier des services"""
    
    @staticmethod
    def get_popular_services(salon, limit=10):
        """
        Retourne les services les plus populaires du salon
        basés sur le nombre de rendez-vous.
        """
        from apps.appointments.models import Appointment
        
        services = Service.objects.filter(
            salon=salon,
            is_active=True
        ).annotate(
            appointment_count=Count('appointment')
        ).order_by('-appointment_count')[:limit]
        
        return services
    
    @staticmethod
    def get_services_by_category(salon):
        """
        Retourne les services groupés par catégorie.
        """
        services = Service.objects.filter(
            salon=salon,
            is_active=True
        ).select_related('category').order_by('category__name', 'name')
        
        # Groupement par catégorie
        result = {}
        for service in services:
            category_name = service.category.name if service.category else 'Sans catégorie'
            if category_name not in result:
                result[category_name] = []
            result[category_name].append(service)
        
        return result
    
    @staticmethod
    def calculate_total_revenue_by_service(salon, service_id):
        """
        Calcule le revenu total généré par un service.
        """
        from apps.appointments.models import Appointment
        
        total = Appointment.objects.filter(
            salon=salon,
            service_id=service_id,
            status='COMPLETED'
        ).aggregate(
            total=Sum('service__price')
        )['total'] or 0
        
        return float(total)
