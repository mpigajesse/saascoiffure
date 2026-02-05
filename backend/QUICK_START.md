# 🚀 Démarrage Rapide - Backend Django

Guide pour démarrer rapidement le backend Django en local.

## ✅ Prérequis installés

- ✅ Python 3.10+
- ✅ PostgreSQL avec base de données `saascoiffure_db`
- ✅ Credentials: `postgres` / `admin`

## 📝 Étapes de démarrage

### 1. Naviguer vers le dossier backend

```bash
cd D:\2026WEB\SaasCoiffure\backend
```

### 2. Créer l'environnement virtuel

```bash
python -m venv env
```

### 3. Activer l'environnement virtuel

```bash
env\Scripts\activate
```

### 4. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 5. Le fichier .env est déjà configuré

Le fichier `.env` contient déjà les bonnes informations :
```env
DB_NAME=saascoiffure_db
DB_USER=postgres
DB_PASSWORD=admin
DB_HOST=localhost
```

### 6. Créer les tables (migrations)

```bash
python manage.py migrate
```

### 7. Créer un superutilisateur (optionnel)

```bash
python manage.py createsuperuser
```

### 8. Lancer le serveur

```bash
python manage.py runserver
```

Le backend sera accessible à : **http://localhost:8000**

## 🌐 Accès aux interfaces

- **API Swagger** : http://localhost:8000/swagger/
- **API ReDoc** : http://localhost:8000/redoc/
- **Admin Django** : http://localhost:8000/admin/

## 🧪 Test rapide de l'API

### 1. Créer un salon (inscription)

```bash
POST http://localhost:8000/api/v1/auth/register/
Content-Type: application/json

{
  "email": "admin@salon.com",
  "first_name": "Jesse",
  "last_name": "Mpiga",
  "phone": "+241066123456",
  "password": "Admin123!",
  "password_confirm": "Admin123!",
  "salon_name": "Salon Mireille",
  "salon_address": "Avenue Léon Mba, Libreville, Gabon",
  "salon_phone": "+241011234567"
}
```

### 2. Se connecter

```bash
POST http://localhost:8000/api/v1/auth/login/
Content-Type: application/json

{
  "email": "admin@salon.com",
  "password": "Admin123!"
}
```

Vous recevrez un token JWT à utiliser pour les autres requêtes.

## 📊 Commandes utiles

```bash
# Créer des migrations après modification des modèles
python manage.py makemigrations

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Lancer le shell Django
python manage.py shell

# Créer des données de test
python manage.py loaddata fixtures/sample_data.json
```

## 🔄 Réinitialiser la base de données

Si besoin de repartir à zéro :

```bash
# Supprimer toutes les données
python manage.py flush

# Ou supprimer et recréer les tables
python manage.py migrate --run-syncdb
```

## 🐛 Résolution de problèmes

### Erreur de connexion à la base de données

Vérifiez que :
1. PostgreSQL est démarré
2. La base de données `saascoiffure_db` existe
3. Les credentials dans `.env` sont corrects

### Erreur de migration

```bash
# Réinitialiser les migrations
python manage.py migrate --fake
python manage.py migrate
```

### Port 8000 déjà utilisé

```bash
# Utiliser un autre port
python manage.py runserver 8001
```

## 🔗 Intégration avec le frontend

Le frontend React (port 8080) communique avec le backend via :

```javascript
// Dans le frontend
const API_BASE_URL = 'http://localhost:8000/api/v1';
```

CORS est déjà configuré pour accepter les requêtes depuis `http://localhost:8080`.

## 📱 Tester avec Postman

1. Importer la collection Postman (si disponible)
2. Créer un environnement avec :
   - `base_url` = `http://localhost:8000/api/v1`
   - `token` = votre JWT après login

---

**Made in Gabon** 🇬🇦 by Jesse Mpiga
