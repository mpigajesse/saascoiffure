"""
Multi-tenant middleware
Injecte automatiquement le salon actif dans chaque requête
"""
from django.utils.deprecation import MiddlewareMixin
from django.utils.functional import SimpleLazyObject
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
        """
        Injection du salon dans la requête — résolue paresseusement.

        Ce middleware s'exécute AVANT l'authentification de DRF : pour une
        requête portant un jeton JWT, `request.user` est encore anonyme ici.
        Fixer `request.salon` maintenant le laissait à None pour tout compte
        qui n'est pas superutilisateur, et ses listes revenaient vides.
        Avec un objet paresseux, le salon est calculé au premier accès (dans la
        vue), quand DRF a déjà posé l'utilisateur authentifié sur la requête.
        """
        request.salon = SimpleLazyObject(lambda: _salon_de_la_requete(request))
        return None


def _salon_de_la_requete(request):
    """Salon de l'utilisateur ; un superutilisateur peut le forcer par X-Salon-Id."""
    user = getattr(request, 'user', None)
    if user is None or not user.is_authenticated:
        return None
    salon = getattr(user, 'salon', None)
    if user.is_superuser:
        salon_id_header = request.headers.get('X-Salon-Id')
        if salon_id_header:
            try:
                salon = Salon.objects.get(id=salon_id_header)
            except (Salon.DoesNotExist, ValueError):
                pass
    return salon
