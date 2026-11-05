"""
Jeu de démonstration public : un salon fictif complet (équipe, clientèle,
prestations avec photos, rendez-vous, paiements), pour la démo en ligne.

Idempotent : relancé à chaque démarrage du service (voir render.yaml), il ne
recrée rien qui existe déjà. Il restaure en revanche les photos absentes du
disque : l'offre gratuite de Render a un disque éphémère, vidé à chaque
redémarrage, alors que la base (Neon) conserve les chemins des fichiers.

Toutes les personnes et coordonnées sont inventées (numéros +241 06 00 00 0xx).
Le mot de passe des comptes de démo vient de DEMO_PASSWORD : il est affiché
sur la page de connexion de la démo, il ne protège donc rien de sensible.
"""
import os
import random
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.appointments.models import Appointment
from apps.clients.models import Client
from apps.core.models import Salon
from apps.employees.models import Employee
from apps.payments.models import Payment
from apps.services.models import Service, ServiceCategory, ServiceImage

User = get_user_model()

DOSSIER_IMAGES = Path(settings.BASE_DIR) / "images"
DOMAINE = "demo.naoservice.ga"

PRESTATIONS = [
    # nom, catégorie, cible, prix XAF, durée min, dossier photos
    ("Tresses africaines", "Tresses et nattages", "femme", 45000, 120, "lot1"),
    ("Coupe afro courte chic", "Coupes", "femme", 15000, 45, "lot2"),
    ("Coupe naturelle bouclée", "Coupes", "femme", 18000, 60, "lot3"),
    ("Coiffure moderne", "Coiffures", "femme", 25000, 90, "lot4"),
    ("Cornrows stylées", "Tresses et nattages", "femme", 35000, 180, "lot5"),
    ("Locks féminines", "Locks et extensions", "femme", 50000, 240, "lot6"),
    ("Style luxe", "Coiffures", "femme", 40000, 120, "lot7"),
]

EQUIPE = [
    ("Mireille", "Ondo", "ADMIN", None),
    ("Grâce", "Mabika", "COIFFEUR", "Tresses, locks"),
    ("Junior", "Nzé", "COIFFEUR", "Cornrows, coupes"),
    ("Prisca", "Moussavou", "COIFFEUR", "Coiffures de soirée"),
    ("Sandra", "Obame", "RECEPTIONNISTE", None),
]

CLIENTES = [
    ("Aïcha", "Bongo"), ("Laure", "Mintsa"), ("Ruth", "Ella"), ("Nadia", "Boussougou"),
    ("Estelle", "Ndong"), ("Kévin", "Mba"), ("Chantal", "Nguema"), ("Brice", "Ekomi"),
    ("Mélissa", "Ovono"), ("Diane", "Koumba"),
]


