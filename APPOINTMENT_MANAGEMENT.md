# Système de Gestion des Rendez-vous - Documentation

## Vue d'ensemble

Le système de gestion des rendez-vous permet à tous les employés du salon de gérer les rendez-vous de manière cohérente et logique. Chaque action suit des règles de transition de statut strictes pour garantir l'intégrité des données.

## Actions Disponibles

### 1. **Confirmer** (`confirm`)
- **Statut requis**: `PENDING` (En attente)
- **Nouveau statut**: `CONFIRMED` (Confirmé)
- **Qui peut le faire**: Tous les employés
- **Cas d'usage**: Confirmer un rendez-vous pris en ligne ou par téléphone

### 2. **Démarrer** (`start`)
- **Statut requis**: `PENDING` ou `CONFIRMED`
- **Nouveau statut**: `IN_PROGRESS` (En cours)
- **Qui peut le faire**: Tous les employés
- **Cas d'usage**: Marquer qu'un client est arrivé et que le service a commencé

### 3. **Terminer** (`complete`)
- **Statut requis**: `PENDING`, `CONFIRMED`, ou `IN_PROGRESS`
- **Nouveau statut**: `COMPLETED` (Terminé)
- **Qui peut le faire**: Tous les employés
- **Cas d'usage**: Marquer qu'un rendez-vous est terminé

### 4. **Annuler** (`cancel`)
- **Statut requis**: Tout sauf `COMPLETED` ou `CANCELLED`
- **Nouveau statut**: `CANCELLED` (Annulé)
- **Qui peut le faire**: Tous les employés
- **Paramètres**: `reason` (optionnel) - raison de l'annulation
- **Cas d'usage**: Annuler un rendez-vous à la demande du client ou pour d'autres raisons

### 5. **Reporter** (`reschedule`)
- **Statut requis**: Tout sauf `COMPLETED` ou `CANCELLED`
- **Nouveau statut**: `PENDING` (retour en attente)
- **Qui peut le faire**: Tous les employés
- **Paramètres**: 
  - `date` (requis) - nouvelle date au format YYYY-MM-DD
  - `time` (requis) - nouvelle heure au format HH:MM
- **Validation**: Vérifie la disponibilité du créneau
- **Cas d'usage**: Déplacer un rendez-vous à une autre date/heure

### 6. **Déplacer** (`move`)
- **Statut requis**: Tout sauf `COMPLETED` ou `CANCELLED`
- **Statut**: Inchangé
- **Qui peut le faire**: Tous les employés
- **Paramètres**: `employee_id` (requis) - ID du nouvel employé
- **Validation**: Vérifie la disponibilité du nouvel employé
- **Cas d'usage**: Réassigner un rendez-vous à un autre coiffeur

## Flux de Statuts

```
PENDING (En attente)
    ↓ confirm
CONFIRMED (Confirmé)
    ↓ start
IN_PROGRESS (En cours)
    ↓ complete
COMPLETED (Terminé) [FINAL]

À tout moment (sauf COMPLETED/CANCELLED):
    → cancel → CANCELLED [FINAL]
    → reschedule → PENDING
    → move (même statut)
```

## Endpoints Backend

Tous les endpoints suivent le pattern: `/api/v1/appointments/{id}/{action}/`

- `POST /api/v1/appointments/{id}/confirm/`
- `POST /api/v1/appointments/{id}/start/`
- `POST /api/v1/appointments/{id}/complete/`
- `POST /api/v1/appointments/{id}/cancel/`
  - Body: `{ "reason": "Raison optionnelle" }`
- `POST /api/v1/appointments/{id}/reschedule/`
  - Body: `{ "date": "2026-02-10", "time": "14:30" }`
- `POST /api/v1/appointments/{id}/move/`
  - Body: `{ "employee_id": 2 }`

## Réponses API

Toutes les actions retournent:
```json
{
  "success": true,
  "message": "Message de confirmation",
  "appointment": { /* Objet rendez-vous complet */ }
}
```

En cas d'erreur:
```json
{
  "success": false,
  "error": "Message d'erreur explicite"
}
```

## Hooks Frontend

```typescript
// Hooks disponibles
const confirmAppointment = useConfirmAppointment();
const startAppointment = useStartAppointment();
const completeAppointment = useCompleteAppointment();
const cancelAppointment = useCancelAppointment();
const rescheduleAppointment = useRescheduleAppointment();
const moveAppointment = useMoveAppointment();

// Utilisation
await confirmAppointment.mutateAsync(appointmentId);
await rescheduleAppointment.mutateAsync({ 
  id: appointmentId, 
  date: '2026-02-10', 
  time: '14:30' 
});
await moveAppointment.mutateAsync({ 
  id: appointmentId, 
  employeeId: 2 
});
```

