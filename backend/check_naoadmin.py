#!/usr/bin/env python
"""
Script pour vérifier l'état de naoadmin et son salon
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.core.models import Salon

User = get_user_model()

print("=" * 80)
print("VÉRIFICATION DE NAOADMIN ET DE SES SALONS")
print("=" * 80)

# Vérifier naoadmin
try:
    naoadmin = User.objects.get(email='naoadmin@gmail.com')
    print("\n✅ NAOADMIN TROUVÉ:")
    print(f"   Email: {naoadmin.email}")
    print(f"   is_superuser: {naoadmin.is_superuser}")
    print(f"   is_staff: {naoadmin.is_staff}")
    print(f"   role: {naoadmin.role}")
    print(f"   salon_id: {naoadmin.salon_id}")
    print(f"   salon: {naoadmin.salon}")
    
    if naoadmin.salon:
        print(f"\n   Salon détails:")
        print(f"   - ID: {naoadmin.salon.id}")
        print(f"   - Nom: {naoadmin.salon.name}")
        print(f"   - Email: {naoadmin.salon.email}")
        print(f"   - Téléphone: {naoadmin.salon.phone}")
    else:
        print(f"\n   ⚠️  Pas de salon assigné (normal pour superuser)")
        
except User.DoesNotExist:
    print("\n❌ NAOADMIN N'EXISTE PAS!")

# Vérifier tous les salons
print("\n" + "=" * 80)
print("TOUS LES SALONS DANS LA BASE DE DONNÉES:")
print("=" * 80)

salons = Salon.objects.all()
if salons.exists():
    for salon in salons:
        print(f"\n✅ {salon.id} - {salon.name}")
        print(f"   Email: {salon.email}")
        print(f"   Téléphone: {salon.phone}")
        print(f"   Adresse: {salon.address}")
        print(f"   is_active: {salon.is_active}")
        
        # Vérifier les utilisateurs assignés à ce salon
        users = User.objects.filter(salon=salon)
        print(f"   Utilisateurs ({users.count()}): {', '.join([u.email for u in users])}")
else:
    print("\n❌ Aucun salon trouvé!")

print("\n" + "=" * 80)
