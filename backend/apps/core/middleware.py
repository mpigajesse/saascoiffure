"""
Multi-tenant middleware
Injecte automatiquement le salon actif dans chaque requête
"""
from django.utils.deprecation import MiddlewareMixin
from apps.core.models import Salon


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
        request.salon = None

        if hasattr(request, 'user') and request.user.is_authenticated:
            # Récupère le salon de l'utilisateur authentifié
            request.salon = getattr(request.user, 'salon', None)
            
            # Pour les superutilisateurs, permettre de forcer le salon via header
            if request.user.is_superuser:
                salon_id_header = request.headers.get('X-Salon-Id')
                if salon_id_header:
                    try:
                        request.salon = Salon.objects.get(id=salon_id_header)
                        # print(f"DEBUG: Middleware forced salon to {request.salon} from header {salon_id_header}")
                    except (Salon.DoesNotExist, ValueError):
                        # print(f"DEBUG: Middleware failed to find salon from header {salon_id_header}")
                        pass
                # else:
                    # print("DEBUG: No X-Salon-Id header found for superuser")
        
        return None
