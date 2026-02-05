from django.contrib import admin
from .models import Salon


@admin.register(Salon)
class SalonAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'email', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'email', 'phone']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('name', 'address', 'phone', 'email')
        }),
        ('Configuration', {
            'fields': ('opening_hours', 'currency', 'timezone')
        }),
        ('Personnalisation', {
            'fields': ('logo', 'primary_color')
        }),
        ('Statut', {
            'fields': ('is_active', 'created_at')
        }),
    )
