"""
Models for Payments app
"""
from django.db import models
from apps.core.models import TenantAwareModel
from apps.core.managers import TenantManager


class Payment(TenantAwareModel):
    """
    Paiement effectué pour un rendez-vous.
    Enregistre toutes les transactions financières du salon.
    """
    
    PAYMENT_METHOD_CHOICES = [
        ('CASH', 'Espèces'),
        ('MOBILE_MONEY', 'Mobile Money'),
        ('BANK_CARD', 'Carte bancaire'),
        ('BANK_TRANSFER', 'Virement bancaire'),
        ('OTHER', 'Autre'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('COMPLETED', 'Complété'),
        ('FAILED', 'Échoué'),
        ('REFUNDED', 'Remboursé'),
    ]
    
    # Lien avec le rendez-vous
    appointment = models.ForeignKey(
        'appointments.Appointment',
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name='Rendez-vous'
    )
    
    # Client
    client = models.ForeignKey(
        'clients.Client',
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name='Client'
    )
    
    # Montant
    amount = models.DecimalField(
        'Montant',
        max_digits=10,
        decimal_places=2
    )
    
    # Méthode de paiement
    payment_method = models.CharField(
        'Méthode de paiement',
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='CASH'
    )
    
    # Statut
    status = models.CharField(
        'Statut',
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    
    # Dates
    payment_date = models.DateTimeField('Date de paiement', null=True, blank=True)
    
    # Informations additionnelles
    transaction_id = models.CharField(
        'ID Transaction',
        max_length=100,
        blank=True,
        help_text='Numéro de transaction pour Mobile Money, etc.'
    )
    
    notes = models.TextField('Notes', blank=True)
    
    objects = TenantManager()
    
    class Meta:
        db_table = 'payments'
        verbose_name = 'Paiement'
        verbose_name_plural = 'Paiements'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['salon', 'status']),
            models.Index(fields=['salon', 'payment_date']),
            models.Index(fields=['salon', 'client']),
        ]
    
    def __str__(self):
        return f"{self.client.get_full_name()} - {self.amount} - {self.get_payment_method_display()}"
    
    def save(self, *args, **kwargs):
        """
        Validation : 
        - Client et Appointment doivent appartenir au même salon
        """
        if self.client.salon != self.salon:
            raise ValueError("Le client doit appartenir au même salon")
        if self.appointment.salon != self.salon:
            raise ValueError("Le rendez-vous doit appartenir au même salon")
        
        super().save(*args, **kwargs)
