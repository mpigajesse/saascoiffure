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
    
    # Image principale du service (conservée pour compatibilité)
    image = models.ImageField(
        'Image principale',
        upload_to='services/images/',
        null=True,
        blank=True,
        help_text='Image principale affichée dans les listes'
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
    
    @property
    def main_image_url(self):
        """URL de l'image principale"""
        if self.image:
            return self.image.url
        # Fallback sur la première image de la galerie
        first_image = self.images.filter(is_primary=True).first()
        if not first_image:
            first_image = self.images.first()
        return first_image.image.url if first_image else None
    
    @property
    def gallery_images(self):
        """Toutes les images de la galerie"""
        return self.images.all().order_by('order', 'id')


class ServiceImage(TenantAwareModel):
    """
    Images multiples pour chaque service.
    Permet d'avoir une galerie d'images pour chaque coiffure.
    """
    
    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name='Service'
    )
    
    image = models.ImageField(
        'Image',
        upload_to='services/gallery/',
        help_text='Images de la galerie du service'
    )
    
    alt_text = models.CharField(
        'Texte alternatif',
        max_length=255,
        blank=True,
        help_text='Description de l\'image pour l\'accessibilité'
    )
    
    is_primary = models.BooleanField(
        'Image principale',
        default=False,
        help_text='Utilisée comme image de couverture'
    )
    
    order = models.PositiveIntegerField(
        'Ordre d\'affichage',
        default=0,
        help_text='Ordre d\'affichage dans la galerie'
    )
    
    objects = TenantManager()
    
    class Meta:
        db_table = 'service_images'
        verbose_name = 'Image de service'
        verbose_name_plural = 'Images de services'
        ordering = ['service', 'order', 'id']
        indexes = [
            models.Index(fields=['salon', 'service']),
            models.Index(fields=['service', 'is_primary']),
        ]
    
    def __str__(self):
        primary_text = " (Principale)" if self.is_primary else ""
        return f"{self.service.name} - Image {self.order}{primary_text}"
    
    def save(self, *args, **kwargs):
        # Si c'est marqué comme image principale, démarquer les autres
        if self.is_primary:
            ServiceImage.objects.filter(
                salon=self.salon,
                service=self.service,
                is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        
        # Auto-générer le texte alternatif si vide
        if not self.alt_text:
            self.alt_text = f"{self.service.name} - Vue {self.order or 'supplémentaire'}"
            
        super().save(*args, **kwargs)
