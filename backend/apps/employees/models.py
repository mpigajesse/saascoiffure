"""
Models for Employees app
"""
from django.db import models
from django.contrib.auth import get_user_model
from apps.core.models import TenantAwareModel
from apps.core.managers import TenantManager

User = get_user_model()


class Employee(TenantAwareModel):
    """
    Employé d'un salon (coiffeur, réceptionniste, etc.)
    Lié à un utilisateur (User) et au salon.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='employee_profile',
        verbose_name='Utilisateur'
    )
    
    # Informations professionnelles
    specialties = models.TextField(
        'Spécialités',
        blank=True,
        help_text='Séparées par des virgules'
    )
    
    bio = models.TextField('Biographie', blank=True)
    
    # Photo de profil
    photo = models.ImageField(
        'Photo',
        upload_to='employees/photos/',
        null=True,
        blank=True
    )
    
    # Disponibilité
    is_available = models.BooleanField('Disponible', default=True)
    
    # Planning de travail (JSON ou TextField)
    # Format: {"lundi": "9:00-18:00", "mardi": "9:00-18:00", ...}
    work_schedule = models.JSONField(
        'Planning de travail',
        default=dict,
        blank=True
    )
    
    objects = TenantManager()
    
    class Meta:
        db_table = 'employees'
        verbose_name = 'Employé'
        verbose_name_plural = 'Employés'
        ordering = ['user__first_name', 'user__last_name']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.user.role}"
    
    def get_full_name(self):
        """Retourne le nom complet"""
        return self.user.get_full_name()
    
    def get_specialties_list(self):
        """Retourne la liste des spécialités"""
        if self.specialties:
            return [s.strip() for s in self.specialties.split(',')]
        return []


# Import du modèle de permissions personnalisées
from .permissions_model import EmployeePermission
