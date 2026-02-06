from datetime import time, datetime
from .models_openinghours import SalonOpeningHour, DayOfWeek
from apps.employees.models import Employee # Import Employee model

def get_day_name_in_french(day_index):
    """
    Returns the French name of the day of the week from an integer (0=Monday).
    """
    days = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
    return days[day_index]

def get_opening_hours_for_day(salon, date):
    """
    Retourne (heure_ouverture, heure_fermeture, is_closed) pour un salon et une date donnée.
    Si non défini, fallback sur 8h-18h.
    """
    dow = date.weekday()  # 0 = lundi
    try:
        oh = SalonOpeningHour.objects.get(salon=salon, day_of_week=dow)
        if oh.is_closed:
            return None, None, True
        return oh.open_time, oh.close_time, False
    except SalonOpeningHour.DoesNotExist:
        # Fallback to default opening hours if not specifically configured
        return time(8, 0), time(18, 0), False

def get_employee_working_hours_for_day(employee: Employee, date):
    """
    Retourne (heure_début, heure_fin, is_off_day) pour un employé et une date donnée.
    """
    day_name = get_day_name_in_french(date.weekday())
    schedule_str = employee.work_schedule.get(day_name)

    if not schedule_str: 
        # Si pas d'horaire spécifique pour l'employé ce jour-là,
        # on se base sur les horaires d'ouverture du salon
        return get_opening_hours_for_day(employee.salon, date)

    try:
        start_str, end_str = schedule_str.split('-')
        start_time = datetime.strptime(start_str.strip(), '%H:%M').time()
        end_time = datetime.strptime(end_str.strip(), '%H:%M').time()
        return start_time, end_time, False
    except ValueError:
        # Malformed schedule string, treat as off day
        return None, None, True