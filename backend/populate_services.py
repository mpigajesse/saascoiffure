#!/usr/bin/env python
"""
Script pour peupler la base de données avec des services de coiffure pour naoadmin
"""
import os
import django
from pathlib import Path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from apps.services.models import Service, ServiceCategory
from apps.core.models import Salon

User = get_user_model()

# Données des services
SERVICES_DATA = [
    {
        'name': 'Tresses africaines',
        'description': 'Tresses traditionnelles africaines élégantes et durables. Disponible en plusieurs styles et longueurs.',
        'category': 'Tresses et Nattages',
        'price': 45000,
        'duration': 120,
        'folder': 'lot1',
    },
    {
        'name': 'Coupe afro courte chic',
        'description': 'Coupe afro moderne et stylée pour un look naturel et chic. Parfait pour mettre en valeur vos traits.',
        'category': 'Coupes',
        'price': 15000,
        'duration': 45,
        'folder': 'lot2',
    },
    {
        'name': 'Coupe naturelle bouclée',
        'description': 'Coupe spécialisée pour cheveux naturels bouclés. Mets en avant vos boucles naturelles.',
        'category': 'Coupes',
        'price': 18000,
        'duration': 60,
        'folder': 'lot3',
    },
    {
        'name': 'Coiffure moderne',
        'description': 'Coiffure contemporaine et tendance pour vos occasions spéciales ou sorties entre amies.',
        'category': 'Coiffures',
        'price': 25000,
        'duration': 90,
        'folder': 'lot4',
    },
    {
        'name': 'Cornrows stylées',
        'description': 'Cornrows tressées avec style. Disponible en designs classiques ou créatifs.',
        'category': 'Tresses et Nattages',
        'price': 35000,
        'duration': 180,
        'folder': 'lot5',
    },
    {
        'name': 'Locks féminines',
        'description': 'Locks créées et entretenues avec soin. Parfait pour un look unique et naturel.',
        'category': 'Locks et Extensions',
        'price': 50000,
        'duration': 240,
        'folder': 'lot6',
    },
    {
        'name': 'Style luxe',
        'description': 'Coiffure glamour et luxueuse pour vos événements importants. Soin premium inclus.',
        'category': 'Coiffures',
        'price': 40000,
        'duration': 120,
        'folder': 'lot7',
    },
]

def main():
    print("=" * 80)
    print("PEUPLEMENT DE LA BASE DE DONNÉES - SERVICES")
    print("=" * 80)
    
    # Récupérer naoadmin
    try:
        naoadmin = User.objects.get(email='naoadmin@gmail.com')
        print(f"\n✅ Utilisateur naoadmin trouvé")
    except User.DoesNotExist:
        print(f"\n❌ naoadmin@gmail.com n'existe pas!")
        return
    
    # Récupérer le salon de naoadmin
    if not naoadmin.salon:
        print(f"❌ naoadmin n'est pas assigné à un salon!")
        return
    
    salon = naoadmin.salon
    print(f"✅ Salon trouvé: {salon.name}")
    
    # Créer ou récupérer les catégories
    categories = {}
    unique_categories = set(s['category'] for s in SERVICES_DATA)
    
    print(f"\n📂 Création des catégories...")
    for category_name in unique_categories:
        category, created = ServiceCategory.objects.get_or_create(
            salon=salon,
            name=category_name,
            defaults={'description': f'Catégorie: {category_name}'}
        )
        categories[category_name] = category
        status = "✨ CRÉÉE" if created else "✓ EXISTE"
        print(f"   {status}: {category_name}")
    
    # Créer les services
    print(f"\n🎨 Création des services...")
    images_path = Path(__file__).parent / 'images'
    
    for service_data in SERVICES_DATA:
        service, created = Service.objects.get_or_create(
            salon=salon,
            name=service_data['name'],
            defaults={
                'description': service_data['description'],
                'category': categories[service_data['category']],
                'price': service_data['price'],
                'duration': service_data['duration'],
                'is_active': True,
            }
        )
        
        # Ajouter l'image si elle existe
        image_folder = images_path / service_data['folder']
        if image_folder.exists():
            image_files = list(image_folder.glob('*.*'))
            if image_files:
                # Prendre la première image
                image_path = image_files[0]
                try:
                    with open(image_path, 'rb') as f:
                        image_name = f"{service_data['folder']}/{image_path.name}"
                        service.image.save(image_name, ContentFile(f.read()), save=True)
                    print(f"   ✨ {service_data['name']}")
                    print(f"      Prix: {service_data['price']} XAF | Durée: {service_data['duration']}min | Image: ✓")
                except Exception as e:
                    print(f"   ⚠️  {service_data['name']} - Erreur image: {str(e)}")
            else:
                print(f"   ✨ {service_data['name']} (sans image)")
        else:
            print(f"   ✨ {service_data['name']} (dossier images introuvable)")
    
    print("\n" + "=" * 80)
    print("✅ PEUPLEMENT TERMINÉ!")
    print("=" * 80)

if __name__ == '__main__':
    main()