class Command(BaseCommand):
    help = "Crée (ou complète) le salon de démonstration et restaure ses photos."

    def handle(self, *args, **options):
        mot_de_passe = os.environ.get("DEMO_PASSWORD", "demo-salon-2026")
        with transaction.atomic():
            salon = self._salon()
            employes = self._equipe(salon, mot_de_passe)
            prestations = self._prestations(salon)
            clientes = self._clientes(salon, employes)
            if not Appointment.objects.filter(salon=salon).exists():
                self._rendez_vous(salon, employes, prestations, clientes)
        restaurees = self._restaurer_photos(salon)
        self.stdout.write(self.style.SUCCESS(
            f"Démo prête : {salon.name} — {len(prestations)} prestations, "
            f"{len(clientes)} clientes, {Appointment.objects.filter(salon=salon).count()} rendez-vous, "
            f"{restaurees} photo(s) restaurée(s)."
        ))

    def _salon(self):
        salon, _ = Salon.objects.get_or_create(
            slug="salon-mireille",
            defaults={
                "name": "Salon Mireille",
                "address": "Boulevard Triomphal, Libreville (adresse fictive)",
                "phone": "+241 06 00 00 001",
                "email": f"contact@{DOMAINE}",
            },
        )
        return salon

    def _equipe(self, salon, mot_de_passe):
        employes = []
        for i, (prenom, nom, role, specialites) in enumerate(EQUIPE, start=2):
            email = f"{prenom.lower().replace('â', 'a').replace('é', 'e')}@{DOMAINE}"
            user = User.objects.filter(email=email).first()
            if user is None:
                user = User.objects.create_user(
                    email=email, password=mot_de_passe, first_name=prenom, last_name=nom,
                    phone=f"+241 06 00 00 0{i:02d}", salon=salon, role=role,
                )
            if role == "COIFFEUR":
                employe, _ = Employee.objects.get_or_create(
                    user=user, defaults={"salon": salon, "specialties": specialites or ""},
                )
                employes.append(employe)
        return employes

    def _prestations(self, salon):
        prestations = []
        for nom, categorie, cible, prix, duree, _ in PRESTATIONS:
            cat, _ = ServiceCategory.objects.get_or_create(salon=salon, name=categorie)
            service, _ = Service.objects.get_or_create(
                salon=salon, name=nom,
                defaults={
                    "category": cat, "target": cible, "price": Decimal(prix), "duration": duree,
                    "description": f"{nom} — prestation du salon de démonstration.",
                    "is_active": True, "is_published": True,
                },
            )
            prestations.append(service)
        return prestations

    def _clientes(self, salon, employes):
        clientes = []
        for i, (prenom, nom) in enumerate(CLIENTES, start=20):
            cliente, _ = Client.objects.get_or_create(
                salon=salon, first_name=prenom, last_name=nom,
                defaults={
                    "phone": f"+241 06 00 00 0{i:02d}",
                    "preferred_employee": employes[i % len(employes)] if employes else None,
                },
            )
            clientes.append(cliente)
        return clientes

    def _rendez_vous(self, salon, employes, prestations, clientes):
        """Trois semaines passées (terminées, payées) et deux à venir."""
        hasard = random.Random(7)
        aujourd_hui = date.today()
        for jour in range(-21, 15):
            le_jour = aujourd_hui + timedelta(days=jour)
            if le_jour.weekday() == 6:  # fermé le dimanche
                continue
            for _ in range(hasard.randint(2, 5)):
                service = hasard.choice(prestations)
                heure = time(hasard.randint(9, 16), hasard.choice([0, 30]))
                if jour < 0:
                    statut = hasard.choices(["COMPLETED", "CANCELLED", "NO_SHOW"], [88, 8, 4])[0]
                elif jour == 0:
                    statut = hasard.choice(["CONFIRMED", "IN_PROGRESS", "COMPLETED"])
                else:
                    statut = hasard.choice(["PENDING", "CONFIRMED"])
                rdv = Appointment.objects.create(
                    salon=salon, client=hasard.choice(clientes), employee=hasard.choice(employes),
                    service=service, date=le_jour, time=heure, status=statut,
                    payment_method=hasard.choice(["CASH", "MOBILE_MONEY"]),
                )
                if statut == "COMPLETED":
                    Payment.objects.create(
                        salon=salon, appointment=rdv, client=rdv.client, amount=service.price,
                        payment_method=rdv.payment_method, status="COMPLETED",
                        payment_date=timezone.make_aware(datetime.combine(le_jour, heure)),
                    )

    def _restaurer_photos(self, salon):
        """Réécrit sur le disque les photos absentes (disque éphémère de Render)."""
        restaurees = 0
        for nom, *_, dossier in PRESTATIONS:
            service = Service.objects.filter(salon=salon, name=nom).first()
            fichiers = sorted((DOSSIER_IMAGES / dossier).glob("*.*")) if (DOSSIER_IMAGES / dossier).exists() else []
            if service is None or not fichiers:
                continue
            if not service.image or not default_storage.exists(service.image.name):
                with open(fichiers[0], "rb") as f:
                    service.image.save(fichiers[0].name, ContentFile(f.read()), save=True)
                restaurees += 1
            if not ServiceImage.objects.filter(service=service).exists():
                for ordre, chemin in enumerate(fichiers[:4]):
                    with open(chemin, "rb") as f:
                        image = ServiceImage(salon=salon, service=service, order=ordre, is_primary=ordre == 0,
                                             alt_text=nom)
                        image.image.save(chemin.name, ContentFile(f.read()), save=True)
                restaurees += 1
            else:
                for image in ServiceImage.objects.filter(service=service):
                    if not default_storage.exists(image.image.name):
                        source = next((c for c in fichiers if c.name in image.image.name), fichiers[0])
                        with open(source, "rb") as f:
                            image.image.save(source.name, ContentFile(f.read()), save=True)
                        restaurees += 1
        return restaurees
