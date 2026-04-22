"""
Serializers pour les permissions des employés
"""
from rest_framework import serializers
from .permissions_model import EmployeePermission


class EmployeePermissionSerializer(serializers.ModelSerializer):
    """Serializer pour les permissions personnalisées d'un employé"""
    
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    employee_role = serializers.CharField(source='employee.role', read_only=True)
    
    class Meta:
        model = EmployeePermission
        fields = [
            'id', 'employee', 'employee_name', 'employee_role',
            # Permissions rendez-vous
            'can_create_appointments', 'can_view_all_appointments',
            'can_confirm_appointments', 'can_start_appointments',
            'can_complete_appointments', 'can_cancel_appointments',
            'can_reschedule_appointments', 'can_move_appointments',
            'can_delete_appointments', 'can_edit_appointments', 'can_export_appointments',
            # Permissions clients
            'can_create_clients', 'can_view_clients',
            'can_edit_clients', 'can_delete_clients',
            'can_export_clients', 'can_send_client_messages',
            # Permissions services
            'can_create_services', 'can_view_services',
            'can_edit_services', 'can_delete_services',
            # Permissions paiements
            'can_view_payments', 'can_create_payments',
            'can_refund_payments', 'can_view_payment_reports', 'can_export_payments',
            # Permissions employés
            'can_view_employees', 'can_create_employees',
            'can_edit_employees', 'can_delete_employees',
            'can_manage_employee_permissions', 'can_edit_employee_schedule',
            # Permissions paramètres
            'can_edit_salon_settings', 'can_edit_salon_info', 'can_edit_salon_hours',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EmployeePermissionUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour la mise à jour des permissions"""
    
    class Meta:
        model = EmployeePermission
        fields = [
            # Permissions rendez-vous
            'can_create_appointments', 'can_view_all_appointments',
            'can_confirm_appointments', 'can_start_appointments',
            'can_complete_appointments', 'can_cancel_appointments',
            'can_reschedule_appointments', 'can_move_appointments',
            'can_delete_appointments', 'can_edit_appointments', 'can_export_appointments',
            # Permissions clients
            'can_create_clients', 'can_view_clients',
            'can_edit_clients', 'can_delete_clients',
            'can_export_clients', 'can_send_client_messages',
            # Permissions services
            'can_create_services', 'can_view_services',
            'can_edit_services', 'can_delete_services',
            # Permissions paiements
            'can_view_payments', 'can_create_payments',
            'can_refund_payments', 'can_view_payment_reports', 'can_export_payments',
            # Permissions employés
            'can_view_employees', 'can_create_employees',
            'can_edit_employees', 'can_delete_employees',
            'can_manage_employee_permissions', 'can_edit_employee_schedule',
            # Permissions paramètres
            'can_edit_salon_settings', 'can_edit_salon_info', 'can_edit_salon_hours',
        ]
