# 📘 Use Cases Fonctionnels – Application SaaS de Gestion de Salons de Coiffure

**Auteur : MPIGA-ODOUMBA JESSE**  
**Ingénieur IA & Big Data**

---

## 🎯 Objectif du document

Ce document décrit **l’intégralité des cas d’utilisation (Use Cases)** de l’application, **module par module**, avec un niveau de détail suffisant pour permettre à un outil comme **Claude Code** (ou toute équipe de développement) de :
- comprendre rapidement le métier
- implémenter les fonctionnalités sans ambiguïté
- respecter la logique multi-tenant

---

## 🏢 Module 1 – Gestion des Salons (Tenant)

### UC-1.1 : Création d’un salon
**Acteur** : Administrateur système / Onboarding automatique  
**Description** : Création d’un nouveau salon (tenant) dans la plateforme.

**Flux principal** :
1. Le système reçoit les informations du salon
2. Création du salon avec un identifiant unique
3. Initialisation des paramètres par défaut
4. Création du compte administrateur du salon

**Règles métier** :
- Un salon = un tenant unique
- Les données sont isolées dès la création

---

### UC-1.2 : Configuration du salon
**Acteur** : Admin du salon

**Fonctionnalités** :
- Nom du salon
- Horaires d’ouverture
- Devise
- Fuseau horaire
- Logo et identité visuelle

---

## 👥 Module 2 – Gestion des Employés

### UC-2.1 : Ajouter un employé
**Acteur** : Admin du salon

**Flux** :
1. Saisie des informations employé
2. Attribution d’un rôle
3. Association automatique au salon

**Rôles possibles** :
- Admin
- Coiffeur
- Réceptionniste

---

### UC-2.2 : Gestion des permissions

- Accès aux modules selon le rôle
- Restriction des actions sensibles

---

## 👤 Module 3 – Gestion des Clients (Clients finaux)

### UC-3.1 : Création d’un client
**Acteur** : Employé / Admin

**Données** :
- Nom
- Téléphone
- Email
- Préférences

---

### UC-3.2 : Historique client

- Historique des rendez-vous
- Services consommés
- Notes internes

---

## ✂️ Module 4 – Gestion des Services

### UC-4.1 : Création d’un service

**Paramètres** :
- Nom du service
- Durée
- Prix
- Catégorie

**Règles** :
- Les services sont propres à chaque salon

---

### UC-4.2 : Tarification dynamique

- Prix variable selon employé
- Promotions temporaires

---

## 📅 Module 5 – Gestion des Rendez-vous (RDV)

### UC-5.1 : Création d’un rendez-vous

**Acteur** : Employé / Client (optionnel)

**Flux** :
1. Sélection du client
2. Choix du service
3. Choix de l’employé
4. Vérification des disponibilités
5. Confirmation

---

### UC-5.2 : Modification / Annulation

- Respect des règles du salon
- Notifications automatiques

---

## 💳 Module 6 – Paiements et Facturation

### UC-6.1 : Encaissement

**Modes** :
- Sur place
- En ligne

---

### UC-6.2 : Historique financier

- Liste des paiements
- Statut
- Rapports simples

---

## ⚙️ Module 7 – Paramètres & Personnalisation

### UC-7.1 : Configuration métier

- RDV obligatoire ou non
- Paiement avant / après service
- Durée par défaut

---

## 🔐 Module 8 – Sécurité & Multi-tenant

### UC-8.1 : Isolation des données

- Toutes les requêtes filtrées par salon
- Aucune donnée inter-salon

---

## 📊 Module 9 – Tableaux de bord & Statistiques

### UC-9.1 : Dashboard salon

- RDV du jour
- Chiffre d’affaires
- Activité employés

---

## 🧠 Module 10 – Évolutions futures (prévu)

- Notifications WhatsApp / SMS
- Application mobile
- IA : prévision d’affluence

---

## 🧪 11. Use Cases Techniques (API Endpoints)

### Exemple – Module Rendez-vous

**Endpoint** : `POST /api/appointments/`  
**Description** : Créer un rendez-vous

- Auth : JWT requis
- Scope : Salon courant

---

**Endpoint** : `GET /api/appointments/`  
**Description** : Lister les RDV du salon

---

**Endpoint** : `PUT /api/appointments/{id}/`  
**Description** : Modifier un RDV

---

## 🧑‍💼 12. User Stories (Format Agile)

### Module RDV

- **US-1** : En tant qu’*employé*, je veux créer un rendez-vous afin d’organiser mon planning.
- **US-2** : En tant qu’*admin*, je veux voir tous les RDV du salon pour suivre l’activité.
- **US-3** : En tant qu’*client*, je veux modifier un RDV afin de m’adapter à mon emploi du temps.

---

### Module Clients

- **US-4** : En tant qu’*employé*, je veux consulter l’historique d’un client pour mieux le servir.

---

## 🔄 13. Contrats API (Request / Response)

### Exemple – Création RDV

**Request**
```json
{
  "client_id": "uuid",
  "service_id": "uuid",
  "employee_id": "uuid",
  "start_time": "2026-02-01T10:00:00"
}
```

**Response**
```json
{
  "id": "uuid",
  "status": "confirmed",
  "duration": 45
}
```

---

## 🗂️ 14. State Management par Module (Frontend)

### Principe

Chaque module possède son propre store.

### Exemple

- `useAppointmentStore`
- `useClientStore`
- `useEmployeeStore`

**Responsabilités** :
- données
- loading
- erreurs
- synchronisation API

---

## 🚦 15. Priorisation Fonctionnelle (MVP vs V2)

### 🎯 MVP (obligatoire)

- Authentification
- Gestion salon
- Employés
- Clients
- Services
- Rendez-vous
- Paiement basique

---

### 🚀 V2 (évolutions)

- Paiement en ligne avancé
- Notifications WhatsApp / SMS
- Statistiques avancées
- Application mobile
- IA (prévision, recommandations)

---

## ✅ Conclusion

Ce document constitue désormais :
- un **référentiel fonctionnel**
- un **guide technique API**
- une **base agile**
- un **support direct pour le développement automatisé**

Il est prêt à être utilisé par Claude Code ou toute équipe de développement.

---

**Auteur : MPIGA-ODOUMBA JESSE**  
**Ingénieur IA & Big Data**