from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = [
        'get_client_name', 'get_employee_name', 'get_service_name',
        'date', 'time', 'status', 'salon', 'created_at'
    ]
    list_filter = ['status', 'date', 'salon', 'created_at']
    search_fields = [
        'client__first_name', 'client__last_name',
        'employee__user__first_name', 'employee__user__last_name',
        'service__name'
    ]
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Rendez-vous', {
            'fields': ('salon', 'client', 'employee', 'service')
        }),
        ('Date et heure', {
            'fields': ('date', 'time', 'duration')
        }),
        ('Statut et notes', {
            'fields': ('status', 'notes', 'payment_method')
        }),
        ('Dates système', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def get_client_name(self, obj):
        return obj.client.get_full_name()
    get_client_name.short_description = 'Client'
    
    def get_employee_name(self, obj):
        return obj.employee.get_full_name()
    get_employee_name.short_description = 'Employé'
    
    def get_service_name(self, obj):
        return obj.service.name
    get_service_name.short_description = 'Service'
