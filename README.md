# NaoService by MPJ

> Solution SaaS multi-tenant de gestion de salons de coiffure — **Made in Gabon**

Plateforme web complète permettant aux salons de coiffure de gérer leurs rendez-vous, leur clientèle, leurs employés, leurs prestations et leurs paiements depuis une interface moderne et intuitive.

---

## Table des matières

- [Aperçu](#aperçu)
- [Architecture](#architecture)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation rapide](#installation-rapide)
  - [Backend (Django)](#1-backend-django)
  - [Frontend (React)](#2-frontend-react)
  - [Tunnel Cloudflare (optionnel)](#3-tunnel-cloudflare-optionnel)
- [Structure du dépôt](#structure-du-dépôt)
- [Fonctionnalités](#fonctionnalités)
- [Documentation](#documentation)
- [Tests](#tests)
- [Scripts utilitaires](#scripts-utilitaires)
- [Contribution](#contribution)
- [Licence](#licence)

---

## Aperçu

**NaoService** est une application SaaS conçue pour digitaliser la gestion quotidienne des salons de coiffure :

- Prise de rendez-vous en ligne avec gestion de planning
- Fiches clients et historique de prestations
- Catalogue de services (avec galerie d'images)
- Gestion des employés et de leurs disponibilités
- Facturation et suivi des paiements
- Isolation multi-tenant : chaque salon accède uniquement à ses propres données

---

## Architecture

Monorepo unifié avec deux applications indépendantes et un module de tunnel :

```
┌─────────────────────┐       ┌─────────────────────┐
│   Frontend (Vite)   │ ────▶ │   Backend (Django)  │
│   React + TS + UI   │  API  │   DRF + PostgreSQL  │
└─────────────────────┘  JWT  └─────────────────────┘
           ▲                             ▲
           │                             │
           └───── Cloudflare Tunnel ─────┘
                  (exposition publique)
```

---

## Stack technique

### Backend — `backend/`

| Composant | Technologie |
|-----------|-------------|
| Framework | Django 5.0 · DRF 3.14 |
| Base de données | PostgreSQL 14+ |
| Authentification | JWT (SimpleJWT) · Argon2 |
| Documentation API | drf-yasg (Swagger / ReDoc) |
| Tests | pytest · pytest-django · factory-boy |
| Qualité | black · flake8 · isort |

### Frontend — `frontend/`

| Composant | Technologie |
|-----------|-------------|
| Build | Vite 7 · React 18 · TypeScript 5.8 |
| UI | Tailwind CSS · shadcn/ui (Radix) · Framer Motion |
| État serveur | TanStack Query |
| Routage | React Router DOM 6 |
| Formulaires | React Hook Form + Zod |
| HTTP | Axios |
| Tests | Vitest · Testing Library |

### Tunnel — `tunnel/`

Cloudflare Tunnel (front-proxy + back-proxy) pour exposer l'application en développement via un domaine public sécurisé.

---

## Prérequis

- **Python** 3.10 ou supérieur
- **Node.js** 18+ (ou **Bun** 1.0+)
- **PostgreSQL** 14+
- **Git**
- *(optionnel)* **Cloudflared** pour les tunnels

---

## Installation rapide

### 1. Backend (Django)

```bash
cd backend

# Environnement virtuel
python -m venv env
env\Scripts\activate            # Windows
source env/bin/activate         # Linux / macOS

# Dépendances
pip install -r requirements.txt

# Variables d'environnement
cp .env.example .env            # puis éditer .env

# Base de données
python manage.py migrate
python manage.py createsuperuser

# Lancement
python manage.py runserver      # http://localhost:8000
```

Documentation interactive de l'API disponible sur :
- Swagger : http://localhost:8000/swagger/
- ReDoc : http://localhost:8000/redoc/

### 2. Frontend (React)

```bash
cd frontend

# Dépendances (Bun recommandé)
bun install                     # ou : npm install

# Lancement
bun run dev                     # http://localhost:5173
```

Commandes utiles :

| Commande | Description |
|----------|-------------|
| `bun run dev` | Serveur de développement |
| `bun run build` | Build de production |
| `bun run preview` | Prévisualiser le build |
| `bun run lint` | Vérifier le code (ESLint) |
| `bun run test` | Lancer les tests |

### 3. Tunnel Cloudflare (optionnel)

```powershell
cd tunnel
./Launch-Tunnels.ps1
```

Démarre simultanément les tunnels pour le backend et le frontend.

---

## Structure du dépôt

```
saascoiffure/
├── backend/                          # API Django
│   ├── apps/
│   │   ├── core/                     # Utilitaires, multi-tenant
│   │   ├── accounts/                 # Utilisateurs, auth, permissions
│   │   ├── employees/                # Coiffeurs et personnel
│   │   ├── clients/                  # Clientèle
│   │   ├── services/                 # Prestations (+ galerie)
│   │   ├── appointments/             # Rendez-vous, planning
│   │   └── payments/                 # Paiements, facturation
│   ├── config/                       # settings, urls, wsgi, asgi
│   ├── scripts/                      # Scripts d'administration
│   ├── requirements.txt
│   └── manage.py
│
├── frontend/                         # Application React
│   ├── src/
│   │   ├── components/               # Composants UI réutilisables
│   │   ├── pages/                    # Pages / vues routées
│   │   ├── services/                 # Clients API (axios)
│   │   ├── hooks/                    # Hooks React personnalisés
│   │   ├── contexts/                 # Contextes React
│   │   ├── lib/                      # Utilitaires
│   │   └── types/                    # Types TypeScript partagés
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── tunnel/                           # Cloudflare Tunnel
│   ├── backend-proxy/
│   ├── frontend-proxy/
│   └── Launch-Tunnels.ps1
│
├── CLAUDE.md                         # Contexte pour Claude Code
├── AGENTS.md                         # Instructions pour agents IA
└── README.md                         # Ce fichier
```

---

## Fonctionnalités

### Rendez-vous
- Création, modification, annulation
- Cycle de vie complet (en attente, confirmé, terminé, annulé)
- Actions contextuelles selon le rôle utilisateur

### Gestion clients
- Fiches détaillées, historique, préférences

### Catalogue de services
- Tarification et durée configurables
- Galerie d'images par prestation
- Publication / dépublication par salon

### Employés
- Gestion des profils et plannings
- Affectation aux rendez-vous

### Paiements
- Suivi des encaissements et factures

### Sécurité & isolation
- Multi-tenant strict : chaque requête filtre les données par salon
- Permissions granulaires côté API (voir `PERMISSIONS_SYSTEM.md`)
- JWT avec rotation de refresh tokens

---

## Documentation

| Fichier | Contenu |
|---------|---------|
| `backend/API_DOCUMENTATION.md` | Endpoints REST détaillés |
| `backend/ISOLATION_MULTI_TENANT.md` | Stratégie multi-tenant |
| `APPOINTMENT_MANAGEMENT.md` | Workflow des rendez-vous |
| `PERMISSIONS_SYSTEM.md` | Système de permissions |
| `CUSTOM_PERMISSIONS.md` | Permissions personnalisées |
| `PERMISSIONS_AUDIT.md` | Audit sécurité récent |
| `frontend/MIGRATION_API.md` | Intégration API côté front |
| `projet_application_..._coiffure.md` | Spécification produit |
| `use_cases_fonctionnels_...md` | Cas d'usage fonctionnels |
| `regles_universelles_...md` | Règles de développement |

---

## Tests

### Backend
```bash
cd backend
pytest                          # Tous les tests
pytest apps/appointments        # Un module
pytest --cov                    # Avec couverture
```

### Frontend
```bash
cd frontend
bun run test                    # Mode CI
bun run test:watch              # Mode watch
```

**Objectif de couverture : 80% minimum** (backend et frontend).

---

## Scripts utilitaires

### Backend (`backend/`)
- `populate_services.py` — peupler le catalogue de services par défaut
- `populate_service_gallery.py` — importer les images de galerie
- `publish_all_services.py` — publier tous les services
- `setup_admin_salon.py` — configuration initiale d'un salon admin

### Racine
- `clear-vscode-cache.ps1` — nettoyer le cache VS Code
- `quick-clean-vscode.ps1` — nettoyage rapide

---

## Contribution

1. Créer une branche depuis `dev` : `git checkout -b feat/ma-fonctionnalite`
2. Respecter les conventions de commit : `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
3. Écrire des tests avant l'implémentation (TDD)
4. Vérifier le lint et les tests avant de pousser
5. Ouvrir une Pull Request vers `dev`

Voir `regles_universelles_de_developpement_projet_saa_s_salons_de_coiffure.md` pour le détail des règles.

---

## Licence

Propriétaire — **MPJ · Made in Gabon** · Tous droits réservés.

---

<p align="center">
  Conçu avec soin au Gabon par <strong>MPJ</strong>
</p>
