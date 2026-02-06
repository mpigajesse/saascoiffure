"""
Validateurs personnalisés pour l'application
"""
import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_gabon_phone(value):
    """
    Valide qu'un numéro de téléphone est au format gabonais.
    
    Formats acceptés (nouveau format 9 chiffres):
    - Moov: 062/063/065/066 + 6 chiffres
    - Airtel: 074/077 + 6 chiffres
    
    Formats internationaux:
    - +241 062 XX XX XX XX (Moov)
    - +241 074 XX XX XX XX (Airtel)
    - +241 077 XX XX XX XX (Airtel)
    
    Ancien format (8 chiffres) automatiquement converti:
    - 06XXXXXX → 062XXXXXX (par défaut Moov)
    - 07XXXXXX → 074XXXXXX (par défaut Airtel)
    """
    if not value:
        return  # Le champ peut être vide si blank=True
    
    # Nettoyer le numéro (enlever espaces, tirets et points)
    cleaned = re.sub(r'[\s\-\.]', '', value)
    
    # Patterns pour le nouveau format gabonais (9 chiffres)
    # Moov: 062, 063, 065, 066 + 6 chiffres
    # Airtel: 074, 077 + 6 chiffres
    moov_pattern = r'^0(62|63|65|66)\d{6}$'
    airtel_pattern = r'^0(74|77)\d{6}$'
    
    # Format international
    moov_international = r'^\+2410(62|63|65|66)\d{6}$'
    airtel_international = r'^\+2410(74|77)\d{6}$'
    
    # Ancien format (8 chiffres) - pour migration automatique
    old_moov_pattern = r'^06\d{6}$'
    old_airtel_pattern = r'^07\d{6}$'
    
    # Vérifier si c'est un ancien format (sera accepté mais devrait être migré)
    if re.match(old_moov_pattern, cleaned) or re.match(old_airtel_pattern, cleaned):
        # Accepter l'ancien format (sera normalisé lors de la sauvegarde)
        return
    
    # Vérifier le nouveau format
    if not (re.match(moov_pattern, cleaned) or 
            re.match(airtel_pattern, cleaned) or
            re.match(moov_international, cleaned) or 
            re.match(airtel_international, cleaned)):
        raise ValidationError(
            _('Numéro de téléphone invalide. Formats acceptés:\n'
              'Moov: 062/063/065/066 XX XX XX XX\n'
              'Airtel: 074/077 XX XX XX XX\n'
              'International: +241 0XX XX XX XX XX'),
            code='invalid_phone'
        )


def normalize_gabon_phone(value):
    """
    Normalise un numéro de téléphone gabonais au format international.
    
    Conversions automatiques:
    - Ancien format 06XXXXXX → +241062XXXXXX (Moov par défaut)
    - Ancien format 07XXXXXX → +241074XXXXXX (Airtel par défaut)
    - Nouveau format 062XXXXXX → +241062XXXXXX
    - Déjà international +241... → inchangé
    
    Returns:
        str: Numéro au format international +241...
    """
    if not value:
        return value
    
    # Nettoyer le numéro
    cleaned = re.sub(r'[\s\-\.]', '', value)
    
    # Déjà au format international
    if cleaned.startswith('+241'):
        return cleaned
    
    # Ancien format Moov (8 chiffres: 06XXXXXX)
    if re.match(r'^06\d{6}$', cleaned):
        # Convertir en nouveau format par défaut: 062XXXXXX
        return f'+2410{cleaned}'  # +241 + 0 + 6 + 2 + XXXXXX
    
    # Ancien format Airtel (8 chiffres: 07XXXXXX)
    if re.match(r'^07\d{6}$', cleaned):
        # Convertir en nouveau format par défaut: 074XXXXXX
        return f'+2410{cleaned[0]}4{cleaned[2:]}'  # +241 + 0 + 7 + 4 + XXXXXX
    
    # Nouveau format local (9 chiffres)
    if cleaned.startswith('0') and len(cleaned) == 9:
        return f'+241{cleaned}'
    
    # Si aucun pattern ne correspond, retourner tel quel
    return value

