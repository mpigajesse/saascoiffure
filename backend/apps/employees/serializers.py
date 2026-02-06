"""
Serializers for Employees app
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.core.validators import validate_gabon_phone, normalize_gabon_phone
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
    
    # Statistiques (annotées dans la vue)
    total_appointments = serializers.IntegerField(source='total_appointments_count', read_only=True, default=0)
    today_appointments = serializers.IntegerField(source='today_appointments_count', read_only=True, default=0)
    
    specialties_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Employee
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 'phone',
            'role', 'role_display', 'specialties', 'specialties_list', 'bio',
            'photo', 'is_available', 'work_schedule',
            'created_at', 'updated_at',
            'total_appointments', 'today_appointments'
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
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, write_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'email', 'first_name', 'last_name', 'phone', 'password', 'role',
            'specialties', 'bio', 'photo', 'work_schedule'
        ]
    
    def validate_phone(self, value):
        """Valide et normalise le format du numéro de téléphone gabonais"""
        if value:  # Seulement si le numéro est fourni
            validate_gabon_phone(value)
            return normalize_gabon_phone(value)
        return value
    
    class Meta:
        model = Employee
        fields = [
            'email', 'first_name', 'last_name', 'phone', 'password', 'role',
            'specialties', 'bio', 'photo', 'work_schedule'
        ]
    
    def create(self, validated_data):
        """Crée un utilisateur ET un profil employé"""
        from django.db import transaction
        from rest_framework.exceptions import ValidationError
        
        # Extraction des données utilisateur
        user_data = {
            'email': validated_data.pop('email'),
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'phone': validated_data.pop('phone', ''),
            'role': validated_data.pop('role'),
        }
        password = validated_data.pop('password')
        salon = self.context.get('salon')
        
        if not salon:
            raise ValidationError({
                "detail": "Aucun salon sélectionné. Veuillez sélectionner un salon dans le dashboard avant de créer un employé."
            })
        
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


class EmployeeUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour la mise à jour des employés"""
    
    # Données modifiables de l'utilisateur
    email = serializers.EmailField(source='user.email')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    phone = serializers.CharField(source='user.phone', required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, source='user.role', required=False)
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    
    class Meta:
        model = Employee
        fields = [
            'email', 'first_name', 'last_name', 'phone', 'role',
            'specialties', 'bio', 'photo', 'is_available', 'work_schedule',
            'password'
        ]
    
    def validate_phone(self, value):
        """Valide et normalise le format du numéro de téléphone gabonais"""
        if value:  # Seulement si le numéro est fourni
            validate_gabon_phone(value)
            return normalize_gabon_phone(value)
        return value
        
    def update(self, instance, validated_data):
        """Met à jour l'employé et son utilisateur associé"""
        # Extraction du mot de passe avant de passer les données à user_data
        password = validated_data.pop('password', None)
        
        # Mise à jour de l'utilisateur
        user_data = validated_data.pop('user', {})
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            
            # Mise à jour du mot de passe si fourni
            if password:
                user.set_password(password)
                
            user.save()
            
        # Si le mot de passe est fourni mais pas d'autres données utilisateur
        elif password:
            instance.user.set_password(password)
            instance.user.save()
            
        # Mise à jour de l'employé (champs restants)
        return super().update(instance, validated_data)
