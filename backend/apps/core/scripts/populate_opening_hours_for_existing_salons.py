from apps.core.models import Salon
from apps.core.models_openinghours import SalonOpeningHour, DayOfWeek
from datetime import time

def get_default_hours():
    return time(8, 0), time(18, 0)

def populate_opening_hours():
    count = 0
    for salon in Salon.objects.all():
        for day in DayOfWeek:
            obj, created = SalonOpeningHour.objects.get_or_create(
                salon=salon,
                day_of_week=day.value,
                defaults={
                    'open_time': get_default_hours()[0],
                    'close_time': get_default_hours()[1],
                    'is_closed': False,
                }
            )
            if created:
                count += 1
    print(f"Horaires créés pour {count} jours manquants.")

if __name__ == "__main__":
    populate_opening_hours()
