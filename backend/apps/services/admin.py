from django.contrib import admin
from .models import ServiceCategory, Service, ServiceImage


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'salon', 'created_at']
    list_filter = ['salon', 'created_at']
    search_fields = ['name']


class ServiceImageInline(admin.TabularInline):
    """Interface inline pour gérer les images de service"""
    model = ServiceImage
    extra = 1
    fields = ['image', 'alt_text', 'is_primary', 'order']
    readonly_fields = ['created_at']
    
    class Media:
        css = {
            'all': ('admin/css/service_images.css',)
        }


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'duration', 'images_count', 'is_active', 'salon', 'created_at']
    list_filter = ['is_active', 'category', 'salon', 'target', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [ServiceImageInline]
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('name', 'description', 'category', 'target', 'salon')
        }),
        ('Tarification et durée', {
            'fields': ('price', 'duration')
        }),
        ('Image principale (optionnelle)', {
            'fields': ('image',),
            'description': 'Image principale pour compatibilité. Utilisez la galerie ci-dessous pour ajouter plusieurs images.'
        }),
        ('Statut', {
            'fields': ('is_active', 'is_published', 'created_at', 'updated_at')
        }),
    )
    
    def images_count(self, obj):
        """Affiche le nombre d'images dans la galerie"""
        count = obj.images.count()
        return f"{count} image{'s' if count > 1 else ''}"
    images_count.short_description = 'Images'


@admin.register(ServiceImage)
class ServiceImageAdmin(admin.ModelAdmin):
    list_display = ['service', 'alt_text', 'is_primary', 'order', 'salon', 'created_at']
    list_filter = ['is_primary', 'salon', 'created_at']
    search_fields = ['service__name', 'alt_text']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Image', {
            'fields': ('service', 'image', 'alt_text')
        }),
        ('Paramètres', {
            'fields': ('is_primary', 'order', 'salon')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at')
        }),
    )
