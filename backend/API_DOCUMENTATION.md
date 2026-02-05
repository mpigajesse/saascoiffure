# 📘 API Endpoints - SaaS Coiffure

Documentation complète des endpoints de l'API.

## Base URL

```
http://localhost:8000/api/v1
```

## 🔐 Authentification

### Inscription (Créer un salon)

**POST** `/auth/register/`

Crée un nouveau salon avec son administrateur.

**Body:**
```json
{
  "email": "admin@salon.com",
  "first_name": "Jean",
  "last_name": "Dupont",
  "phone": "+241066123456",
  "password": "SecurePass123",
  "password_confirm": "SecurePass123",
  "salon_name": "Salon Excellence",
  "salon_address": "Avenue Léon Mba, Libreville",
  "salon_phone": "+241011234567"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Salon créé avec succès",
  "user": {
    "id": 1,
    "email": "admin@salon.com",
    "full_name": "Jean Dupont",
    "salon_id": 1,
    "role": "ADMIN"
  }
}
```

---

### Connexion

**POST** `/auth/login/`

**Body:**
```json
{
  "email": "admin@salon.com",
  "password": "SecurePass123"
}
```

**Response 200:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "admin@salon.com",
    "full_name": "Jean Dupont",
    "role": "ADMIN",
    "salon_id": 1
  }
}
```

---

### Rafraîchir le token

**POST** `/auth/token/refresh/`

**Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### Mon profil

**GET** `/auth/users/me/`

**Headers:**
```
Authorization: Bearer {access_token}
```

---

## 👥 Clients

### Liste des clients

**GET** `/clients/`

**Query Params:**
- `is_active` (boolean) : Filtrer par statut
- `search` (string) : Recherche par nom/téléphone

**Response 200:**
```json
{
  "count": 50,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "first_name": "Marie",
      "last_name": "Mbemba",
      "full_name": "Marie Mbemba",
      "phone": "+241066111111",
      "email": "marie@email.com",
      "preferred_employee": 1,
      "preferred_employee_name": "Sophie Martin",
      "notes": "",
      "is_active": true,
      "created_at": "2026-01-15T10:30:00Z"
    }
  ]
}
```

---

### Créer un client

**POST** `/clients/`

**Body:**
```json
{
  "first_name": "Marie",
  "last_name": "Mbemba",
  "phone": "+241066111111",
  "email": "marie@email.com",
  "preferred_employee": 1,
  "notes": "Préfère les coupes courtes"
}
```

---

### Historique d'un client

**GET** `/clients/{id}/history/`

**Response 200:**
```json
{
  "success": true,
  "client": {...},
  "appointments": [
    {
      "id": 1,
      "service_name": "Coupe femme",
      "employee_name": "Sophie Martin",
      "date": "2026-02-01",
      "time": "14:00:00",
      "status": "COMPLETED"
    }
  ]
}
```

---

### Statistiques d'un client

**GET** `/clients/{id}/stats/`

**Response 200:**
```json
{
  "success": true,
  "stats": {
    "total_appointments": 15,
    "total_spent": 125000.00,
    "most_used_service": "Coupe femme",
    "most_used_service_count": 8
  }
}
```

---

## 👔 Employés

### Liste des employés

**GET** `/employees/`

**Query Params:**
- `is_available` (boolean)
- `role` (string) : ADMIN, COIFFEUR, RECEPTIONNISTE

---

### Créer un employé

**POST** `/employees/`

**Body:**
```json
{
  "email": "sophie@salon.com",
  "first_name": "Sophie",
  "last_name": "Martin",
  "phone": "+241066222222",
  "password": "Password123",
  "role": "COIFFEUR",
  "specialties": "Coupes femme, Tresses, Coloration",
  "bio": "10 ans d'expérience",
  "work_schedule": {
    "lundi": "9:00-18:00",
    "mardi": "9:00-18:00",
    "mercredi": "9:00-18:00",
    "jeudi": "9:00-18:00",
    "vendredi": "9:00-18:00",
    "samedi": "9:00-15:00"
  }
}
```

---

### Activer/Désactiver un employé

**POST** `/employees/{id}/toggle_availability/`

---

## ✂️ Services

### Liste des services

**GET** `/services/`

**Query Params:**
- `is_active` (boolean)
- `category` (int) : ID de la catégorie
- `search` (string)

**Response 200:**
```json
{
  "results": [
    {
      "id": 1,
      "name": "Coupe femme",
      "description": "Coupe classique pour femme",
      "category": 1,
      "category_name": "Coupes",
      "price": "5000.00",
      "duration": 30,
      "duration_display": "30 min",
      "image": "/media/services/coupe-femme.jpg",
      "is_active": true
    }
  ]
}
```

---

### Créer un service

**POST** `/services/`

**Body:**
```json
{
  "name": "Coupe femme",
  "description": "Coupe classique pour femme",
  "category": 1,
  "price": 5000.00,
  "duration": 30,
  "image": null
}
```

---

## 📅 Rendez-vous

### Liste des rendez-vous

**GET** `/appointments/`

**Query Params:**
- `status` (string) : PENDING, CONFIRMED, COMPLETED, CANCELLED
- `date` (date) : YYYY-MM-DD
- `employee` (int) : ID de l'employé
- `client` (int) : ID du client

---

### Créer un rendez-vous

**POST** `/appointments/`

**Body:**
```json
{
  "client": 1,
  "employee": 1,
  "service": 1,
  "date": "2026-02-10",
  "time": "14:00",
  "duration": 30,
  "notes": "Premier rendez-vous",
  "payment_method": "CASH"
}
```

---

### Rendez-vous du jour

**GET** `/appointments/today/`

**Response 200:**
```json
{
  "success": true,
  "date": "2026-02-05",
  "count": 8,
  "appointments": [...]
}
```

---

### Rendez-vous à venir

**GET** `/appointments/upcoming/`

Retourne les rendez-vous des 7 prochains jours.

---

### Vérifier disponibilité

**POST** `/appointments/check_availability/`

**Body:**
```json
{
  "employee_id": 1,
  "date": "2026-02-10",
  "time": "14:00",
  "duration": 30
}
```

**Response 200:**
```json
{
  "success": true,
  "available": true
}
```

---

### Mettre à jour le statut

**POST** `/appointments/{id}/update_status/`

**Body:**
```json
{
  "status": "COMPLETED",
  "notes": "Client satisfait"
}
```

---

## 💰 Paiements

### Liste des paiements

**GET** `/payments/`

**Query Params:**
- `status` (string) : PENDING, COMPLETED, FAILED, REFUNDED
- `method` (string) : CASH, MOBILE_MONEY, BANK_CARD
- `client` (int) : ID du client
- `start_date` (date) : YYYY-MM-DD
- `end_date` (date) : YYYY-MM-DD

---

### Créer un paiement

**POST** `/payments/`

**Body:**
```json
{
  "appointment": 1,
  "client": 1,
  "amount": 5000.00,
  "payment_method": "CASH",
  "transaction_id": "",
  "notes": ""
}
```

---

### Statistiques des paiements

**GET** `/payments/stats/`

**Query Params:**
- `start_date` (date)
- `end_date` (date)

**Response 200:**
```json
{
  "success": true,
  "period": {
    "start": "2026-02-01",
    "end": "2026-02-28"
  },
  "stats": {
    "total_amount": 500000.00,
    "total_count": 45,
    "by_method": {
      "Espèces": 300000.00,
      "Mobile Money": 200000.00
    },
    "by_status": {
      "Complété": 45,
      "En attente": 0
    }
  }
}
```

---

### Revenu journalier

**GET** `/payments/daily_revenue/`

**Query Params:**
- `date` (date) : YYYY-MM-DD (défaut: aujourd'hui)

---

### Revenu mensuel

**GET** `/payments/monthly_revenue/`

**Query Params:**
- `year` (int)
- `month` (int)

---

## 📊 Codes de statut HTTP

- `200 OK` : Succès
- `201 Created` : Ressource créée
- `204 No Content` : Suppression réussie
- `400 Bad Request` : Erreur de validation
- `401 Unauthorized` : Non authentifié
- `403 Forbidden` : Pas les permissions
- `404 Not Found` : Ressource introuvable
- `500 Internal Server Error` : Erreur serveur

---

## 🔒 Permissions

- **Public** : Création de rendez-vous, liste des services
- **Authentifié** : Lecture des données de son salon
- **Employé** : Modification des RDV et clients
- **Admin** : Création/modification/suppression de tout

---

Made in Gabon 🇬🇦