## Composants UI

### RescheduleDialog
```tsx
<RescheduleDialog
  appointmentId={apt.id}
  currentDate={apt.date}
  currentTime={apt.start_time}
  open={rescheduleDialog.open}
  onOpenChange={(open) => setRescheduleDialog({ ...rescheduleDialog, open })}
/>
```

### MoveDialog
```tsx
<MoveDialog
  appointmentId={apt.id}
  currentEmployeeId={apt.employee}
  open={moveDialog.open}
  onOpenChange={(open) => setMoveDialog({ ...moveDialog, open })}
/>
```

## Permissions (À venir)

Le système est actuellement accessible à tous les employés authentifiés. Les permissions granulaires seront implémentées via Django pour permettre:

- **Admin**: Toutes les actions
- **Coiffeur**: Gérer ses propres rendez-vous + confirmer/démarrer/terminer
- **Réceptionniste**: Créer, confirmer, reporter, déplacer (pas annuler)

### Configuration Django (Prochaine étape)

```python
# apps/core/permissions.py
class CanManageAppointments(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.role == 'ADMIN':
            return True
        if view.action in ['confirm', 'start', 'complete']:
            return request.user.role in ['COIFFEUR', 'RECEPTIONNISTE']
        if view.action in ['cancel']:
            return request.user.role == 'ADMIN'
        return False
```

## Validation et Sécurité

1. **Validation des transitions**: Chaque action vérifie que le statut actuel permet l'action
2. **Vérification de disponibilité**: Reporter et déplacer vérifient que le nouveau créneau/employé est disponible
3. **Traçabilité**: Les actions de report et déplacement ajoutent des notes automatiques
4. **Isolation par tenant**: Toutes les actions sont limitées au salon de l'utilisateur

## Exemple d'utilisation complète

```tsx
// Dans le menu d'actions d'un rendez-vous
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreVertical className="w-4 h-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    {/* Voir détails */}
    <DropdownMenuItem asChild>
      <Link to={`/appointments/${apt.id}`}>
        Voir détails
      </Link>
    </DropdownMenuItem>
    
    {/* Confirmer (si PENDING) */}
    {apt.status === 'PENDING' && (
      <DropdownMenuItem onClick={() => handleQuickAction(apt.id, 'confirm')}>
        <CheckCircle className="w-4 h-4 mr-2" />
        Confirmer
      </DropdownMenuItem>
    )}
    
    {/* Démarrer (si PENDING ou CONFIRMED) */}
    {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
      <DropdownMenuItem onClick={() => handleQuickAction(apt.id, 'start')}>
        <PlayCircle className="w-4 h-4 mr-2" />
        Démarrer
      </DropdownMenuItem>
    )}
    
    {/* Terminer (si pas déjà terminé) */}
    {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
      <DropdownMenuItem onClick={() => handleQuickAction(apt.id, 'complete')}>
        <CheckCircle className="w-4 h-4 mr-2" />
        Marquer terminé
      </DropdownMenuItem>
    )}
    
    <DropdownMenuSeparator />
    
    {/* Reporter */}
    {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
      <DropdownMenuItem onClick={() => openRescheduleDialog(apt)}>
        <CalendarClock className="w-4 h-4 mr-2" />
        Reporter
      </DropdownMenuItem>
    )}
    
    {/* Déplacer */}
    {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
      <DropdownMenuItem onClick={() => openMoveDialog(apt)}>
        <ArrowRightLeft className="w-4 h-4 mr-2" />
        Déplacer
      </DropdownMenuItem>
    )}
    
    <DropdownMenuSeparator />
    
    {/* Annuler */}
    {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
      <DropdownMenuItem 
        onClick={() => handleQuickAction(apt.id, 'cancel')}
        className="text-destructive"
      >
        <XCircle className="w-4 h-4 mr-2" />
        Annuler
      </DropdownMenuItem>
    )}
  </DropdownMenuContent>
</DropdownMenu>
```

## Notes Importantes

1. **Historique**: Toutes les modifications (report, déplacement) sont enregistrées dans le champ `notes`
2. **Notifications**: Les toasts informent l'utilisateur du succès ou de l'échec de chaque action
3. **Rafraîchissement**: Toutes les mutations invalident automatiquement le cache React Query pour mettre à jour l'interface
4. **Validation côté serveur**: Toutes les règles sont appliquées côté backend pour garantir la sécurité
