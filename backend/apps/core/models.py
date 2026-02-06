"""
Models for Core app - Multi-tenant foundation
"""
from django.db import models
from django.utils.text import slugify


class Salon(models.Model):
    """
    Représente un salon de coiffure (tenant).
    Chaque salon est un client indépendant avec ses propres données.
    """
    name = models.CharField('Nom du salon', max_length=200)
    slug = models.SlugField('Slug URL', max_length=200, unique=True, blank=True)
    address = models.TextField('Adresse complète')
    phone = models.CharField('Téléphone', max_length=20)
    email = models.EmailField('Email')
    
    # Configuration
    opening_hours = models.CharField('Horaires', max_length=100, default='8h00 - 18h00')
    currency = models.CharField('Devise', max_length=3, default='XAF')
    timezone = models.CharField('Fuseau horaire', max_length=50, default='Africa/Libreville')
    
    # Personnalisation
    logo = models.ImageField('Logo', upload_to='salons/logos/', null=True, blank=True)
    primary_color = models.CharField('Couleur principale', max_length=7, default='#8b5a3c')
    
    # Status
    is_active = models.BooleanField('Actif', default=True)
    created_at = models.DateTimeField('Date de création', auto_now_add=True)
    updated_at = models.DateTimeField('Dernière modification', auto_now=True)
    
    class Meta:
        db_table = 'salons'
        verbose_name = 'Salon'
        verbose_name_plural = 'Salons'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        """Auto-génère le slug à partir du nom si non fourni"""
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Salon.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)


class TenantAwareModel(models.Model):
    """
    Modèle abstrait de base pour tous les modèles métier.
    Garantit que chaque donnée est rattachée à un salon (tenant).
    RÈGLE ABSOLUE : Tout modèle métier DOIT hériter de cette classe.
    """
    salon = models.ForeignKey(
        Salon,
        on_delete=models.CASCADE,
        related_name='%(class)s_set',
        verbose_name='Salon'
    )
    created_at = models.DateTimeField('Date de création', auto_now_add=True)
    updated_at = models.DateTimeField('Dernière modification', auto_now=True)
    
    class Meta:
        abstract = True
    
    def save(self, *args, **kwargs):
        """
        Validation stricte : un objet ne peut pas être sauvegardé sans salon.
        Cette règle garantit l'isolation des données multi-tenant.
        """
        if not self.salon_id:
            raise ValueError(
                f"Impossible de sauvegarder {self.__class__.__name__} sans salon. "
                "Violation de la règle multi-tenant."
            )
        super().save(*args, **kwargs)
