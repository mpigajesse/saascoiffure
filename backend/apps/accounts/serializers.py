"""
Serializers for accounts app
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from apps.core.serializers import SalonSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle User"""
    
    salon_name = serializers.CharField(source='salon.name', read_only=True)
    salon_details = SalonSerializer(source='salon', read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'salon', 'salon_name', 'salon_details', 'role', 'is_active',
            'is_superuser', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined', 'salon', 'is_superuser']
    
    def get_full_name(self, obj):
        return obj.get_full_name()


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer pour l'inscription (création de salon)"""
    
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    # Informations du salon
    salon_name = serializers.CharField(write_only=True)
    salon_address = serializers.CharField(write_only=True)
    salon_phone = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'phone',
            'password', 'password_confirm',
            'salon_name', 'salon_address', 'salon_phone'
        ]
    
    def validate(self, data):
        """Validation des mots de passe"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas")
        return data
    
    def create(self, validated_data):
        """
        Crée un salon ET un utilisateur admin.
        Transaction atomique pour garantir la cohérence.
        """
        from django.db import transaction
        from apps.core.models import Salon
        
        # Extraction des données du salon
        salon_data = {
            'name': validated_data.pop('salon_name'),
            'address': validated_data.pop('salon_address'),
            'phone': validated_data.pop('salon_phone'),
            'email': validated_data['email']
        }
        
        # Suppression des champs non nécessaires
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        with transaction.atomic():
            # Création du salon
            salon = Salon.objects.create(**salon_data)
            
            # Création de l'utilisateur admin
            user = User.objects.create_user(
                password=password,
                salon=salon,
                role='ADMIN',
                **validated_data
            )
        
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Ajoute des informations supplémentaires dans le token JWT"""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Ajout d'informations personnalisées
        token['salon_id'] = user.salon_id if user.salon else None
        token['role'] = user.role
        token['full_name'] = user.get_full_name()
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Ajout d'informations utilisateur complètes dans la réponse
        user_serializer = UserSerializer(self.user)
        data['user'] = user_serializer.data
        
        return data


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer pour le changement de mot de passe"""
    
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError("Les nouveaux mots de passe ne correspondent pas")
        return data
