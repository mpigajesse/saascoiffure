"""
Serializers for Services app
"""
from rest_framework import serializers
from .models import Service, ServiceCategory


class ServiceCategorySerializer(serializers.ModelSerializer):
    """Serializer pour les catégories de services"""
    
    services_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'description', 'services_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_services_count(self, obj):
        return obj.services.filter(is_active=True).count()


class ServiceSerializer(serializers.ModelSerializer):
    """Serializer pour les services"""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    duration_display = serializers.SerializerMethodField()
    target_display = serializers.CharField(source='get_target_display', read_only=True)
    
    class Meta:
        model = Service
        fields = [
            'id', 'name', 'description', 'category', 'category_name',
            'price', 'duration', 'duration_display', 'target', 'target_display',
            'image', 'is_active', 'is_published', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_duration_display(self, obj):
        return obj.get_duration_display()


class ServiceCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de services"""
    
    class Meta:
        model = Service
        fields = [
            'name', 'description', 'category', 'price', 'duration', 'target', 'image'
        ]
    
    def validate_price(self, value):
        """Vérifie que le prix est positif"""
        if value <= 0:
            raise serializers.ValidationError("Le prix doit être supérieur à 0")
        return value
    
    def validate_duration(self, value):
        """Vérifie que la durée est valide"""
        if value <= 0:
            raise serializers.ValidationError("La durée doit être supérieure à 0")
        if value > 480:  # 8 heures max
            raise serializers.ValidationError("La durée ne peut pas dépasser 8 heures (480 minutes)")
        return value
