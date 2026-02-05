# 🚀 Backend Django - SaaS Coiffure

Application backend Django pour la gestion de salons de coiffure multi-tenant.

## 📋 Prérequis

- Python 3.10+
- PostgreSQL 14+
- pip ou pipenv

## 🛠️ Installation

### 1. Cloner le projet

```bash
cd backend
```

### 2. Créer l'environnement virtuel

```bash
python -m venv env
```

### 3. Activer l'environnement

**Windows:**
```bash
env\Scripts\activate
```

**Linux/Mac:**
```bash
source env/bin/activate
```

### 4. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 5. Configuration de la base de données

Créez une base de données PostgreSQL:

```sql
CREATE DATABASE saascoiffure_db;
CREATE USER saascoiffure_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE saascoiffure_db TO saascoiffure_user;
```

### 6. Configuration des variables d'environnement

Copiez `.env.example` vers `.env`:

```bash
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac
```

Modifiez `.env` avec vos paramètres:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DB_NAME=saascoiffure_db
DB_USER=saascoiffure_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

### 7. Appliquer les migrations

```bash
python manage.py migrate
```

### 8. Créer un superutilisateur

```bash
python manage.py createsuperuser
```

### 9. Lancer le serveur

```bash
python manage.py runserver
```

L'API sera accessible à : `http://localhost:8000`

## 📚 Documentation de l'API

Une fois le serveur lancé, accédez à :

- **Swagger UI** : http://localhost:8000/swagger/
- **ReDoc** : http://localhost:8000/redoc/
- **Admin Django** : http://localhost:8000/admin/

## 🏗️ Architecture

### Structure du projet

```
backend/
├── apps/
│   ├── core/           # Multi-tenant foundation
│   ├── accounts/       # Authentification & utilisateurs
│   ├── clients/        # Gestion des clients
│   ├── employees/      # Gestion des employés
│   ├── services/       # Prestations/services
│   ├── appointments/   # Rendez-vous
│   └── payments/       # Paiements
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   └── wsgi.py
└── manage.py
```

### Principes clés

1. **Multi-tenant strict** : Chaque donnée est liée à un salon
2. **Service Layer** : Logique métier centralisée
3. **DRY** : Aucune duplication de code
4. **Permissions centralisées** : Gestion des accès unifiée
5. **ORM Django exclusif** : Pas de SQL brut

## 🔑 Endpoints principaux

### Authentification

```
POST /api/v1/auth/register/      # Inscription (créer un salon)
POST /api/v1/auth/login/         # Connexion (JWT)
POST /api/v1/auth/token/refresh/ # Rafraîchir le token
GET  /api/v1/auth/users/me/      # Profil utilisateur
```

### Clients

```
GET    /api/v1/clients/           # Liste des clients
POST   /api/v1/clients/           # Créer un client
GET    /api/v1/clients/{id}/      # Détails d'un client
PUT    /api/v1/clients/{id}/      # Modifier un client
DELETE /api/v1/clients/{id}/      # Supprimer un client
GET    /api/v1/clients/{id}/history/  # Historique du client
```

### Employés

```
GET    /api/v1/employees/         # Liste des employés
POST   /api/v1/employees/         # Créer un employé
GET    /api/v1/employees/{id}/    # Détails d'un employé
```

### Services

```
GET    /api/v1/services/          # Liste des services
POST   /api/v1/services/          # Créer un service
GET    /api/v1/services/{id}/     # Détails d'un service
```

### Rendez-vous

```
GET    /api/v1/appointments/      # Liste des rendez-vous
POST   /api/v1/appointments/      # Créer un rendez-vous
GET    /api/v1/appointments/today/     # RDV du jour
GET    /api/v1/appointments/upcoming/  # RDV à venir
POST   /api/v1/appointments/check_availability/  # Vérifier disponibilité
```

### Paiements

```
GET    /api/v1/payments/          # Liste des paiements
POST   /api/v1/payments/          # Enregistrer un paiement
GET    /api/v1/payments/stats/    # Statistiques
GET    /api/v1/payments/daily_revenue/   # Revenu journalier
GET    /api/v1/payments/monthly_revenue/ # Revenu mensuel
```

## 🔒 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification.

### Obtenir un token

```bash
POST /api/v1/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

Réponse :
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "ADMIN",
    "salon_id": 1
  }
}
```

### Utiliser le token

Incluez le token dans les headers de vos requêtes :

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

## 🧪 Tests

```bash
# Lancer tous les tests
pytest

# Tests avec couverture
pytest --cov=apps

# Tests d'une app spécifique
pytest apps/clients/tests/
```

## 📦 Commandes utiles

```bash
# Créer une nouvelle migration
python manage.py makemigrations

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Collecter les fichiers statiques
python manage.py collectstatic

# Lancer le shell Django
python manage.py shell

# Vider la base de données
python manage.py flush
```

## 🚀 Déploiement

### Production avec Gunicorn

```bash
pip install gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

### Variables d'environnement en production

```env
DEBUG=False
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DB_NAME=production_db
DB_USER=production_user
DB_PASSWORD=strong_password
DB_HOST=db_host
```

## 🛡️ Sécurité

- JWT avec rotation des tokens
- Validation stricte des permissions
- Isolation multi-tenant garantie
- Protection CSRF
- Validation des entrées
- Mots de passe hashés avec Argon2

## 📝 Règles de développement

Consultez les documents suivants dans le dossier racine :

- `regles_universelles_de_developpement_projet_saa_s_salons_de_coiffure.md`
- `projet_application_web_saa_s_de_gestion_de_salons_de_coiffure.md`
- `use_cases_fonctionnels_application_saa_s_salons_de_coiffure.md`

### Règles essentielles

1. ✅ Toute donnée DOIT être liée à un salon
2. ✅ Logique métier dans les services (pas dans les views)
3. ✅ Pas de duplication de code (DRY)
4. ✅ Permissions centralisées
5. ✅ ORM Django exclusivement

## 🤝 Contribution

1. Créer une branche : `git checkout -b feature/nouvelle-fonctionnalite`
2. Commiter : `git commit -m 'Ajout nouvelle fonctionnalité'`
3. Pousser : `git push origin feature/nouvelle-fonctionnalite`
4. Créer une Pull Request

## 📧 Contact

**Auteur** : MPIGA-ODOUMBA JESSE  
**Profil** : Ingénieur IA & Big Data

---

**Made in Gabon** 🇬🇦 with ❤️
