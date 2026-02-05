"""
Serializers for Clients app
"""
from rest_framework import serializers
from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    """Serializer pour les clients"""
    
    full_name = serializers.SerializerMethodField()
    preferred_employee_name = serializers.CharField(
        source='preferred_employee.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = Client
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'phone', 'email',
            'preferred_employee', 'preferred_employee_name', 'notes',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_full_name(self, obj):
        return obj.get_full_name()


class ClientCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de clients"""
    
    class Meta:
        model = Client
        fields = [
            'first_name', 'last_name', 'phone', 'email',
            'preferred_employee', 'notes'
        ]
    
    def validate_phone(self, value):
        """Vérifie que le téléphone n'existe pas déjà pour ce salon"""
        salon = self.context['request'].salon
        if Client.objects.filter(salon=salon, phone=value).exists():
            raise serializers.ValidationError(
                "Un client avec ce numéro de téléphone existe déjà dans votre salon"
            )
        return value
