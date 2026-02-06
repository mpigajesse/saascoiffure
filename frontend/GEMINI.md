# GEMINI.md

## Vue d'ensemble du projet

Ce projet est une application front-end pour **NaoService by MPJ**, une solution SaaS de gestion de salons de coiffure. L'application est développée avec **React** et **TypeScript**, en utilisant **Vite** comme outil de build. L'interface utilisateur est construite avec **shadcn-ui** et **Tailwind CSS**, et elle utilise une variété de bibliothèques de l'écosystème React, notamment **React Router** pour le routage, **TanStack Query** pour la récupération de données et **React Hook Form** pour les formulaires. L'interface utilisateur présente de nombreuses animations personnalisées et un style dynamique, tirant parti des puissantes capacités de personnalisation de Tailwind CSS et de `tailwindcss-animate`.

L'application comporte deux parties principales :

*   **Un site web public** qui permet aux clients de consulter les services, de prendre rendez-vous et de contacter le salon.
*   **Un tableau de bord d'administration** qui permet aux propriétaires de salon de gérer leur entreprise, y compris les clients, les services, les employés, les rendez-vous et les paiements.

La base de code est bien structurée, avec une séparation claire des préoccupations. Elle utilise de manière extensive **React Context** pour gérer l'état global de l'application (par exemple, l'authentification, les informations sur le locataire et le thème), tandis que **TanStack Query** gère l'état du serveur, la récupération et la mise en cache des données. Les interactions avec l'API sont gérées de manière robuste via un client `axios` centralisé avec des intercepteurs pour l'authentification et le rafraîchissement des tokens.

## Construction et exécution

Pour commencer avec le projet, vous devez avoir **Node.js** et **npm** installés.

1.  **Installer les dépendances :**

    ```bash
    npm install
    ```

2.  **Exécuter le serveur de développement :**

    ```bash
    npm run dev
    ```

    Cela démarrera le serveur de développement Vite à l'adresse `http://localhost:8080`.

3.  **Construire l'application :**

    ```bash
    npm run build
    ```

    Cela créera une version prête pour la production dans le répertoire `dist`.

4.  **Exécuter les tests :**

    ```bash
    npm run test
    ```

## Conventions de développement

*   **Styling :** Le projet utilise **Tailwind CSS** pour le stylage, avec une préférence pour les classes utilitaires. Il comprend de nombreuses personnalisations telles qu'une palette de couleurs complète définie via des variables CSS (prenant en charge la thématisation, y compris un thème de barre latérale dédié), des familles de polices personnalisées (`Space Grotesk`, `Lora`, `Space Mono`), des ombres portées personnalisées et des images d'arrière-plan. Un large éventail d'utilitaires `keyframes` et `animation` personnalisés sont définis et utilisés via le plugin `tailwindcss-animate` pour créer une interface utilisateur dynamique et visuellement riche. Le mode sombre est pris en charge via une stratégie de classe (`class`).
*   **Composants :** L'interface utilisateur est construite avec **shadcn-ui**, qui fournit un ensemble de composants accessibles et personnalisables.
*   **Gestion de l'état :**
    *   **État global de l'application :** Géré avec **React Context** (par exemple, `AuthContext`, `TenantContext`). Ceci est utilisé pour les données à l'échelle de l'application qui ne proviennent pas nécessairement du serveur ou qui changent rarement.
    *   **État du serveur et récupération de données :** Géré par **TanStack Query**. Ceci est utilisé pour gérer les données récupérées de l'API, fournissant une mise en cache, un rafraîchissement en arrière-plan et une gestion automatique de l'état pour les états de chargement/erreur. Les hooks `useQuery` et `useMutation` sont largement utilisés, intégrant la gestion des `queryKey` et l'invalidation automatique du cache (`queryClient.invalidateQueries`) après les modifications de données.
*   **Routage :** Le routage est géré par **React Router**. Les routes sont principalement définies dans le fichier `src/App.tsx`, séparant les routes publiques et les routes du tableau de bord d'administration.
*   **Interaction avec l'API :**
    *   **Client HTTP :** `axios` est utilisé pour toutes les requêtes HTTP.
    *   **`apiClient` :** Une instance `axios` centralisée inclut des intercepteurs de requête pour attacher automatiquement les tokens `Bearer` (à partir de `localStorage`) pour l'authentification. Ses intercepteurs de réponse gèrent les erreurs `401 Unauthorized` en essayant de rafraîchir l'`access_token` en utilisant un `refresh_token`. Si le rafraîchissement du token échoue, il efface les tokens et redirige vers la page de connexion.
    *   **`publicApiClient` :** Une instance `axios` distincte pour les requêtes non authentifiées, qui ne gère pas les tokens ni les redirections `401`, adaptée aux routes publiques.
    *   **Gestion des erreurs :** Un utilitaire `getErrorMessage` fournit une extraction cohérente des messages d'erreur conviviaux à partir des réponses de l'API.
    *   **Couche de service :** Les appels API sont encapsulés dans des fichiers de service dédiés (par exemple, `auth.service.ts`, `services.service.ts`) situés dans `src/services`, favorisant une séparation propre des préoccupations. Ces services utilisent l'`apiClient` et une configuration `API_ENDPOINTS` centralisée (`src/config/api.ts`).
*   **TypeScript :** Le projet utilise TypeScript, mais avec une configuration de strictesse délibérément assouplie (par exemple, `strict: false`, `noImplicitAny: false`, `noUnusedLocals: false`, `noUnusedParameters: false`, `strictNullChecks: false`). Cela implique une approche plus indulgente de la vérification de type pendant le développement.
*   **Linting :** Le projet utilise **ESLint** (configuré dans `eslint.config.js`) avec `typescript-eslint`, `eslint-plugin-react-hooks` et `eslint-plugin-react-refresh` pour appliquer la qualité du code et les meilleures pratiques React.
*   **Tests :** **Vitest** est le framework de test, configuré avec un environnement `jsdom` pour des tests similaires à ceux du navigateur. Il utilise des API globales (`globals: true`) et un fichier de configuration (`src/test/setup.ts`). Les fichiers de test sont identifiés par les suffixes `.{test,spec}.{ts,tsx}` dans le répertoire `src`.
*   **Structure des fichiers :** Le répertoire `src` est organisé par fonctionnalité, avec des répertoires séparés pour `components`, `pages`, `contexts`, `hooks`, `lib` et `services`.
*   **Alias :** Le projet utilise un alias de chemin `@` pour faire référence au répertoire `src` pour des importations plus propres.
