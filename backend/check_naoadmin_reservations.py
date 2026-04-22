import os
import django
import sys
from django.utils import timezone

# Configuration de l'environnement Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.core.models import Salon
from apps.appointments.models import Appointment
from apps.clients.models import Client

User = get_user_model()

def check_reservations():
    print("="*80)
    print("VÉRIFICATION DES RÉSERVATIONS POUR NAOADMIN")
    print("="*80)

    # 1. Récupérer l'utilisateur naoadmin
    try:
        admin_user = User.objects.get(email='naoadmin@gmail.com')
        print(f"✅ Utilisateur trouvé: {admin_user.email} (ID: {admin_user.id})")
    except User.DoesNotExist:
        print("❌ Utilisateur naoadmin@gmail.com non trouvé")
        return

    # 2. Récupérer le salon du superadmin
    # D'après les checks précédents, le salon est NaoBeauty (ID 1)
    # On vérifie via la relation (selon votre modèle, peut-être user.salon ou user.salons.first())
    # Supposons que le lien est via salon_id ou une relation
    
    # Tentative de récupération du salon via le champ salon sur l'utilisateur ou par ID 1 connu
    salon = None
    if hasattr(admin_user, 'salon') and admin_user.salon:
         salon = admin_user.salon
    elif hasattr(admin_user, 'associated_salon') and admin_user.associated_salon:
         salon = admin_user.associated_salon
    else:
        # Fallback sur ID 1 car on sait que c'est NaoBeauty
        try:
            salon = Salon.objects.get(id=1)
        except Salon.DoesNotExist:
            print("❌ Salon ID 1 non trouvé")
            return

    print(f"✅ Salon identifié: {salon.name} (ID: {salon.id})")
    print("-" * 80)

    # 3. Récupérer tous les clients du salon
    clients = Client.objects.filter(salon=salon)
    print(f"📋 Nombre total de clients associés au salon: {clients.count()}")
    
    # 4. Pour chaque client, vérifier les réservations
    total_reservations = 0
    clients_with_reservations = 0

    print("\nDétail des réservations par client :")
    print(f"{'Client':<30} | {'Total RDV':<10} | {'Détails (Date - Statut)'}")
    print("-" * 80)

    all_appointments = Appointment.objects.filter(salon=salon).order_by('-date', '-time')
    
    # On peut aussi itérer sur les appointments directement pour voir tout l'historique
    if all_appointments.exists():
        print(f"Total des rendez-vous trouvés pour le salon: {all_appointments.count()}")
        for apt in all_appointments:
            client_name = f"{apt.client.first_name} {apt.client.last_name}" if apt.client else "Unknown"
            print(f"- {apt.date} à {apt.time} : {client_name:<20} [{apt.status}]")
    else:
        print("⚠️ Aucune réservation trouvée pour ce salon.")

    print("\n" + "="*80)
    
    # Optionnel: créer une réservation de test si aucune n'existe
    if all_appointments.count() == 0 and clients.exists():
        print("\n🛠️ CRÉATION D'UNE RÉSERVATION DE TEST (car aucune trouvée)")
        try:
            client = clients.first()
            from datetime import date, time
            
            # Créer un rendez-vous pour aujourd'hui
            # Note: Adaptez les champs selon votre modèle Appointment exact
            # Je suppose qu'il faut un service et un employé. Je vais essayer de les trouver.
            from apps.services.models import Service
            from apps.employees.models import Employee
            
            service = Service.objects.filter(salon=salon).first()
            employee = Employee.objects.filter(salon=salon).first()
            
            if service and employee:
                apt = Appointment.objects.create(
                    salon=salon,
                    client=client,
                    employee=employee,
                    service=service,
                    date=timezone.now().date(),
                    time=time(14, 0),
                    status='PENDING', # ou CONFIRMED
                    amount=service.price
                )
                print(f"✅ Réservation de test créée pour {client.first_name} le {apt.date}")
            else:
                print("❌ Impossible de créer un test: Service ou Employé manquant")
        except Exception as e:
            print(f"❌ Erreur lors de la création du test: {e}")

if __name__ == "__main__":
    check_reservations()
