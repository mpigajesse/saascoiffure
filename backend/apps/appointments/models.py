"""
Models for Appointments app
"""
from django.db import models
from apps.core.models import TenantAwareModel
from apps.core.managers import TenantManager


class Appointment(TenantAwareModel):
    """
    Rendez-vous dans un salon.
    Lie un client, un employé, un service et un créneau horaire.
    """
    
    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('CONFIRMED', 'Confirmé'),
        ('IN_PROGRESS', 'En cours'),
        ('COMPLETED', 'Terminé'),
        ('CANCELLED', 'Annulé'),
        ('NO_SHOW', 'Absence'),
    ]
    
    # Relations
    client = models.ForeignKey(
        'clients.Client',
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Client'
    )
    
    employee = models.ForeignKey(
        'employees.Employee',
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Employé'
    )
    
    service = models.ForeignKey(
        'services.Service',
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Service'
    )
    
    # Date et heure
    date = models.DateField('Date du rendez-vous')
    time = models.TimeField('Heure du rendez-vous')
    
    # Durée (héritée du service par défaut, mais peut être modifiée)
    duration = models.PositiveIntegerField(
        'Durée (minutes)',
        help_text='Durée estimée du rendez-vous'
    )
    
    # Statut
    status = models.CharField(
        'Statut',
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    
    # Notes
    notes = models.TextField('Notes', blank=True)
    
    # Mode de paiement prévu
    payment_method = models.CharField(
        'Mode de paiement',
        max_length=50,
        blank=True,
        help_text='Espèces, Mobile Money, etc.'
    )
    
    objects = TenantManager()
    
    class Meta:
        db_table = 'appointments'
        verbose_name = 'Rendez-vous'
        verbose_name_plural = 'Rendez-vous'
        ordering = ['-date', '-time']
        indexes = [
            models.Index(fields=['salon', 'date', 'status']),
            models.Index(fields=['salon', 'employee', 'date']),
            models.Index(fields=['salon', 'client']),
        ]
    
    def __str__(self):
        return f"{self.client.get_full_name()} - {self.service.name} - {self.date} {self.time}"
    
    def save(self, *args, **kwargs):
        """
        Validation : 
        - Client, Employee et Service doivent appartenir au même salon
        """
        if self.client.salon != self.salon:
            raise ValueError("Le client doit appartenir au même salon")
        if self.employee.salon != self.salon:
            raise ValueError("L'employé doit appartenir au même salon")
        if self.service.salon != self.salon:
            raise ValueError("Le service doit appartenir au même salon")
        
        # Définir la durée du service si non spécifiée
        if not self.duration:
            self.duration = self.service.duration
        
        super().save(*args, **kwargs)
