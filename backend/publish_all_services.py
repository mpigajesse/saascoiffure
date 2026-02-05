#!/usr/bin/env python
"""
Publier tous les services par défaut
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.services.models import Service

# Publier tous les services
services = Service.objects.all()
for service in services:
    service.is_published = True
    service.save()
    print(f"✅ {service.name} - Publié")

print(f"\n✅ {services.count()} services publiés!")
