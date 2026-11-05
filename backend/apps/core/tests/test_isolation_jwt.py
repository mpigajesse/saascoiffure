"""
Isolation multi-tenant avec authentification JWT.

Régression : TenantMiddleware fixait request.salon avant l'authentification
DRF, donc à None pour tout compte non superutilisateur — un gérant de salon
voyait des listes vides. Ces tests vérifient qu'il voit son salon, et
seulement le sien.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.clients.models import Client
from apps.core.models import Salon

User = get_user_model()


class IsolationJWTTests(TestCase):
    def setUp(self):
        self.salon_a = Salon.objects.create(name="Salon A", slug="salon-a", address="A", phone="1", email="a@a.ga")
        self.salon_b = Salon.objects.create(name="Salon B", slug="salon-b", address="B", phone="2", email="b@b.ga")
        Client.objects.create(salon=self.salon_a, first_name="Ada", last_name="A", phone="10")
        Client.objects.create(salon=self.salon_b, first_name="Bea", last_name="B", phone="20")
        self.gerant = User.objects.create_user(
            email="gerant@a.ga", password="mot-de-passe-test", first_name="G", last_name="A",
            salon=self.salon_a, role="ADMIN",
        )
        self.api = APIClient()

    def _jeton(self):
        reponse = self.api.post("/api/v1/auth/login/", {"email": "gerant@a.ga", "password": "mot-de-passe-test"}, format="json")
        self.assertEqual(reponse.status_code, 200, reponse.content)
        return reponse.json()["access"]

    def test_gerant_voit_les_clients_de_son_salon(self):
        self.api.credentials(HTTP_AUTHORIZATION="Bearer " + self._jeton())
        reponse = self.api.get("/api/v1/clients/")
        self.assertEqual(reponse.status_code, 200)
        prenoms = [c["first_name"] for c in reponse.json()["results"]]
        self.assertEqual(prenoms, ["Ada"])

    def test_sans_jeton_aucun_client(self):
        reponse = self.api.get("/api/v1/clients/")
        self.assertIn(reponse.status_code, (401, 403))
