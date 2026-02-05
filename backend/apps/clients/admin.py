from django.contrib import admin
from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'phone', 'salon', 'is_active', 'created_at']
    list_filter = ['is_active', 'salon', 'created_at']
    search_fields = ['first_name', 'last_name', 'phone', 'email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informations personnelles', {
            'fields': ('first_name', 'last_name', 'phone', 'email')
        }),
        ('Salon', {
            'fields': ('salon',)
        }),
        ('Préférences', {
            'fields': ('preferred_employee', 'notes')
        }),
        ('Statut', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )
