"""
Custom User Model
Utilisateur lié à un salon avec rôle
"""
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from apps.core.models import Salon


class UserManager(BaseUserManager):
    """Manager personnalisé pour le modèle User"""
    
    def create_user(self, email, password=None, **extra_fields):
        """Crée et sauvegarde un utilisateur normal"""
        if not email:
            raise ValueError("L'email est obligatoire")
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Crée et sauvegarde un superutilisateur"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Modèle utilisateur personnalisé.
    Chaque utilisateur est rattaché à un salon.
    """
    
    ROLE_CHOICES = [
        ('ADMIN', 'Administrateur'),
        ('COIFFEUR', 'Coiffeur'),
        ('RECEPTIONNISTE', 'Réceptionniste'),
    ]
    
    # Informations de base
    email = models.EmailField('Email', unique=True)
    first_name = models.CharField('Prénom', max_length=150)
    last_name = models.CharField('Nom', max_length=150)
    phone = models.CharField('Téléphone', max_length=20, blank=True)
    
    # Lien avec le salon (tenant)
    salon = models.ForeignKey(
        Salon,
        on_delete=models.CASCADE,
        related_name='users',
        verbose_name='Salon',
        null=True,  # Null only for superusers
        blank=True
    )
    
    # Rôle dans le salon
    role = models.CharField(
        'Rôle',
        max_length=20,
        choices=ROLE_CHOICES,
        default='RECEPTIONNISTE'
    )
    
    # Permissions Django
    is_active = models.BooleanField('Actif', default=True)
    is_staff = models.BooleanField('Staff', default=False)
    
    # Dates
    date_joined = models.DateTimeField('Date d\'inscription', auto_now_add=True)
    last_login = models.DateTimeField('Dernière connexion', null=True, blank=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering = ['-date_joined']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    def get_full_name(self):
        """Retourne le nom complet"""
        return f"{self.first_name} {self.last_name}"
    
    def get_short_name(self):
        """Retourne le prénom"""
        return self.first_name
