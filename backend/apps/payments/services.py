"""
Business logic for Payments app
"""
from django.db import transaction
from django.db.models import Sum, Count, Q
from datetime import datetime
from .models import Payment


class PaymentService:
    """Service centralisant la logique métier des paiements"""
    
    @staticmethod
    def create_payment(salon, appointment, amount, payment_method, **kwargs):
        """
        Crée un paiement pour un rendez-vous.
        Met à jour automatiquement le statut du rendez-vous.
        """
        with transaction.atomic():
            payment = Payment.objects.create(
                salon=salon,
                appointment=appointment,
                client=appointment.client,
                amount=amount,
                payment_method=payment_method,
                status='COMPLETED',
                payment_date=datetime.now(),
                **kwargs
            )
            
            # Met à jour le statut du rendez-vous
            if appointment.status != 'COMPLETED':
                appointment.status = 'COMPLETED'
                appointment.save()
        
        return payment
    
    @staticmethod
    def get_payment_stats(salon, start_date, end_date):
        """
        Calcule les statistiques de paiements pour une période.
        """
        payments = Payment.objects.filter(
            salon=salon,
            payment_date__date__range=[start_date, end_date],
            status='COMPLETED'
        )
        
        # Montant total
        total = payments.aggregate(total=Sum('amount'))['total'] or 0
        
        # Par méthode de paiement
        by_method = {}
        for method_code, method_name in Payment.PAYMENT_METHOD_CHOICES:
            method_total = payments.filter(
                payment_method=method_code
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            by_method[method_name] = float(method_total)
        
        # Par statut
        by_status = {}
        for status_code, status_name in Payment.STATUS_CHOICES:
            status_count = payments.filter(status=status_code).count()
            by_status[status_name] = status_count
        
        return {
            'total_amount': float(total),
            'total_count': payments.count(),
            'by_method': by_method,
            'by_status': by_status
        }
    
    @staticmethod
    def get_daily_revenue(salon, date):
        """Calcule le revenu d'une journée"""
        total = Payment.objects.filter(
            salon=salon,
            payment_date__date=date,
            status='COMPLETED'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        return float(total)
    
    @staticmethod
    def get_monthly_revenue(salon, year, month):
        """Calcule le revenu d'un mois"""
        total = Payment.objects.filter(
            salon=salon,
            payment_date__year=year,
            payment_date__month=month,
            status='COMPLETED'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        return float(total)
    
    @staticmethod
    def refund_payment(payment, reason=''):
        """
        Rembourse un paiement.
        Met à jour le statut du paiement et potentiellement du rendez-vous.
        """
        with transaction.atomic():
            payment.status = 'REFUNDED'
            if reason:
                payment.notes = f"{payment.notes}\nRemboursement: {reason}".strip()
            payment.save()
            
            # Peut-être annuler le rendez-vous aussi
            # À définir selon la logique métier
        
        return payment
