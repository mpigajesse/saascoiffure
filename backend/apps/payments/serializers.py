"""
Serializers for Payments app
"""
from rest_framework import serializers
from django.utils import timezone
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer pour les paiements"""
    
    client_name = serializers.CharField(source='client.get_full_name', read_only=True)
    appointment_date = serializers.DateField(source='appointment.date', read_only=True)
    service_name = serializers.CharField(source='appointment.service.name', read_only=True)
    payment_method_display = serializers.CharField(
        source='get_payment_method_display',
        read_only=True
    )
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'appointment', 'appointment_date', 'service_name',
            'client', 'client_name', 'amount',
            'payment_method', 'payment_method_display',
            'status', 'status_display', 'payment_date',
            'transaction_id', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de paiements"""
    
    class Meta:
        model = Payment
        fields = [
            'appointment', 'client', 'amount',
            'payment_method', 'transaction_id', 'notes'
        ]
    
    def validate_amount(self, value):
        """Vérifie que le montant est positif"""
        if value <= 0:
            raise serializers.ValidationError("Le montant doit être supérieur à 0")
        return value
    
    def create(self, validated_data):
        """Crée le paiement et met à jour le statut"""
        validated_data['salon'] = self.context['request'].salon
        validated_data['status'] = 'COMPLETED'
        validated_data['payment_date'] = timezone.now()
        
        payment = super().create(validated_data)
        
        # Met à jour le statut du rendez-vous
        if payment.appointment.status != 'COMPLETED':
            payment.appointment.status = 'COMPLETED'
            payment.appointment.save()
        
        return payment


class PaymentStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques de paiements"""
    
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_count = serializers.IntegerField()
    by_method = serializers.DictField()
    by_status = serializers.DictField()
