"""
Custom exception handler
Centralise la gestion des erreurs API
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    """
    Gestionnaire d'exceptions personnalisé pour l'API.
    Retourne des messages d'erreur cohérents et exploitables.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Add custom error format
    if response is not None:
        custom_response = {
            'success': False,
            'error': {
                'message': str(exc),
                'details': response.data
            }
        }
        response.data = custom_response
    
    return response
