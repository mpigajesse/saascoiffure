"""
Serializers for Employees app
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Employee

User = get_user_model()


class EmployeeSerializer(serializers.ModelSerializer):
    """Serializer pour les employés"""
    
    # Informations de l'utilisateur
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    full_name = serializers.SerializerMethodField()
    phone = serializers.CharField(source='user.phone', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)
    role_display = serializers.CharField(source='user.get_role_display', read_only=True)
    
    specialties_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Employee
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 'phone',
            'role', 'role_display', 'specialties', 'specialties_list', 'bio',
            'photo', 'is_available', 'work_schedule',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_specialties_list(self, obj):
        return obj.get_specialties_list()


class EmployeeCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'employés"""
    
    # Données de l'utilisateur
    email = serializers.EmailField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    phone = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, write_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'email', 'first_name', 'last_name', 'phone', 'password', 'role',
            'specialties', 'bio', 'photo', 'work_schedule'
        ]
    
    def create(self, validated_data):
        """Crée un utilisateur ET un profil employé"""
        from django.db import transaction
        
        # Extraction des données utilisateur
        user_data = {
            'email': validated_data.pop('email'),
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'phone': validated_data.pop('phone', ''),
            'role': validated_data.pop('role'),
        }
        password = validated_data.pop('password')
        salon = self.context['salon']
        
        with transaction.atomic():
            # Création de l'utilisateur
            user = User.objects.create_user(
                password=password,
                salon=salon,
                **user_data
            )
            
            # Création du profil employé
            employee = Employee.objects.create(
                user=user,
                salon=salon,
                **validated_data
            )
        
        return employee
