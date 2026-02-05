"""
Permissions centralisées
Toutes les permissions métier sont définies ici pour éviter la duplication.
RÈGLE DRY : Une permission = un seul endroit.
"""
from rest_framework import permissions


class IsSalonAdmin(permissions.BasePermission):
    """
    Vérifie que l'utilisateur est administrateur de son salon.
    Utilisé pour les opérations de gestion (création employés, services, etc.)
    """
    message = "Seuls les administrateurs du salon peuvent effectuer cette action."
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            hasattr(request.user, 'role') and
            request.user.role == 'ADMIN'
        )


class IsSalonEmployee(permissions.BasePermission):
    """
    Vérifie que l'utilisateur est un employé du salon (incluant admin).
    Utilisé pour les opérations quotidiennes.
    """
    message = "Vous devez être employé du salon pour accéder à cette ressource."
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            hasattr(request.user, 'role') and
            request.user.role in ['ADMIN', 'COIFFEUR', 'RECEPTIONNISTE']
        )


class IsSalonOwner(permissions.BasePermission):
    """
    Vérifie que l'objet appartient au salon de l'utilisateur.
    Empêche l'accès inter-salon.
    RÈGLE CRITIQUE : Aucun accès aux données d'un autre salon.
    """
    message = "Vous ne pouvez pas accéder aux données d'un autre salon."
    
    def has_object_permission(self, request, view, obj):
        # Vérifie que l'objet appartient au même salon que l'utilisateur
        if hasattr(obj, 'salon'):
            return obj.salon == request.salon
        return False


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Vérifie que l'utilisateur est propriétaire de l'objet OU admin du salon.
    Utilisé pour les modifications de profil, etc.
    """
    message = "Vous devez être propriétaire ou administrateur pour modifier."
    
    def has_object_permission(self, request, view, obj):
        # Admin peut tout
        if request.user.role == 'ADMIN':
            return True
        
        # Propriétaire peut modifier ses propres données
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return obj == request.user
