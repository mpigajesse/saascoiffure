"""
Views for accounts app
"""
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from .serializers import (
    UserSerializer,
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    ChangePasswordSerializer
)
from apps.core.permissions import IsSalonAdmin

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    Enregistrement d'un nouveau salon avec son administrateur.
    Endpoint public (pas d'authentification requise).
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'success': True,
            'message': 'Salon créé avec succès',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """
    Connexion utilisateur avec JWT.
    Retourne access token + refresh token + infos utilisateur.
    """
    serializer_class = CustomTokenObtainPairSerializer


class CurrentUserView(generics.RetrieveAPIView):
    """
    Récupère les informations de l'utilisateur connecté.
    Endpoint: /api/v1/auth/me/
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserViewSet(viewsets.ModelViewSet):
    """
    CRUD pour les utilisateurs.
    Filtré automatiquement par salon.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtre les utilisateurs par salon"""
        user = self.request.user
        
        # Superusers see all users across all salons
        if user.is_superuser:
            return User.objects.all()
        
        # Regular users see only their salon's users
        if self.request.salon:
            return User.objects.filter(salon=self.request.salon)
        
        # No access
        return User.objects.none()
    
    def get_permissions(self):
        """Seuls les admins peuvent créer/modifier/supprimer des utilisateurs"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSalonAdmin()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        """Associe automatiquement le salon lors de la création"""
        serializer.save(salon=self.request.salon)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Retourne les informations de l'utilisateur connecté"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'], url_path='update-profile')
    def update_profile(self, request):
        """Met à jour le profil de l'utilisateur connecté"""
        serializer = self.get_serializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'success': True,
            'message': 'Profil mis à jour avec succès',
            'user': serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change le mot de passe de l'utilisateur connecté"""
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        
        # Vérification de l'ancien mot de passe
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({
                'success': False,
                'error': 'Ancien mot de passe incorrect'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Changement du mot de passe
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'success': True,
            'message': 'Mot de passe changé avec succès'
        })
