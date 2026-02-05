"""
Serializers for Appointments app
"""
from rest_framework import serializers
from django.utils import timezone
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer pour les rendez-vous"""
    
    # Relations en lecture seule
    client_name = serializers.CharField(source='client.get_full_name', read_only=True)
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    service_price = serializers.DecimalField(
        source='service.price',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'client', 'client_name', 'employee', 'employee_name',
            'service', 'service_name', 'service_price',
            'date', 'time', 'duration', 'status', 'status_display',
            'notes', 'payment_method',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de rendez-vous"""
    
    class Meta:
        model = Appointment
        fields = [
            'client', 'employee', 'service', 'date', 'time',
            'duration', 'notes', 'payment_method'
        ]
    
    def validate_date(self, value):
        """Vérifie que la date n'est pas dans le passé"""
        if value < timezone.now().date():
            raise serializers.ValidationError("La date ne peut pas être dans le passé")
        return value
    
    def validate(self, data):
        """
        Validation croisée :
        - Vérifie que l'employé est disponible
        - Vérifie qu'il n'y a pas de conflit d'horaires
        """
        from .services import AppointmentService
        
        salon = self.context['request'].salon
        
        # Vérification de la disponibilité
        is_available = AppointmentService.check_availability(
            salon=salon,
            employee=data['employee'],
            date=data['date'],
            time=data['time'],
            duration=data.get('duration', data['service'].duration)
        )
        
        if not is_available:
            raise serializers.ValidationError(
                "Ce créneau n'est pas disponible pour cet employé"
            )
        
        return data
    
    def create(self, validated_data):
        """Associe le salon lors de la création"""
        validated_data['salon'] = self.context['request'].salon
        
        # Définir la durée du service si non spécifiée
        if 'duration' not in validated_data:
            validated_data['duration'] = validated_data['service'].duration
        
        return super().create(validated_data)


class AppointmentUpdateStatusSerializer(serializers.Serializer):
    """Serializer pour la mise à jour du statut"""
    
    status = serializers.ChoiceField(choices=Appointment.STATUS_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True)
