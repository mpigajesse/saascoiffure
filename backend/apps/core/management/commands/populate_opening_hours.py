from django.core.management.base import BaseCommand
from apps.core.models import Salon
from apps.core.models_openinghours import SalonOpeningHour, DayOfWeek
from datetime import time

class Command(BaseCommand):
    help = 'Crée les horaires d\'ouverture par défaut pour tous les salons existants (si manquants)'

    def handle(self, *args, **options):
        count = 0
        for salon in Salon.objects.all():
            for day in DayOfWeek:
                obj, created = SalonOpeningHour.objects.get_or_create(
                    salon=salon,
                    day_of_week=day.value,
                    defaults={
                        'open_time': time(8, 0),
                        'close_time': time(18, 0),
                        'is_closed': False,
                    }
                )
                if created:
                    count += 1
        self.stdout.write(self.style.SUCCESS(f"Horaires créés pour {count} jours manquants."))
