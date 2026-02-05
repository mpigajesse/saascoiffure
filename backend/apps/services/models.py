"""
Models for Services app
"""
from django.db import models
from apps.core.models import TenantAwareModel
from apps.core.managers import TenantManager


class ServiceCategory(TenantAwareModel):
    """Catégorie de services (Coupe, Coiffure, Coloration, etc.)"""
    
    name = models.CharField('Nom', max_length=100)
    description = models.TextField('Description', blank=True)
    
    objects = TenantManager()
    
    class Meta:
        db_table = 'service_categories'
        verbose_name = 'Catégorie de service'
        verbose_name_plural = 'Catégories de services'
        ordering = ['name']
        unique_together = ['salon', 'name']
    
    def __str__(self):
        return self.name


class Service(TenantAwareModel):
    """
    Service/Prestation offert par le salon.
    Chaque salon définit ses propres services et tarifs.
    """
    
    # Choix pour la cible du service
    TARGET_CHOICES = [
        ('homme', 'Homme'),
        ('femme', 'Femme'),
        ('enfant_fille', 'Enfant (Fille)'),
        ('enfant_garcon', 'Enfant (Garçon)'),
      
    ]
    
    name = models.CharField('Nom du service', max_length=200)
    description = models.TextField('Description', blank=True)
    
    # Catégorie
    category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='services',
        verbose_name='Catégorie'
    )
    
    # Cible du service (homme, femme, enfant, etc.)
    target = models.CharField(
        'Cible',
        max_length=20,
        choices=TARGET_CHOICES,
        default='femme',
        help_text='À qui ce service est-il destiné ?'
    )
    
    # Tarification
    price = models.DecimalField(
        'Prix',
        max_digits=10,
        decimal_places=2,
        help_text='Prix en devise locale'
    )
    
    # Durée estimée (en minutes)
    duration = models.PositiveIntegerField(
        'Durée (minutes)',
        default=30,
        help_text='Durée estimée du service'
    )
    
    # Image du service
    image = models.ImageField(
        'Image',
        upload_to='services/images/',
        null=True,
        blank=True
    )
    
    # Disponibilité
    is_active = models.BooleanField('Actif', default=True)
    
    # Publication sur le site public
    is_published = models.BooleanField(
        'Publié sur le site',
        default=False,
        help_text='Visible sur le site public de réservation'
    )
    
    objects = TenantManager()
    
    class Meta:
        db_table = 'services'
        verbose_name = 'Service'
        verbose_name_plural = 'Services'
        ordering = ['category', 'name']
        indexes = [
            models.Index(fields=['salon', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.price}"
    
    def get_duration_display(self):
        """Affichage formaté de la durée"""
        hours = self.duration // 60
        minutes = self.duration % 60
        
        if hours > 0:
            return f"{hours}h{minutes:02d}" if minutes > 0 else f"{hours}h"
        return f"{minutes} min"
