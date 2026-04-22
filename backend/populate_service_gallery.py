#!/usr/bin/env python
"""
Script pour peupler la galerie d'images des services pour naoadmin
"""
import os
import django
from pathlib import Path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from apps.services.models import Service, ServiceImage
from apps.core.models import Salon

User = get_user_model()

# Données des services (identique à populate_services.py)
SERVICES_DATA = [
    {
        'name': 'Tresses africaines',
        'folder': 'lot1',
    },
    {
        'name': 'Coupe afro courte chic',
        'folder': 'lot2',
    },
    {
        'name': 'Coupe naturelle bouclée',
        'folder': 'lot3',
    },
    {
        'name': 'Coiffure moderne',
        'folder': 'lot4',
    },
    {
        'name': 'Cornrows stylées',
        'folder': 'lot5',
    },
    {
        'name': 'Locks féminines',
        'folder': 'lot6',
    },
    {
        'name': 'Style luxe',
        'folder': 'lot7',
    },
]

def main():
    print("=" * 80)
    print("PEUPLEMENT DES GALERIES DE SERVICES")
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
    
    # Chemin vers les images
    images_base_path = Path(__file__).parent / 'images'
    
    for service_data in SERVICES_DATA:
        service_name = service_data['name']
        folder_name = service_data['folder']
        
        try:
            service = Service.objects.get(salon=salon, name=service_name)
            print(f"\n🔍 Traitement de: {service_name}")
            
            image_folder = images_base_path / folder_name
            if not image_folder.exists():
                print(f"   ⚠️ Dossier {folder_name} introuvable")
                continue
                
            image_files = sorted(list(image_folder.glob('*.*'))) # Sort ensures consistent order
            if not image_files:
                print(f"   ⚠️ Aucune image dans {folder_name}")
                continue
                
            # Nettoyer les anciennes images de galerie
            count_deleted = ServiceImage.objects.filter(service=service).delete()[0]
            if count_deleted > 0:
                print(f"   🗑️  Supprimé {count_deleted} anciennes images de galerie")
            
            # Ajouter les nouvelles images
            for i, image_path in enumerate(image_files):
                is_primary = (i == 0)
                
                with open(image_path, 'rb') as f:
                    content = ContentFile(f.read())
                    filename = image_path.name
                    
                    # Créer l'entrée galerie
                    service_image = ServiceImage(
                        salon=salon,
                        service=service,
                        is_primary=is_primary,
                        order=i,
                        alt_text=f"{service_name} - Vue {i+1}"
                    )
                    service_image.image.save(f"services/gallery/{folder_name}/{filename}", content, save=True)
                    
                    # Si c'est l'image principale, mettons aussi à jour l'image du service pour compatibilité
                    if is_primary:
                        # Re-read file content for the second save
                        f.seek(0)
                        content_main = ContentFile(f.read())
                        service.image.save(f"services/images/{folder_name}/{filename}", content_main, save=True)
                        print(f"   📸 Image principale mise à jour: {filename}")
                    else:
                        print(f"   🖼️  Image galerie ajoutée: {filename}")
                        
        except Service.DoesNotExist:
            print(f"   ❌ Service non trouvé: {service_name}")
            
    print("\n" + "=" * 80)
    print("✅ PEUPLEMENT GALERIES TERMINÉ!")
    print("=" * 80)

if __name__ == '__main__':
    main()
