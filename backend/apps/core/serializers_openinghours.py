from rest_framework import serializers
from .models_openinghours import SalonOpeningHour, DayOfWeek

class SalonOpeningHourSerializer(serializers.ModelSerializer):
    day_of_week_display = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = SalonOpeningHour
        fields = [
            'id', 'salon', 'day_of_week', 'day_of_week_display',
            'open_time', 'close_time', 'is_closed'
        ]
        read_only_fields = ['id']
