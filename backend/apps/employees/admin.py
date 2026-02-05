from django.contrib import admin
from .models import Employee


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['get_full_name', 'get_role', 'salon', 'is_available', 'created_at']
    list_filter = ['is_available', 'salon', 'user__role']
    search_fields = ['user__first_name', 'user__last_name', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Utilisateur', {
            'fields': ('user', 'salon')
        }),
        ('Informations professionnelles', {
            'fields': ('specialties', 'bio', 'photo')
        }),
        ('Disponibilité', {
            'fields': ('is_available', 'work_schedule')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    get_full_name.short_description = 'Nom complet'
    
    def get_role(self, obj):
        return obj.user.get_role_display()
    get_role.short_description = 'Rôle'
