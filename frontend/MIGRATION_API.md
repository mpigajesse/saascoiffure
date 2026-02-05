# Migration des données mockées vers l'API

## ✅ Configuration API terminée

Tous les endpoints et services sont configurés dans :
- `src/config/api.ts` - Endpoints centralisés
- `src/lib/api-client.ts` - Client HTTP avec auth
- `src/services/` - Services pour auth, services, appointments, clients, employees

## 📋 Fichiers à migrer vers l'API réelle

### Contextes (Priority: HIGH)

1. **`src/contexts/TenantContext.tsx`**
   - Utilise: `mockSalon`
   - Remplacer par: Appel API pour récupérer les informations du salon

2. **`src/contexts/AppointmentsContext.tsx`**
   - Utilise: `mockAppointments`, `mockClients`, `mockSalon`
   - Remplacer par: `appointmentsService.getAppointments()`, `clientsService.getClients()`

### Pages Admin (Priority: HIGH)

3. **`src/pages/Dashboard.tsx`**
   - Utilise: `mockDashboardStats`, `mockEmployees`
   - Remplacer par: Appels API pour statistiques et employés

4. **`src/pages/AppointmentsPage.tsx`**
   - Utilise: `mockEmployees`, `getServiceById`
   - Remplacer par: `appointmentsService`, `employeesService`, `servicesService`

5. **`src/pages/AppointmentDetailPage.tsx`**
   - Utilise: `getServiceById`
   - Remplacer par: `appointmentsService.getAppointment(id)`

6. **`src/pages/ClientsPage.tsx`**
   - Utilise: `mockEmployees`, `mockServices`, `mockSalon`
   - Remplacer par: `clientsService`, `employeesService`, `servicesService`

7. **`src/pages/EmployeesPage.tsx`**
   - Utilise: `mockEmployees`
   - Remplacer par: `employeesService.getEmployees()`

8. **`src/pages/ServicesPage.tsx`**
   - Utilise: `mockServices`, `mockCategories`
   - Remplacer par: `servicesService.getServices()`, `servicesService.getCategories()`

9. **`src/pages/ServiceDetailPage.tsx`**
   - Utilise: `mockServices`, `mockCategories`
   - Remplacer par: `servicesService.getService(id)`

10. **`src/pages/EditServicePage.tsx`**
    - Utilise: `getServiceById`, `getCategoryById`, `mockCategories`
    - Remplacer par: `servicesService`

11. **`src/pages/PaymentsPage.tsx`**
    - Utilise: `mockPayments`, `mockDashboardStats`
    - Remplacer par: Services payments API

12. **`src/pages/SettingsPage.tsx`**
    - Utilise: `mockSalon`
    - Remplacer par: API salon settings

### Pages Publiques (Priority: MEDIUM)

13. **`src/pages/public/HomePage.tsx`**
    - Utilise: `mockServices`, `mockCategories`
    - Remplacer par: `servicesService.getServices({ is_active: true })`

14. **`src/pages/public/ServicesPage.tsx`**
    - Utilise: `mockServices`, `mockCategories`
    - Remplacer par: `servicesService`

15. **`src/pages/public/ServiceDetailPage.tsx`**
    - Utilise: `getServiceById`, `getCategoryById`
    - Remplacer par: `servicesService.getService(id)`

16. **`src/pages/public/BookingPage.tsx`**
    - Utilise: `mockServices`, `mockEmployees`, `mockSalon`
    - Remplacer par: `servicesService`, `employeesService`, `appointmentsService`

### Auth Pages (Priority: MEDIUM)

17. **`src/pages/LoginPage.tsx`**
    - Utilise: `mockSalon` (pour affichage)
    - Remplacer par: `authService.login()` + TenantContext

18. **`src/pages/ForgotPasswordPage.tsx`**
    - Utilise: `mockSalon` (pour affichage)
    - Remplacer par: TenantContext

### Composants (Priority: LOW)

19. **`src/components/dashboard/AppointmentCard.tsx`**
    - Utilise: `getEmployeeById`, `getServiceById`
    - Les données viendront déjà du contexte/API parent

20. **`src/components/layout/DashboardLayout.tsx`**
    - Utilise: `mockSalon`
    - Remplacer par: TenantContext

## 🎯 Plan de migration recommandé

### Phase 1: Authentification & Contextes
1. Mettre à jour AuthContext pour utiliser `authService`
2. Mettre à jour TenantContext pour récupérer les données du salon
3. Tester login/logout

### Phase 2: Dashboard & Pages Admin
1. Migrer Dashboard avec statistiques réelles
2. Migrer AppointmentsPage et AppointmentDetailPage
3. Migrer ClientsPage et EmployeesPage
4. Migrer ServicesPage et ServiceDetailPage

### Phase 3: Pages Publiques
1. Migrer HomePage (services publics)
2. Migrer BookingPage (réservation avec API)
3. Migrer pages de détails

### Phase 4: Nettoyage
1. Supprimer toutes les références à mockData
2. Supprimer les fonctions utilitaires (getById, etc.)
3. Tests de bout en bout

## 🔧 Exemple de migration

**Avant (avec mock):**
```typescript
import { mockServices } from '@/data/mockData';

const services = mockServices;
```

**Après (avec API):**
```typescript
import { servicesService } from '@/services';
import { useQuery } from '@tanstack/react-query';

const { data: services, isLoading } = useQuery({
  queryKey: ['services'],
  queryFn: () => servicesService.getServices()
});
```

## ⚠️ Notes importantes

1. Installer TanStack Query si pas déjà fait: `npm install @tanstack/react-query`
2. Configurer QueryClient dans App.tsx
3. Gérer les états de chargement (loading, error)
4. Ajouter des messages d'erreur utilisateur avec toast
5. Implémenter la pagination pour les listes

## 🚀 Prochaines étapes

1. ✅ API Backend configuré et fonctionnel
2. ✅ Services frontend créés
3. ⏳ Migration progressive des pages
4. ⏳ Tests d'intégration frontend-backend
