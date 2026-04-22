import { useAuth } from '@/contexts/AuthContext';

export type AppointmentAction =
    | 'create'
    | 'view'
    | 'confirm'
    | 'start'
    | 'complete'
    | 'cancel'
    | 'reschedule'
    | 'move'
    | 'update'
    | 'delete';

export interface AppointmentPermissions {
    canCreate: boolean;
    canView: boolean;
    canConfirm: boolean;
    canStart: boolean;
    canComplete: boolean;
    canCancel: boolean;
    canReschedule: boolean;
    canMove: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canPerformAction: (action: AppointmentAction, appointment?: any) => boolean;
}

/**
 * Hook pour vérifier les permissions sur les rendez-vous
 * 
 * Règles:
 * - ADMIN: Toutes les actions
 * - COIFFEUR: Gérer ses propres rendez-vous + confirmer/démarrer/terminer tous les RDV
 * - RECEPTIONNISTE: Créer, confirmer, reporter, déplacer, annuler (pas démarrer ni terminer)
 */
export function useAppointmentPermissions(appointment?: any): AppointmentPermissions {
    const { user } = useAuth();

    if (!user) {
        return {
            canCreate: false,
            canView: false,
            canConfirm: false,
            canStart: false,
            canComplete: false,
            canCancel: false,
            canReschedule: false,
            canMove: false,
            canUpdate: false,
            canDelete: false,
            canPerformAction: () => false,
        };
    }

    const role = user.role;
    const isAdmin = role === 'ADMIN';
    const isCoiffeur = role === 'COIFFEUR';
    const isReceptionniste = role === 'RECEPTIONNISTE';

    // Vérifier si le RDV appartient au coiffeur connecté
    // Utilise employee_user_id fourni par le serializer backend
    const isOwnAppointment = appointment && appointment.employee_user_id === user.id;

    // ADMIN peut tout
    if (isAdmin) {
        return {
            canCreate: true,
            canView: true,
            canConfirm: true,
            canStart: true,
            canComplete: true,
            canCancel: true,
            canReschedule: true,
            canMove: true,
            canUpdate: true,
            canDelete: true,
            canPerformAction: () => true,
        };
    }

    // RÉCEPTIONNISTE
    if (isReceptionniste) {
        return {
            canCreate: true,
            canView: true,
            canConfirm: true,
            canStart: false,  // Ne peut PAS démarrer
            canComplete: false,  // Ne peut PAS terminer
            canCancel: true,
            canReschedule: true,
            canMove: true,
            canUpdate: true,
            canDelete: false,
            canPerformAction: (action: AppointmentAction) => {
                return ['create', 'view', 'confirm', 'cancel', 'reschedule', 'move', 'update'].includes(action);
            },
        };
    }

    // COIFFEUR
    if (isCoiffeur) {
        return {
            canCreate: false,
            canView: true,
            canConfirm: true,  // Peut confirmer tous les RDV
            canStart: true,    // Peut démarrer tous les RDV
            canComplete: true, // Peut terminer tous les RDV
            canCancel: isOwnAppointment,     // Uniquement ses propres RDV
            canReschedule: isOwnAppointment, // Uniquement ses propres RDV
            canMove: isOwnAppointment,       // Uniquement ses propres RDV
            canUpdate: isOwnAppointment,     // Uniquement ses propres RDV
            canDelete: isOwnAppointment,     // Uniquement ses propres RDV
            canPerformAction: (action: AppointmentAction, apt?: any) => {
                const isOwn = apt ? apt.employee_user_id === user.id : isOwnAppointment;

                // Peut confirmer, démarrer, terminer tous les RDV
                if (['confirm', 'start', 'complete', 'view'].includes(action)) {
                    return true;
                }

                // Peut gérer uniquement ses propres RDV
                if (['cancel', 'reschedule', 'move', 'update', 'delete'].includes(action)) {
                    return isOwn;
                }

                return false;
            },
        };
    }

    // Par défaut, aucune permission
    return {
        canCreate: false,
        canView: false,
        canConfirm: false,
        canStart: false,
        canComplete: false,
        canCancel: false,
        canReschedule: false,
        canMove: false,
        canUpdate: false,
        canDelete: false,
        canPerformAction: () => false,
    };
}
