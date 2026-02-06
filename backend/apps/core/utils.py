import re
from datetime import time

def parse_opening_hours(opening_hours_str):
    """
    Parse l'attribut opening_hours d'un salon (ex: '8h00 - 18h00')
    Retourne (heure_ouverture, heure_fermeture) en objets time
    """
    # Exemples acceptés : '8h00 - 18h00', '09:00-20:00', '8:30 - 19:15', etc.
    match = re.match(r"(\d{1,2})[:h](\d{2})?\s*-\s*(\d{1,2})[:h](\d{2})?", opening_hours_str)
    if not match:
        # fallback défaut 8h-18h
        return time(8, 0), time(18, 0)
    h1, m1, h2, m2 = match.group(1), match.group(2), match.group(3), match.group(4)
    h1, h2 = int(h1), int(h2)
    m1 = int(m1) if m1 else 0
    m2 = int(m2) if m2 else 0
    return time(h1, m1), time(h2, m2)
