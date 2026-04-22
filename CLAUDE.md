# CLAUDE.md

Ce fichier fournit le contexte aux sessions Claude Code travaillant sur ce dépôt.

## Aperçu du projet

**NaoService by MPJ** — Solution SaaS multi-tenant de gestion de salons de coiffure, Made in Gabon.

Monorepo unifié contenant :
- `backend/` — API Django 5 + Django REST Framework + PostgreSQL
- `frontend/` — Application React 18 + TypeScript + Vite
- `tunnel/` — Scripts Cloudflare Tunnel pour exposition publique (dev/prod)

## Stack technique

### Backend (`backend/`)
- **Framework** : Django 5.0.1, DRF 3.14
- **Base de données** : PostgreSQL (via psycopg2)
- **Auth** : JWT (djangorestframework-simplejwt), Argon2
- **Docs API** : drf-yasg (Swagger / ReDoc)
- **Tests** : pytest, pytest-django, factory-boy
- **Qualité** : black, flake8, isort

Apps Django (`backend/apps/`) :
- `core` — utilitaires partagés, isolation multi-tenant
- `accounts` — utilisateurs, authentification, permissions
- `employees` — coiffeurs et personnel du salon
- `clients` — clientèle du salon
- `services` — prestations proposées (avec galerie d'images)
- `appointments` — rendez-vous et planning
- `payments` — paiements et facturation

### Frontend (`frontend/`)
- **Build** : Vite 7, React 18, TypeScript 5.8
- **UI** : Tailwind CSS + shadcn/ui (Radix UI), Framer Motion
- **État serveur** : TanStack Query
- **Routage** : React Router DOM 6
- **Formulaires** : React Hook Form + Zod
- **HTTP** : Axios
- **Tests** : Vitest, Testing Library, jsdom
- **Gestionnaire** : bun (bun.lockb présent) ou npm

### Tunnel (`tunnel/`)
- Scripts PowerShell pour Cloudflare Tunnel (front-proxy + back-proxy)
- Permet exposition publique en développement

## Commandes usuelles

### Backend
```bash
cd backend
python -m venv env
env\Scripts\activate              # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver        # http://localhost:8000
pytest                            # tests
```

### Frontend
```bash
cd frontend
bun install                       # ou npm install
bun run dev                       # http://localhost:5173
bun run build
bun run test
bun run lint
```

### Tunnel
```powershell
cd tunnel
./Launch-Tunnels.ps1
```

## Architecture & conventions

### Multi-tenant
Isolation par salon : chaque utilisateur est rattaché à un salon via `accounts`. Voir `ISOLATION_MULTI_TENANT.md` pour la stratégie de filtrage.

### Permissions custom
Système de permissions granulaire documenté dans `CUSTOM_PERMISSIONS.md` et `PERMISSIONS_SYSTEM.md`. Audit récent dans `PERMISSIONS_AUDIT.md`.

### Rendez-vous
Workflow de gestion (états, actions, notifications) détaillé dans `APPOINTMENT_MANAGEMENT.md`.

### API
- Documentation interactive : `/swagger/` et `/redoc/` (drf-yasg)
- Détails endpoints : `backend/API_DOCUMENTATION.md`
- Intégration frontend : `frontend/MIGRATION_API.md`, `frontend/STATUS_API.md`

## Documentation de référence (racine)

- `projet_application_web_saa_s_de_gestion_de_salons_de_coiffure.md` — spécification produit
- `use_cases_fonctionnels_application_saa_s_salons_de_coiffure.md` — cas d'usage
- `regles_universelles_de_developpement_projet_saa_s_salons_de_coiffure.md` — règles projet
- `AGENTS.md` — instructions pour agents IA
- `SESSION_SUMMARY.md` — résumé de la dernière session

## Règles importantes

1. **Ne jamais commit** les fichiers `.env`, `env/` (venv), `node_modules/`, `dist/`, `media/`
2. **Multi-tenant** : tout nouveau modèle lié à un salon doit filtrer par `salon` dans les querysets
3. **Permissions** : toute nouvelle vue API doit déclarer ses `permission_classes` explicites
4. **Tests** : viser 80% de couverture (back + front)
5. **Migrations Django** : toujours vérifier `python manage.py makemigrations --dry-run` avant commit
6. **Langue** : interface utilisateur et docs en **français**, code et identifiants en **anglais**
