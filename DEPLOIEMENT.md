# Déployer la démo publique (gratuit, tout sur Render)

`render.yaml` décrit deux services gratuits, sans carte bancaire ni base externe :

| Service | Nom Render | Ce qu'il héberge |
|---|---|---|
| Web Service (Python) | `naoservice-api` | API Django, base SQLite sur le disque éphémère |
| Static Site | `naoservice` | frontend Vite (`frontend/`) |

**Pourquoi SQLite :** le disque gratuit de Render est effacé à chaque mise en veille (15 min
sans visite). Au réveil, `migrate` puis `seed_demo` recréent le salon fictif. La démo revient
donc toute seule à son état initial : ce qu'un visiteur modifie disparaît, et il n'y a ni base
externe à entretenir ni base gratuite qui expire. Le premier chargement après une veille prend
environ 30 à 60 s.

## Mise en place

1. Render → *New* → *Blueprint* → ce dépôt (Render lit `render.yaml`).
2. Saisir la même valeur pour `DEMO_PASSWORD` (API) et `VITE_DEMO_PASSWORD` (frontend). Elle
   est **affichée** sur la page de connexion : n'en choisir aucune qui serve ailleurs.
3. Adresses : `https://naoservice.onrender.com` (démo) et
   `https://naoservice-api.onrender.com` (API). Si Render attribue d'autres noms, reporter
   l'adresse du frontend dans `CORS_ALLOWED_ORIGINS` / `CSRF_TRUSTED_ORIGINS_EXTRA` et celle de
   l'API dans `VITE_API_BASE_URL`.
4. Vérifier : `…/api/v1/public/salon/salon-mireille/services/` renvoie 7 prestations.

## Nom de domaine (facultatif)

Render → service `naoservice` → *Settings* → *Custom Domains*, puis l'enregistrement CNAME
indiqué chez le fournisseur du domaine. Ajouter ce domaine aux variables CORS/CSRF de l'API.

## Comptes de démonstration

Tous en `@demo.naoservice.ga`, mot de passe `DEMO_PASSWORD` :
`mireille` (administratrice), `grace`, `junior`, `prisca` (coiffeur·ses), `sandra` (accueil).

Vitrine publique du salon : `/s/salon-mireille`.
