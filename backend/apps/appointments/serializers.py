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
    employee_user_id = serializers.IntegerField(source='employee.user.id', read_only=True)
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
            'id', 'client', 'client_name', 'employee', 'employee_name', 'employee_user_id',
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
    
    def _get_salon(self):
        """Récupère le salon depuis le contexte ou header"""
        request = self.context.get('request')
        if not request:
            return None
        
        salon = getattr(request, 'salon', None)
        if not salon and request.user.is_superuser:
            from apps.core.models import Salon
            salon_id = request.headers.get('X-Salon-Id') or request.META.get('HTTP_X_SALON_ID')
            if salon_id:
                try:
                    salon = Salon.objects.get(id=salon_id)
                except (Salon.DoesNotExist, ValueError):
                    pass
        return salon
    
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
        
        salon = self._get_salon()
        if not salon:
            raise serializers.ValidationError({"detail": "Aucun salon sélectionné."})
        
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
        salon = self._get_salon()
        if not salon:
            raise serializers.ValidationError({"detail": "Aucun salon sélectionné."})
        
        validated_data['salon'] = salon
        
        # Définir la durée du service si non spécifiée
        if 'duration' not in validated_data:
            validated_data['duration'] = validated_data['service'].duration
        
        return super().create(validated_data)


class AppointmentUpdateStatusSerializer(serializers.Serializer):
    """Serializer pour la mise à jour du statut"""
    
    status = serializers.ChoiceField(choices=Appointment.STATUS_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True)
