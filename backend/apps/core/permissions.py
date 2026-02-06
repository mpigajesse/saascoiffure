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


class CanManageAppointments(permissions.BasePermission):
    """
    Permissions granulaires pour la gestion des rendez-vous.
    
    Règles:
    - ADMIN: Toutes les actions
    - COIFFEUR: Gérer ses propres rendez-vous + confirmer/démarrer/terminer tous les RDV
    - RECEPTIONNISTE: Créer, confirmer, reporter, déplacer, annuler (pas terminer)
    """
    message = "Vous n'avez pas la permission d'effectuer cette action."
    
    def has_permission(self, request, view):
        """Vérification au niveau de la vue"""
        if not request.user.is_authenticated:
            return False
        
        # Admin a tous les droits
        if request.user.role == 'ADMIN':
            return True
        
        # Actions publiques (création depuis le site web)
        if view.action == 'create' and not hasattr(request.user, 'role'):
            return True
        
        # Vérifier que l'utilisateur est employé
        if not hasattr(request.user, 'role'):
            return False
        
        action = view.action
        role = request.user.role
        
        # Réceptionniste peut créer, lister, voir détails
        if role == 'RECEPTIONNISTE':
            if action in ['list', 'retrieve', 'create', 'today', 'upcoming', 'available_slots', 'check_availability']:
                return True
        
        # Coiffeur peut lister et voir détails
        if role == 'COIFFEUR':
            if action in ['list', 'retrieve', 'today', 'upcoming', 'available_slots', 'check_availability']:
                return True
        
        # Les actions spécifiques sont gérées dans has_object_permission
        return True
    
    def has_object_permission(self, request, view, obj):
        """Vérification au niveau de l'objet (rendez-vous spécifique)"""
        if not request.user.is_authenticated:
            return False
        
        # Admin a tous les droits
        if request.user.role == 'ADMIN':
            return True
        
        action = view.action
        role = request.user.role
        
        # Vérifier que le RDV appartient au même salon
        if hasattr(obj, 'salon') and obj.salon != request.salon:
            return False
        
        # RÉCEPTIONNISTE
        if role == 'RECEPTIONNISTE':
            # Peut confirmer, reporter, déplacer, annuler
            if action in ['confirm', 'reschedule', 'move', 'cancel', 'update', 'partial_update']:
                return True
            # Ne peut PAS démarrer ni terminer
            if action in ['start', 'complete']:
                return False
        
        # COIFFEUR
        if role == 'COIFFEUR':
            # Peut confirmer, démarrer, terminer n'importe quel RDV
            if action in ['confirm', 'start', 'complete']:
                return True
            
            # Peut gérer (reporter, déplacer, annuler, modifier) UNIQUEMENT ses propres RDV
            if action in ['reschedule', 'move', 'cancel', 'update', 'partial_update', 'destroy']:
                # Vérifier que c'est son propre rendez-vous
                from apps.employees.models import Employee
                try:
                    employee = Employee.objects.get(user=request.user, salon=request.salon)
                    return obj.employee == employee
                except Employee.DoesNotExist:
                    return False
        
        return False
