# Guide Technique : Architecture Tunnel Stable SaasCoiffure

Ce document détaille l'architecture finale, implémentée et opérationnelle, permettant l'accès sécurisé à l'application SaasCoiffure depuis n'importe où via Cloudflare.

---

## 🌍 État Actuel du Système

L'application est configurée pour utiliser deux **Cloudflare Workers** stables qui agissent comme des proxys intelligents vers vos serveurs locaux via des tunnels éphémères.

- **Frontend stable** : `https://tunnel-front-naoservices.workers.dev`
- **Backend stable** : `https://tunnel-back-naoservices.workers.dev`

---

## ⚙️ Configuration Détaillée du Backend (Django)

Pour que Django accepte les requêtes venant du tunnel Cloudflare sans erreurs de sécurité (CSRF, CORS), les fichiers suivants ont été modifiés :

### 1. `backend/config/settings.py` (Paramètres de sécurité)
- **Autorisation des hôtes** :
  ```python
  ALLOWED_HOSTS = [
      'localhost', '127.0.0.1',
      'tunnel-front-naoservices.workers.dev',
      'tunnel-back-naoservices.workers.dev',
      '.workers.dev',
      '.trycloudflare.com',
  ]
  ```
- **Confiance envers le Proxy Cloudflare** :
  ```python
  USE_X_FORWARDED_HOST = True
  SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
  ```
- **Gestion du CSRF et CORS** :
  ```python
  CSRF_TRUSTED_ORIGINS = [
      "https://tunnel-front-naoservices.workers.dev",
      "https://tunnel-back-naoservices.workers.dev"
  ]
  CORS_ALLOWED_ORIGIN_REGEXES = [
      r"^https://.*\.workers\.dev$",
      r"^https://.*\.trycloudflare\.com$"
  ]
  ```

---

## ⚙️ Configuration Détaillée du Frontend (React/Vite)

La configuration frontend a été ajustée pour que toutes les requêtes passent par le proxy du tunnel de manière transparente.

### 1. `.env` (Point critique)
Le paramètre `VITE_API_BASE_URL` a été configuré en **chemin relatif** :
```env
VITE_API_BASE_URL=/api
```
**Pourquoi ?** En utilisant `/api`, le navigateur envoie la requête à l'URL du Worker Frontend. Le Worker détecte ce préfixe et le redirige automatiquement vers le Worker Backend. Cela évite toutes les erreurs "CORS" (Cross-Origin Resource Sharing).

### 2. `frontend/vite.config.ts` (Support HMR)
Le serveur de développement est configuré pour accepter les connexions WebSockets venant du tunnel pour que le rechargement automatique (HMR) continue de fonctionner :
```typescript
const isTunnel = process.env.TUNNEL === "true";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: isTunnel
      ? {
          overlay: false,
          clientPort: 443,
          protocol: "wss",
        }
      : {
          overlay: false,
        },
  },
  // ...
}));
```

---

## 🏗️ Fonctionnement des Proxys (Workers Cloudflare)

Chaque Worker contient une logique spécifique en TypeScript (`tunnel/frontend-proxy/index.ts` et `tunnel/backend-proxy/index.ts`).

### Le Worker Frontend (Le "Cœur" du routage)
Il effectue trois tâches cruciales :
1. **Routage API** : Si l'URL commence par `/api`, il re-déploie la requête vers `tunnel-back-naoservices.workers.dev`.
2. **Support WebSocket** : Il gère les headers `Upgrade: websocket` pour que Vite ne perde pas la connexion.
3. **Ré-écriture d'URLs** : Il s'assure que les headers `Host` sont corrects pour que Django reçoive la bonne information.

### Le Worker Backend
- Il agit comme un tunnel brut vers le port `8000`.
- **Logique de Timeout** : Il attend jusqu'à 60 secondes pour permettre à Django de traiter les requêtes.

---

## 🚀 Utilisation du Script d'Automatisation

Le script `tunnel/Launch-Tunnels.ps1` est le seul point d'entrée nécessaire.

**Déroulement interne :**
1. Lance `cloudflared` (Front sur port 8080, Back sur port 8000).
2. Attend et extrait les URLs éphémères `*.trycloudflare.com` des logs.
3. Injecte ces URLs comme **Secrets** (`TUNNEL_URL`) dans les Workers correspondants via `wrangler`.
4. Déploie les Workers.

**Commande :**
```powershell
powershell -ExecutionPolicy Bypass -File d:\saascoiffure\tunnel\Launch-Tunnels.ps1
```

**Mode Tunnel pour Vite :**
Pour activer le support HMR via tunnel, lancez le frontend avec :
```bash
TUNNEL=true npm run dev
```

---

## 🛠️ Notes Techniques
- **Architecture Multi-tenant** : Chaque donnée est associée à un salon (tenant).
- **Authentification** : Utilise JWT. Le superuser (naoadmin@gmail.com) peut utiliser le header `X-Salon-Id` pour spécifier le salon cible.
- **Ports** :
  - Frontend Vite : 8080
  - Backend Django : 8000

---
*Document technique SaasCoiffure - NaoServices*
