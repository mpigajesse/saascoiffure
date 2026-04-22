from django.db import models
from django.utils.translation import gettext_lazy as _

class DayOfWeek(models.IntegerChoices):
    MONDAY = 0, _('Lundi')
    TUESDAY = 1, _('Mardi')
    WEDNESDAY = 2, _('Mercredi')
    THURSDAY = 3, _('Jeudi')
    FRIDAY = 4, _('Vendredi')
    SATURDAY = 5, _('Samedi')
    SUNDAY = 6, _('Dimanche')

class SalonOpeningHour(models.Model):
    salon = models.ForeignKey('core.Salon', on_delete=models.CASCADE, related_name='opening_hours_set')
    day_of_week = models.IntegerField(choices=DayOfWeek.choices)
    open_time = models.TimeField()
    close_time = models.TimeField()
    is_closed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('salon', 'day_of_week')
        ordering = ['salon', 'day_of_week']
        verbose_name = 'Horaire d\'ouverture (jour)'
        verbose_name_plural = 'Horaires d\'ouverture (par jour)'

    def __str__(self):
        if self.is_closed:
            return f"{self.get_day_of_week_display()}: fermé"
        return f"{self.get_day_of_week_display()}: {self.open_time.strftime('%H:%M')} - {self.close_time.strftime('%H:%M')}"