#!/usr/bin/env python
"""
Script pour vérifier les services avec leurs cibles
"""
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User
from apps.core.models import Salon
from apps.services.models import Service

def main():
    print("🔍 Vérification des services et de leurs cibles...")
    
    # Trouver l'utilisateur naoadmin@gmail.com
    try:
        user = User.objects.get(email="naoadmin@gmail.com")
        print(f"✅ Utilisateur trouvé: {user.email}")
    except User.DoesNotExist:
        print("❌ Utilisateur naoadmin@gmail.com introuvable")
        return
    
    # Trouver son salon
    salon = user.salon
    if salon:
        print(f"✅ Salon trouvé: {salon.name}")
    else:
        print("❌ Aucun salon associé à cet utilisateur")
        return
    
    # Lister tous les services du salon
    services = Service.objects.filter(salon=salon)
    print(f"\n📋 Services du salon ({services.count()} total):")
    print("-" * 80)
    
    for service in services:
        print(f"ID: {service.id}")
        print(f"Nom: {service.name}")
        print(f"Prix: {service.price} FCFA")
        print(f"Durée: {service.duration} min")
        print(f"Cible: {service.target} ({service.get_target_display()})")
        print(f"Actif: {'Oui' if service.is_active else 'Non'}")
        print(f"Publié: {'Oui' if service.is_published else 'Non'}")
        if service.category:
            print(f"Catégorie: {service.category.name}")
        if service.image:
            print(f"Image: {service.image.url}")
        print("-" * 80)
    
    # Statistiques par cible
    print("\n📊 Répartition par cible:")
    targets = Service.TARGET_CHOICES
    for target_code, target_label in targets:
        count = services.filter(target=target_code).count()
        print(f"  {target_label}: {count} service{'s' if count > 1 else ''}")
    
    print("\n✅ Vérification terminée!")

if __name__ == "__main__":
    main()