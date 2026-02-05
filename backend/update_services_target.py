#!/usr/bin/env python
"""
Script pour mettre à jour les services existants du salon de Naomie (naoadmin@gmail.com)
pour définir leur cible comme 'femme'
"""

import os
import sys
import django

# Configuration Django
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.services.models import Service
from apps.core.models import Salon
from apps.accounts.models import User

def update_services_target():
    """Met à jour tous les services du salon de Naomie pour la cible 'femme'"""
    
    try:
        # Trouver l'utilisateur naoadmin@gmail.com
        naoadmin = User.objects.get(email='naoadmin@gmail.com')
        print(f"✅ Utilisateur trouvé: {naoadmin.email}")
        
        # Trouver son salon
        salon = naoadmin.salon
        if not salon:
            print("❌ Aucun salon trouvé pour cet utilisateur")
            return
        
        print(f"✅ Salon trouvé: {salon.name}")
        
        # Mettre à jour tous les services de ce salon
        services = Service.objects.filter(salon=salon)
        updated_count = 0
        
        for service in services:
            # Mettre à jour le target à 'femme' si ce n'est pas déjà fait
            if service.target != 'femme':
                service.target = 'femme'
                service.save()
                updated_count += 1
                print(f"✅ Service mis à jour: {service.name} -> cible: femme")
        
        print(f"\n🎉 Mise à jour terminée!")
        print(f"Total services mis à jour: {updated_count}")
        print(f"Total services dans le salon: {services.count()}")
        
    except User.DoesNotExist:
        print("❌ Utilisateur naoadmin@gmail.com non trouvé")
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == '__main__':
    print("🚀 Mise à jour des services pour le salon de Naomie...")
    update_services_target()