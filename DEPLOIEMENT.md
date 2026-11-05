# Déployer la démo publique (gratuit)

Trois services gratuits, sans carte bancaire :

| Rôle | Service | Ce qu'il héberge |
|---|---|---|
| Base de données | **Neon** (PostgreSQL) | les données du salon de démo, persistantes |
| API Django | **Render** (Web Service gratuit) | `backend/`, décrit par `render.yaml` |
| Frontend | **Vercel** | `frontend/` (Vite) |

> Render met le service en veille après 15 min sans visite : la première
> requête suivante prend ~30 s. Le reste du temps, la démo répond normalement.

## 1. Base Neon

1. https://neon.tech → *New project* → nom `naoservice-demo`, région Europe (Frankfurt).
2. Copier la *connection string* (format `postgresql://…?sslmode=require`).

## 2. API sur Render

1. https://render.com → *New* → *Blueprint* → choisir ce dépôt. Render lit `render.yaml`.
2. Renseigner les variables demandées :
   - `DATABASE_URL` : la chaîne Neon ;
   - `DEMO_PASSWORD` : mot de passe des comptes de démo (il sera **affiché** sur la page de
     connexion — n'en choisir aucun que tu utilises ailleurs) ;
   - `CORS_ALLOWED_ORIGINS` et `CSRF_TRUSTED_ORIGINS_EXTRA` : l'URL Vercel du frontend
     (à compléter après l'étape 3, ex. `https://naoservice.vercel.app`).
3. Au démarrage, Render lance `migrate`, puis `seed_demo` (salon « Salon Mireille »,
   équipe, clientes, prestations avec photos, rendez-vous et paiements — tout fictif), puis
   `gunicorn`. L'adresse de l'API ressemble à `https://naoservice-api.onrender.com`.
4. Vérifier : `https://naoservice-api.onrender.com/api/v1/public/salon/salon-mireille/services/`
   doit renvoyer 7 prestations.

## 3. Frontend sur Vercel

1. https://vercel.com → *Add New* → *Project* → ce dépôt, **Root Directory : `frontend`**
   (framework Vite détecté). `frontend/vercel.json` renvoie toutes les routes vers l'appli.
2. Variables d'environnement :
   - `VITE_API_BASE_URL` = l'URL Render (sans `/api/v1` ni barre finale) ;
   - `VITE_DEMO_EMAIL` = `mireille@demo.naoservice.ga` ;
   - `VITE_DEMO_PASSWORD` = la même valeur que `DEMO_PASSWORD` sur Render.
3. Déployer, puis reporter l'URL Vercel dans les deux variables CORS/CSRF de Render.

## Nom de domaine (facultatif)

Dans Vercel : *Settings → Domains* → ajouter le domaine, puis créer chez le fournisseur du
domaine l'enregistrement CNAME indiqué. Ajouter aussi ce domaine aux variables CORS/CSRF.

## Comptes de démonstration

Tous en `@demo.naoservice.ga`, mot de passe `DEMO_PASSWORD` :
`mireille` (administratrice), `grace`, `junior`, `prisca` (coiffeur·ses), `sandra` (accueil).

Vitrine publique du salon : `/s/salon-mireille`.
