from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'get_client_name', 'amount', 'payment_method', 'status',
        'payment_date', 'salon', 'created_at'
    ]
    list_filter = ['status', 'payment_method', 'salon', 'payment_date']
    search_fields = [
        'client__first_name', 'client__last_name',
        'transaction_id', 'notes'
    ]
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'payment_date'
    
    fieldsets = (
        ('Paiement', {
            'fields': ('salon', 'appointment', 'client', 'amount')
        }),
        ('Méthode et statut', {
            'fields': ('payment_method', 'status', 'payment_date')
        }),
        ('Informations additionnelles', {
            'fields': ('transaction_id', 'notes')
        }),
        ('Dates système', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def get_client_name(self, obj):
        return obj.client.get_full_name()
    get_client_name.short_description = 'Client'
