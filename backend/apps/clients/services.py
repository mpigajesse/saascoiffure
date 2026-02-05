"""
Business logic for Clients app
RÈGLE DRY : Toute la logique métier est centralisée ici
"""
from django.db import transaction
from django.db.models import Count, Sum
from .models import Client


class ClientService:
    """
    Service centralisant toute la logique métier des clients.
    Aucune logique métier ne doit être dupliquée ailleurs.
    """
    
    @staticmethod
    def create_client(salon, data):
        """
        Crée un client pour un salon.
        Gère les validations métier.
        """
        with transaction.atomic():
            client = Client.objects.create(
                salon=salon,
                first_name=data['first_name'],
                last_name=data['last_name'],
                phone=data['phone'],
                email=data.get('email'),
                preferred_employee=data.get('preferred_employee'),
                notes=data.get('notes', '')
            )
            return client
    
    @staticmethod
    def get_client_history(client):
        """
        Récupère l'historique des rendez-vous d'un client.
        Retourne une QuerySet ordonnée.
        """
        from apps.appointments.models import Appointment
        
        return Appointment.objects.filter(
            salon=client.salon,
            client=client
        ).select_related(
            'service', 'employee'
        ).order_by('-date', '-time')
    
    @staticmethod
    def get_client_stats(client):
        """
        Calcule les statistiques d'un client.
        - Nombre total de rendez-vous
        - Montant total dépensé
        - Service le plus utilisé
        """
        from apps.appointments.models import Appointment
        from django.db.models import Count, Sum
        
        appointments = Appointment.objects.filter(
            salon=client.salon,
            client=client
        )
        
        total_appointments = appointments.count()
        
        # Montant total (si paiement lié)
        total_spent = appointments.aggregate(
            total=Sum('service__price')
        )['total'] or 0
        
        # Service le plus utilisé
        most_used_service = appointments.values(
            'service__name'
        ).annotate(
            count=Count('id')
        ).order_by('-count').first()
        
        return {
            'total_appointments': total_appointments,
            'total_spent': float(total_spent),
            'most_used_service': most_used_service['service__name'] if most_used_service else None,
            'most_used_service_count': most_used_service['count'] if most_used_service else 0
        }
    
    @staticmethod
    def search_clients(salon, query):
        """
        Recherche des clients par nom, prénom ou téléphone.
        """
        from django.db.models import Q
        
        return Client.objects.filter(
            salon=salon,
            is_active=True
        ).filter(
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(phone__icontains=query)
        )
