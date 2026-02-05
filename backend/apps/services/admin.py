from django.contrib import admin
from .models import ServiceCategory, Service


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'salon', 'created_at']
    list_filter = ['salon', 'created_at']
    search_fields = ['name']


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'duration', 'is_active', 'salon', 'created_at']
    list_filter = ['is_active', 'category', 'salon', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('name', 'description', 'category', 'salon')
        }),
        ('Tarification et durée', {
            'fields': ('price', 'duration')
        }),
        ('Media', {
            'fields': ('image',)
        }),
        ('Statut', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )
