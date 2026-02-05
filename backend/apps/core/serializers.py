"""
Serializers for core app (Salon model)
"""
from rest_framework import serializers
from .models import Salon


class SalonSerializer(serializers.ModelSerializer):
    """Serializer complet pour le modèle Salon"""
    
    class Meta:
        model = Salon
        fields = [
            'id', 'name', 'address', 'phone', 'email',
            'opening_hours', 'currency', 'timezone',
            'logo', 'primary_color', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
