"""
Multi-tenant middleware
Injecte automatiquement le salon actif dans chaque requête
"""
from django.utils.deprecation import MiddlewareMixin


class TenantMiddleware(MiddlewareMixin):
    """
    Middleware qui injecte le salon actif dans request.salon
    basé sur l'utilisateur authentifié.
    
    Principe :
    - Si l'utilisateur est authentifié, request.salon = salon de l'utilisateur
    - Sinon, request.salon = None
    
    Ce middleware permet un filtrage automatique des données par salon
    dans toutes les vues.
    """
    
    def process_request(self, request):
        """Injection du salon dans la requête"""
        if hasattr(request, 'user') and request.user.is_authenticated:
            # Récupère le salon de l'utilisateur authentifié
            request.salon = getattr(request.user, 'salon', None)
        else:
            # Aucun salon pour les utilisateurs non authentifiés
            request.salon = None
        
        return None
