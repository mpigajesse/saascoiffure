from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Salon
from .models_openinghours import SalonOpeningHour, DayOfWeek
from datetime import time

def get_default_hours():
    return time(8, 0), time(18, 0)

@receiver(post_save, sender=Salon)
def create_default_opening_hours(sender, instance, created, **kwargs):
    if created:
        for day in DayOfWeek:
            SalonOpeningHour.objects.get_or_create(
                salon=instance,
                day_of_week=day.value,
                defaults={
                    'open_time': get_default_hours()[0],
                    'close_time': get_default_hours()[1],
                    'is_closed': False,
                }
            )
