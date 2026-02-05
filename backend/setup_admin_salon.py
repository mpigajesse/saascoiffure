"""
Script pour créer un salon et l'associer à l'utilisateur admin
"""
import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.core.models import Salon
from apps.accounts.models import User

def create_salon_for_admin():
    """Créer un salon pour l'utilisateur admin"""
    
    # Récupérer l'utilisateur admin
    try:
        admin_user = User.objects.get(email='naoadmin@gmail.com')
        print(f"✓ Utilisateur trouvé: {admin_user.email}")
    except User.DoesNotExist:
        print("✗ Erreur: Utilisateur naoadmin@gmail.com n'existe pas")
        print("Veuillez d'abord créer le superuser avec: python manage.py createsuperuser")
        return
    
    # Vérifier si un salon existe déjà pour cet utilisateur
    if admin_user.salon:
        print(f"✓ Salon déjà existant: {admin_user.salon.name}")
        print(f"  ID: {admin_user.salon.id}")
        print(f"  Adresse: {admin_user.salon.address}")
        return
    
    # Créer le salon
    salon = Salon.objects.create(
        name='Salon Mireille',
        address='Avenue Léon Mba, Libreville, Gabon',
        phone='+241 06 12 34 56 78',
        email='contact@salon-mireille.ga',
        opening_hours='8h00 - 18h00',
        currency='XAF',
        timezone='Africa/Libreville',
        primary_color='#8b5a3c',
    )
    print(f"✓ Salon créé: {salon.name}")
    print(f"  ID: {salon.id}")
    
    # Associer le salon à l'utilisateur
    admin_user.salon = salon
    admin_user.role = 'ADMIN'
    admin_user.save()
    print(f"✓ Utilisateur {admin_user.email} associé au salon")
    print(f"  Rôle: {admin_user.role}")
    
    print("\n" + "="*50)
    print("✓ Configuration terminée avec succès!")
    print("="*50)
    print(f"\nVous pouvez maintenant vous connecter avec:")
    print(f"  Email: {admin_user.email}")
    print(f"  Mot de passe: [votre mot de passe]")
    print(f"\nAccéder au dashboard: http://localhost:8080/admin")
    print(f"Django Admin: http://localhost:8000/admin/")

if __name__ == '__main__':
    create_salon_for_admin()
