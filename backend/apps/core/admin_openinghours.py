from django.contrib import admin
from .models_openinghours import SalonOpeningHour

@admin.register(SalonOpeningHour)
class SalonOpeningHourAdmin(admin.ModelAdmin):
    list_display = ('salon', 'day_of_week', 'open_time', 'close_time', 'is_closed')
    list_filter = ('salon', 'day_of_week', 'is_closed')
    ordering = ('salon', 'day_of_week')
