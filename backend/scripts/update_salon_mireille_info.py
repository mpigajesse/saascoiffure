"""
Script pour compléter toutes les informations du Salon Mireille
Propriétaire: Naomie Moussavou (naoadmin@gmail.com)
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.core.models import Salon


def update_salon_mireille():
    """Compléter toutes les informations du Salon Mireille"""
    
    try:
        # Récupérer le Salon Mireille
        salon = Salon.objects.filter(name='Salon Mireille').first()
        
        if not salon:
            print("❌ Salon Mireille non trouvé dans la base de données")
            return
        
        print("\n📋 INFORMATIONS ACTUELLES DU SALON:")
        print(f"   ID: {salon.id}")
        print(f"   Nom: {salon.name}")
        print(f"   Adresse: {salon.address}")
        print(f"   Téléphone: {salon.phone}")
        print(f"   Email: {salon.email}")
        print(f"   Horaires: {salon.opening_hours}")
        print(f"   Devise: {salon.currency}")
        print(f"   Fuseau horaire: {salon.timezone}")
        print(f"   Couleur principale: {salon.primary_color}")
        print(f"   Actif: {salon.is_active}")
        print(f"   Créé le: {salon.created_at}")
        
        # Mettre à jour avec des informations complètes
        salon.name = 'Salon Mireille'
        salon.address = 'Avenue Léon Mba, Quartier Louis, Libreville, Gabon'
        salon.phone = '+241 07 40 13 02'
        salon.email = 'contact@salon-mireille.ga'
        salon.opening_hours = 'Lun-Sam: 8h00-18h00, Dim: Fermé'
        salon.currency = 'XAF'
        salon.timezone = 'Africa/Libreville'
        salon.primary_color = '#d97038'  # Couleur terracotta/orange chaud africain
        salon.is_active = True
        
        salon.save()
        
        print("\n✅ INFORMATIONS MISES À JOUR:")
        print(f"   ID: {salon.id}")
        print(f"   Nom: {salon.name}")
        print(f"   Adresse: {salon.address}")
        print(f"   Téléphone: {salon.phone}")
        print(f"   Email: {salon.email}")
        print(f"   Horaires: {salon.opening_hours}")
        print(f"   Devise: {salon.currency}")
        print(f"   Fuseau horaire: {salon.timezone}")
        print(f"   Couleur principale: {salon.primary_color}")
        print(f"   Actif: {salon.is_active}")
        
        print("\n🎉 Mise à jour réussie!")
        print("\n📝 RÉSUMÉ:")
        print(f"   ✓ Toutes les informations du Salon Mireille sont complètes")
        print(f"   ✓ Propriétaire: Naomie Moussavou")
        print(f"   ✓ Téléphone: {salon.phone}")
        print(f"   ✓ Email: {salon.email}")
        print(f"   ✓ Adresse complète renseignée")
        print(f"   ✓ Horaires d'ouverture définis")
        
    except Exception as e:
        print(f"\n❌ Erreur lors de la mise à jour: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    update_salon_mireille()
