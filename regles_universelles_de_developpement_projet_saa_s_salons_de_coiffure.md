# 📜 FICHIER DE RÈGLES UNIVERSELLES DE DÉVELOPPEMENT

**Projet : Application Web SaaS – Gestion de Salons de Coiffure**  
**Auteur : MPIGA-ODOUMBA JESSE**  
**Profil : Ingénieur IA & Big Data**

---

## 🎯 Objectif du fichier

Ce fichier définit les **règles obligatoires** à respecter **à chaque ligne de code**, quel que soit l’outil, l’IDE, l’IA (Claude, ChatGPT, Copilot, etc.) ou le développeur.

👉 Toute implémentation **DOIT** respecter ces règles.

---

## 🧠 1. RèGLES FONDAMENTALES (NON NÉGOCIABLES)

1. Le projet est **multi-tenant** (multi-salons) par conception.
2. **Aucune donnée ne doit exister sans être liée à un salon**.
3. Aucun accès direct à la base de données.
4. Toute logique métier est centralisée côté backend.
5. Le frontend ne contient **aucune logique métier critique**.

---

## 🏢 2. RÈGLES MULTI-TENANT

- Chaque requête backend doit être **contextualisée par le salon**.
- Le salon actif est déterminé par l’utilisateur authentifié.
- Aucune requête ne doit retourner des données hors salon.
- Interdiction absolue de jointure inter-salon.

---

## 🔐 3. RÈGLES DE SÉCURITÉ

- Authentification obligatoire (JWT).
- Vérification des permissions à chaque endpoint.
- Jamais de données sensibles dans le frontend.
- Les ID sont traités comme non fiables côté client.

---

## ⚙️ 4. RÈGLES BACKEND (DJANGO)

- Utilisation exclusive de l’ORM Django.
- Interdiction de SQL brut sauf exception documentée.
- Chaque modèle métier doit hériter d’un modèle tenant-aware.
- Les migrations sont obligatoires et versionnées.

---

## 🎨 5. RÈGLES FRONTEND (REACT + TYPESCRIPT)

- TypeScript strict obligatoire.
- Aucun `any` sans justification.
- Composants petits, lisibles et réutilisables.
- Un module = un domaine métier.

---

## 🔄 6. RÈGLES API

- API REST cohérente et versionnée.
- Contrats Request/Response respectés strictement.
- Pas de logique métier dans les serializers.
- Gestion centralisée des erreurs.

---

## 🗂️ 7. RÈGLES DE STATE MANAGEMENT

- Un store par module métier.
- Pas de state global inutile.
- Les stores ne contiennent pas de logique métier.

---

## 🧪 8. RÈGLES DE QUALITÉ

- Code lisible > code court.
- Pas de duplication.
- Tests pour toute logique critique.
- Logging clair et exploitable.

---

## 🚀 9. RÈGLES D’ÉVOLUTIVITÉ

- Tout nouveau module doit être indépendant.
- Aucun couplage fort entre modules.
- Toute évolution doit être backward-compatible (si possible).

---

## 🔁 10. RÈGLES CONTRE LA REDONDANCE DE CODE (DRY)

### Principe fondamental : DRY (Don’t Repeat Yourself)

- Toute logique dupliquée est considérée comme une **erreur de conception**.
- Une règle métier ne doit exister **qu’à un seul endroit**.
- Une modification ne doit jamais nécessiter plusieurs changements identiques.

### Backend (Django)

- Interdiction de dupliquer :
  - validations métier
  - règles de permissions
  - logique de filtrage multi-tenant
- Utilisation obligatoire de :
  - services métier
  - mixins
  - classes abstraites

### Frontend (React + TypeScript)

- Interdiction de dupliquer :
  - logique de fetching
  - gestion des erreurs
  - formats de données
- Utilisation obligatoire de :
  - hooks personnalisés
  - composants génériques
  - utilitaires communs

### API

- Les formats Request / Response doivent être centralisés.
- Aucun endpoint ne doit réimplémenter une logique existante.

---

## ❌ 11. INTERDICTIONS ABSOLUES

- Accès direct DB depuis le frontend.
- Données sans salon.
- Hardcoding de règles métier.
- Bypass de sécurité.

---

## ❌ 11. INTERDICTIONS ABSOLUES

- Accès direct DB depuis le frontend.
- Données sans salon.
- Hardcoding de règles métier.
- Bypass de sécurité.
- Duplication volontaire de code.

---

## ✅ 12. CHECKLIST AVANT CHAQUE COMMIT

- [ ] Le code respecte le multi-tenant
- [ ] Les permissions sont vérifiées
- [ ] Les types sont corrects
- [ ] Les contrats API sont respectés
- [ ] Aucun accès direct à la DB

---

## 🧾 13. RÈGLE FINALE

> **Si une fonctionnalité viole une seule règle de ce fichier, elle est considérée comme incorrecte, même si elle fonctionne.**

---

**Auteur : MPIGA-ODOUMBA JESSE**  
**Ingénieur IA & Big Data**

