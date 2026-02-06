"""
Modèle pour les permissions personnalisées des employés
Permet à l'admin de définir des permissions spécifiques pour chaque employé
"""
from django.db import models
from apps.employees.models import Employee


class EmployeePermission(models.Model):
    """
    Permissions personnalisées pour un employé.
    Permet de surcharger les permissions par défaut du rôle.
    """
    
    employee = models.OneToOneField(
        Employee,
        on_delete=models.CASCADE,
        related_name='custom_permissions'
    )
    
    # Permissions sur les rendez-vous
    can_create_appointments = models.BooleanField(default=None, null=True, blank=True)
    can_view_all_appointments = models.BooleanField(default=None, null=True, blank=True)
    can_confirm_appointments = models.BooleanField(default=None, null=True, blank=True)
    can_start_appointments = models.BooleanField(default=None, null=True, blank=True)
    can_complete_appointments = models.BooleanField(default=None, null=True, blank=True)
    can_cancel_appointments = models.BooleanField(default=None, null=True, blank=True)
    can_reschedule_appointments = models.BooleanField(default=None, null=True, blank=True)
    can_move_appointments = models.BooleanField(default=None, null=True, blank=True)
    can_delete_appointments = models.BooleanField(default=None, null=True, blank=True)
    can_edit_appointments = models.BooleanField(default=None, null=True, blank=True)  # NOUVEAU
    can_export_appointments = models.BooleanField(default=None, null=True, blank=True)  # NOUVEAU
    
    # Permissions sur les clients
    can_create_clients = models.BooleanField(default=None, null=True, blank=True)
    can_view_clients = models.BooleanField(default=None, null=True, blank=True)
    can_edit_clients = models.BooleanField(default=None, null=True, blank=True)
    can_delete_clients = models.BooleanField(default=None, null=True, blank=True)
    can_export_clients = models.BooleanField(default=None, null=True, blank=True)  # NOUVEAU
    can_send_client_messages = models.BooleanField(default=None, null=True, blank=True)  # NOUVEAU
    
    # Permissions sur les services
    can_create_services = models.BooleanField(default=None, null=True, blank=True)
    can_view_services = models.BooleanField(default=None, null=True, blank=True)
    can_edit_services = models.BooleanField(default=None, null=True, blank=True)
    can_delete_services = models.BooleanField(default=None, null=True, blank=True)
    
    # Permissions sur les paiements
    can_view_payments = models.BooleanField(default=None, null=True, blank=True)
    can_create_payments = models.BooleanField(default=None, null=True, blank=True)
    can_refund_payments = models.BooleanField(default=None, null=True, blank=True)  # NOUVEAU
    can_view_payment_reports = models.BooleanField(default=None, null=True, blank=True)  # NOUVEAU
    can_export_payments = models.BooleanField(default=None, null=True, blank=True)  # NOUVEAU
    
    # Permissions sur les employés
    can_view_employees = models.BooleanField(default=None, null=True, blank=True)
    can_create_employees = models.BooleanField(default=None, null=True, blank=True)
    can_edit_employees = models.BooleanField(default=None, null=True, blank=True)
    can_delete_employees = models.BooleanField(default=None, null=True, blank=True)
    can_manage_employee_permissions = models.BooleanField(default=None, null=True, blank=True)  # NOUVEAU
    can_edit_employee_schedule = models.BooleanField(default=None, null=True, blank=True)  # NOUVEAU
    
    # Permissions sur les paramètres
    can_edit_salon_settings = models.BooleanField(default=None, null=True, blank=True)  # Déprécié
    can_edit_salon_info = models.BooleanField(default=None, null=True, blank=True)  # NOUVEAU
    can_edit_salon_hours = models.BooleanField(default=None, null=True, blank=True)  # NOUVEAU

    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'employee_permissions'
        verbose_name = 'Permission Employé'
        verbose_name_plural = 'Permissions Employés'
    
    def __str__(self):
        return f"Permissions de {self.employee.get_full_name()}"
    
    def get_permission(self, permission_name):
        """
        Retourne la valeur d'une permission.
        Si None, utilise la permission par défaut du rôle.
        """
        value = getattr(self, permission_name, None)
        if value is not None:
            return value
        
        # Retourner les permissions par défaut selon le rôle
        role = self.employee.role
        return self._get_default_permission(role, permission_name)
    
    def _get_default_permission(self, role, permission_name):
        """Retourne la permission par défaut selon le rôle"""
        # ADMIN a toutes les permissions
        if role == 'ADMIN':
            return True
        
        # RECEPTIONNISTE
        if role == 'RECEPTIONNISTE':
            receptionniste_permissions = {
                'can_create_appointments': True,
                'can_view_all_appointments': True,
                'can_confirm_appointments': True,
                'can_start_appointments': False,
                'can_complete_appointments': False,
                'can_cancel_appointments': True,
                'can_reschedule_appointments': True,
                'can_move_appointments': True,
                'can_delete_appointments': False,
                'can_create_clients': True,
                'can_view_clients': True,
                'can_edit_clients': True,
                'can_delete_clients': False,
                'can_view_services': True,
                'can_view_payments': True,
                'can_create_payments': True,
                'can_view_employees': True,
            }
            return receptionniste_permissions.get(permission_name, False)
        
        # COIFFEUR
        if role == 'COIFFEUR':
            coiffeur_permissions = {
                'can_view_all_appointments': True,
                'can_confirm_appointments': True,
                'can_start_appointments': True,
                'can_complete_appointments': True,
                'can_view_clients': True,
                'can_view_services': True,
                'can_view_payments': True,
                'can_view_employees': True,
            }
            return coiffeur_permissions.get(permission_name, False)
        
        return False
