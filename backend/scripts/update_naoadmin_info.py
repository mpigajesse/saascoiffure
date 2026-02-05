"""
Script pour mettre à jour les informations de naoadmin@gmail.com
Super administrateur et développeur du SaaS + propriétaire du Salon Mireille
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User
from apps.core.models import Salon


def update_naoadmin_info():
    """Mettre à jour les informations de Naomie Moussavou (naoadmin@gmail.com)"""
    
    email = 'naoadmin@gmail.com'
    
    try:
        # Récupérer l'utilisateur
        user = User.objects.filter(email=email).first()
        
        if not user:
            print(f"❌ Utilisateur {email} non trouvé dans la base de données")
            return
        
        print("\n📋 INFORMATIONS ACTUELLES:")
        print(f"   Email: {user.email}")
        print(f"   Prénom: {user.first_name}")
        print(f"   Nom: {user.last_name}")
        print(f"   Téléphone: {user.phone or '(non renseigné)'}")
        print(f"   Rôle: {user.role}")
        print(f"   Salon: {user.salon.name if user.salon else '(aucun salon)'}")
        print(f"   Salon ID: {user.salon.id if user.salon else 'N/A'}")
        print(f"   Superuser: {user.is_superuser}")
        print(f"   Staff: {user.is_staff}")
        
        # Mettre à jour les informations
        user.first_name = 'Naomie'
        user.last_name = 'Moussavou'
        user.phone = '+241 07 40 13 02'
        user.role = 'ADMIN'
        
        # Assurer qu'il est superuser (super admin du SaaS)
        user.is_superuser = True
        user.is_staff = True
        
        # Vérifier/créer le salon s'il n'existe pas
        if not user.salon:
            salon, created = Salon.objects.get_or_create(
                name='Salon Mireille',
                defaults={
                    'address': 'Libreville, Gabon',
                    'phone': '+241 07 40 13 02',
                    'email': 'contact@salon-mireille.ga',
                    'opening_hours': '8h00 - 18h00',
                    'currency': 'XAF',
                    'timezone': 'Africa/Libreville',
                    'primary_color': '#8b5a3c',
                    'is_active': True
                }
            )
            user.salon = salon
            print(f"\n✅ Salon créé: {salon.name} (ID: {salon.id})")
        
        user.save()
        
        print("\n✅ INFORMATIONS MISES À JOUR:")
        print(f"   Email: {user.email}")
        print(f"   Prénom: {user.first_name}")
        print(f"   Nom: {user.last_name}")
        print(f"   Téléphone: {user.phone}")
        print(f"   Rôle: {user.role}")
        print(f"   Salon: {user.salon.name}")
        print(f"   Salon ID: {user.salon.id}")
        print(f"   Superuser: {user.is_superuser}")
        print(f"   Staff: {user.is_staff}")
        
        print("\n🎉 Mise à jour réussie!")
        print("\n📝 RÉSUMÉ:")
        print(f"   ✓ Naomie Moussavou est le super administrateur du SaaS")
        print(f"   ✓ Développeur de l'intégralité du système")
        print(f"   ✓ Propriétaire et administrateur du 'Salon Mireille'")
        print(f"   ✓ Téléphone: {user.phone}")
        
    except Exception as e:
        print(f"\n❌ Erreur lors de la mise à jour: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    update_naoadmin_info()
