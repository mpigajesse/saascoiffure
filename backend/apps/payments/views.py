"""
Views for Payments app
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from datetime import datetime, timedelta

from .models import Payment
from .serializers import (
    PaymentSerializer,
    PaymentCreateSerializer,
    PaymentStatsSerializer
)
from .services import PaymentService
from apps.core.permissions import IsSalonEmployee, IsSalonAdmin


class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des paiements"""
    permission_classes = [IsAuthenticated, IsSalonEmployee]
    
    def get_queryset(self):
        """Filtre par salon"""
        user = self.request.user
        
        # Superusers see all payments
        if user.is_superuser:
            queryset = Payment.objects.all()
        # Regular users see only their salon's payments
        elif self.request.salon:
            queryset = Payment.objects.filter(salon=self.request.salon)
        # No access
        else:
            queryset = Payment.objects.none()
        
        # Filtres
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter.upper())
        
        method_filter = self.request.query_params.get('method', None)
        if method_filter:
            queryset = queryset.filter(payment_method=method_filter.upper())
        
        client_id = self.request.query_params.get('client', None)
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        
        # Période
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date and end_date:
            queryset = queryset.filter(
                payment_date__date__range=[start_date, end_date]
            )
        
        return queryset.select_related(
            'client', 'appointment', 'appointment__service', 'salon'
        )
    
    def get_serializer_class(self):
        """Utilise des serializers différents selon l'action"""
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Statistiques des paiements"""
        # Période par défaut : mois en cours
        today = datetime.now().date()
        start_of_month = today.replace(day=1)
        
        start_date = request.query_params.get('start_date', start_of_month)
        end_date = request.query_params.get('end_date', today)
        
        stats = PaymentService.get_payment_stats(
            request.salon,
            start_date,
            end_date
        )
        
        return Response({
            'success': True,
            'period': {
                'start': start_date,
                'end': end_date
            },
            'stats': stats
        })
    
    @action(detail=False, methods=['get'])
    def daily_revenue(self, request):
        """Revenu journalier"""
        today = datetime.now().date()
        date = request.query_params.get('date', today)
        
        revenue = PaymentService.get_daily_revenue(request.salon, date)
        
        return Response({
            'success': True,
            'date': date,
            'revenue': revenue
        })
    
    @action(detail=False, methods=['get'])
    def monthly_revenue(self, request):
        """Revenu mensuel"""
        today = datetime.now().date()
        year = int(request.query_params.get('year', today.year))
        month = int(request.query_params.get('month', today.month))
        
        revenue = PaymentService.get_monthly_revenue(
            request.salon,
            year,
            month
        )
        
        return Response({
            'success': True,
            'period': f"{year}-{month:02d}",
            'revenue': revenue
        })
