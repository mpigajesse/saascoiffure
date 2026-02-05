"""
Models for Clients app
"""
from django.db import models
from apps.core.models import TenantAwareModel
from apps.core.managers import TenantManager


class Client(TenantAwareModel):
    """
    Client d'un salon de coiffure.
    Chaque client est lié à un salon unique.
    """
    first_name = models.CharField('Prénom', max_length=100)
    last_name = models.CharField('Nom', max_length=100)
    phone = models.CharField('Téléphone', max_length=20)
    email = models.EmailField('Email', null=True, blank=True)
    
    # Préférences
    preferred_employee = models.ForeignKey(
        'employees.Employee',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='preferred_by_clients',
        verbose_name='Coiffeur préféré'
    )
    
    notes = models.TextField('Notes', blank=True, help_text='Notes internes sur le client')
    
    # Status
    is_active = models.BooleanField('Actif', default=True)
    
    objects = TenantManager()
    
    class Meta:
        db_table = 'clients'
        verbose_name = 'Client'
        verbose_name_plural = 'Clients'
        ordering = ['last_name', 'first_name']
        indexes = [
            models.Index(fields=['salon', 'phone']),
            models.Index(fields=['salon', 'last_name']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    def get_full_name(self):
        """Retourne le nom complet"""
        return f"{self.first_name} {self.last_name}"
