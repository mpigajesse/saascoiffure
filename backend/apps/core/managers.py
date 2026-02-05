"""
Manager personnalisé pour les modèles tenant-aware
"""
from django.db import models


class TenantManager(models.Manager):
    """
    Manager qui facilite le filtrage par salon.
    Utilisé par tous les modèles métier pour garantir l'isolation des données.
    """
    
    def for_salon(self, salon):
        """
        Retourne tous les objets d'un salon spécifique.
        Usage: Model.objects.for_salon(request.salon)
        """
        if salon is None:
            return self.none()
        return self.filter(salon=salon)
    
    def active(self):
        """Retourne uniquement les objets actifs (si le modèle a un champ is_active)"""
        return self.filter(is_active=True)
