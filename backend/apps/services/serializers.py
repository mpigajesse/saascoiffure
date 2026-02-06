"""
Serializers for Services app
"""
from rest_framework import serializers
from .models import Service, ServiceCategory, ServiceImage


class ServiceCategorySerializer(serializers.ModelSerializer):
    """Serializer pour les catégories de services"""
    
    services_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'description', 'services_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_services_count(self, obj):
        return obj.services.filter(is_active=True).count()


class ServiceImageSerializer(serializers.ModelSerializer):
    """Serializer pour les images de services"""
    
    class Meta:
        model = ServiceImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'order']
        read_only_fields = ['id']


class ServiceSerializer(serializers.ModelSerializer):
    """Serializer pour les services"""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    duration_display = serializers.SerializerMethodField()
    target_display = serializers.CharField(source='get_target_display', read_only=True)
    images = ServiceImageSerializer(many=True, read_only=True)
    main_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Service
        fields = [
            'id', 'name', 'description', 'category', 'category_name',
            'salon',
            'price', 'duration', 'duration_display', 'target', 'target_display',
            'image', 'main_image_url', 'images', 'is_active', 'is_published', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'salon']
    
    def get_duration_display(self, obj):
        return obj.get_duration_display()

    def get_main_image_url(self, obj):
        """Retourne l'URL absolue de l'image principale"""
        url = obj.main_image_url
        if url:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(url)
        return url


class ServiceCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de services"""
    
    # Permet d'accepter des images multiples à la création
    images_data = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Service
        fields = [
            'name', 'description', 'category', 'price', 'duration', 
            'target', 'image', 'images_data'
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
    
    def create(self, validated_data):
        """Crée le service et ses images associées"""
        images_data = validated_data.pop('images_data', [])
        service = Service.objects.create(**validated_data)
        
        # Créer les images associées
        for i, image_data in enumerate(images_data):
            ServiceImage.objects.create(
                service=service,
                salon=service.salon,
                image=image_data,
                order=i,
                is_primary=(i == 0)  # La première image est principale
            )
        
        return service
