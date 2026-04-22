import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Shield, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

interface EmployeePermissions {
    // Rendez-vous
    can_create_appointments: boolean | null;
    can_view_all_appointments: boolean | null;
    can_confirm_appointments: boolean | null;
    can_start_appointments: boolean | null;
    can_complete_appointments: boolean | null;
    can_cancel_appointments: boolean | null;
    can_reschedule_appointments: boolean | null;
    can_move_appointments: boolean | null;
    can_delete_appointments: boolean | null;
    can_edit_appointments: boolean | null;  // NOUVEAU
    can_export_appointments: boolean | null;  // NOUVEAU
    // Clients
    can_create_clients: boolean | null;
    can_view_clients: boolean | null;
    can_edit_clients: boolean | null;
    can_delete_clients: boolean | null;
    can_export_clients: boolean | null;  // NOUVEAU
    can_send_client_messages: boolean | null;  // NOUVEAU
    // Services
    can_create_services: boolean | null;
    can_view_services: boolean | null;
    can_edit_services: boolean | null;
    can_delete_services: boolean | null;
    // Paiements
    can_view_payments: boolean | null;
    can_create_payments: boolean | null;
    can_refund_payments: boolean | null;  // NOUVEAU
    can_view_payment_reports: boolean | null;  // NOUVEAU
    can_export_payments: boolean | null;  // NOUVEAU
    // Employés
    can_view_employees: boolean | null;
    can_create_employees: boolean | null;
    can_edit_employees: boolean | null;
    can_delete_employees: boolean | null;
    can_manage_employee_permissions: boolean | null;  // NOUVEAU
    can_edit_employee_schedule: boolean | null;  // NOUVEAU
    // Paramètres
    can_edit_salon_settings: boolean | null;
    can_edit_salon_info: boolean | null;  // NOUVEAU
    can_edit_salon_hours: boolean | null;  // NOUVEAU
}

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    role: string;
    user_email: string;
}

export default function EmployeePermissionsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [permissions, setPermissions] = useState<EmployeePermissions | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchEmployeeAndPermissions();
    }, [id]);

    const fetchEmployeeAndPermissions = async () => {
        try {
            // Récupérer l'employé
            const empResponse = await apiClient.get(`/api/v1/employees/${id}/`);
            setEmployee(empResponse.data);

            // Récupérer les permissions
            const permResponse = await apiClient.get(`/api/v1/employees/${id}/permissions/`);
            setPermissions(permResponse.data.permissions);
        } catch (error) {
            console.error('Erreur:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de charger les permissions',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionChange = (key: keyof EmployeePermissions, value: boolean | null) => {
        if (!permissions) return;
        setPermissions({ ...permissions, [key]: value });
    };

    const handleSave = async () => {
        if (!permissions) return;

        setSaving(true);
        try {
            await apiClient.patch(`/api/v1/employees/${id}/permissions/`, permissions);
            toast({
                title: 'Succès',
                description: 'Permissions mises à jour avec succès',
            });
        } catch (error) {
            console.error('Erreur:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de sauvegarder les permissions',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const PermissionSwitch = ({
        label,
        description,
        permissionKey
    }: {
        label: string;
        description: string;
        permissionKey: keyof EmployeePermissions;
    }) => {
        if (!permissions) return null;

        const value = permissions[permissionKey];
        const isDefault = value === null;

        return (
            <div className="flex items-center justify-between py-3">
                <div className="space-y-0.5 flex-1">
                    <Label className="text-base font-medium">{label}</Label>
                    <p className="text-sm text-muted-foreground">{description}</p>
                    {isDefault && (
                        <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3 h-3" />
                            Utilise la permission par défaut du rôle
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {!isDefault && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePermissionChange(permissionKey, null)}
                            className="text-xs"
                        >
                            Réinitialiser
                        </Button>
                    )}
                    <Switch
                        checked={value === true}
                        onCheckedChange={(checked) => handlePermissionChange(permissionKey, checked)}
                    />
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <p>Chargement...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!employee || !permissions) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <p>Employé non trouvé</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                                <Link to={`/admin/employees/${id}`}>
                                    <ArrowLeft className="w-4 h-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold flex items-center gap-2">
                                    <Shield className="w-8 h-8" />
                                    Permissions de {employee.first_name} {employee.last_name}
                                </h1>
                                <p className="text-muted-foreground">
                                    Rôle: {employee.role} • {employee.user_email}
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button onClick={handleSave} disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </div>

                {/* Info */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex gap-2">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-900">
                                <p className="font-medium mb-1">Personnalisation des permissions</p>
                                <p>
                                    Les permissions affichées utilisent les valeurs par défaut du rôle <strong>{employee.role}</strong>.
                                    Vous pouvez les personnaliser pour cet employé spécifiquement. Les permissions non modifiées
                                    continueront d'utiliser les valeurs par défaut du rôle.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Permissions Rendez-vous */}
                <Card>
                    <CardHeader>
                        <CardTitle>Gestion des Rendez-vous</CardTitle>
                        <CardDescription>
                            Contrôle les actions sur les rendez-vous
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <PermissionSwitch
                            label="Créer des rendez-vous"
                            description="Peut créer de nouveaux rendez-vous"
                            permissionKey="can_create_appointments"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Voir tous les rendez-vous"
                            description="Peut consulter tous les rendez-vous du salon"
                            permissionKey="can_view_all_appointments"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Confirmer des rendez-vous"
                            description="Peut confirmer les rendez-vous en attente"
                            permissionKey="can_confirm_appointments"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Démarrer des rendez-vous"
                            description="Peut marquer un rendez-vous comme en cours"
                            permissionKey="can_start_appointments"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Terminer des rendez-vous"
                            description="Peut marquer un rendez-vous comme terminé"
                            permissionKey="can_complete_appointments"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Annuler des rendez-vous"
                            description="Peut annuler des rendez-vous"
                            permissionKey="can_cancel_appointments"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Reporter des rendez-vous"
                            description="Peut modifier la date/heure d'un rendez-vous"
                            permissionKey="can_reschedule_appointments"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Déplacer des rendez-vous"
                            description="Peut réassigner un rendez-vous à un autre coiffeur"
                            permissionKey="can_move_appointments"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Supprimer des rendez-vous"
                            description="Peut supprimer définitivement des rendez-vous"
                            permissionKey="can_delete_appointments"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Modifier des rendez-vous"
                            description="Peut modifier les détails d'un rendez-vous (notes, services, etc.)"
                            permissionKey="can_edit_appointments"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Exporter les rendez-vous"
                            description="Peut exporter la liste des rendez-vous (CSV, PDF)"
                            permissionKey="can_export_appointments"
                        />
                    </CardContent>
                </Card>

                {/* Permissions Clients */}
                <Card>
                    <CardHeader>
                        <CardTitle>Gestion des Clients</CardTitle>
                        <CardDescription>
                            Contrôle les actions sur les clients
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <PermissionSwitch
                            label="Créer des clients"
                            description="Peut ajouter de nouveaux clients"
                            permissionKey="can_create_clients"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Voir les clients"
                            description="Peut consulter la liste des clients"
                            permissionKey="can_view_clients"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Modifier des clients"
                            description="Peut modifier les informations des clients"
                            permissionKey="can_edit_clients"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Supprimer des clients"
                            description="Peut supprimer des clients"
                            permissionKey="can_delete_clients"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Exporter les clients"
                            description="Peut exporter la liste des clients"
                            permissionKey="can_export_clients"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Envoyer des messages"
                            description="Peut envoyer des SMS ou emails aux clients"
                            permissionKey="can_send_client_messages"
                        />
                    </CardContent>
                </Card>

                {/* Permissions Services */}
                <Card>
                    <CardHeader>
                        <CardTitle>Gestion des Services</CardTitle>
                        <CardDescription>
                            Contrôle les actions sur les services
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <PermissionSwitch
                            label="Créer des services"
                            description="Peut ajouter de nouveaux services"
                            permissionKey="can_create_services"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Voir les services"
                            description="Peut consulter la liste des services"
                            permissionKey="can_view_services"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Modifier des services"
                            description="Peut modifier les services existants"
                            permissionKey="can_edit_services"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Supprimer des services"
                            description="Peut supprimer des services"
                            permissionKey="can_delete_services"
                        />
                    </CardContent>
                </Card>

                {/* Permissions Paiements */}
                <Card>
                    <CardHeader>
                        <CardTitle>Gestion des Paiements</CardTitle>
                        <CardDescription>
                            Contrôle les actions sur les paiements
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <PermissionSwitch
                            label="Voir les paiements"
                            description="Peut consulter l'historique des paiements"
                            permissionKey="can_view_payments"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Créer des paiements"
                            description="Peut enregistrer de nouveaux paiements"
                            permissionKey="can_create_payments"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Rembourser des paiements"
                            description="Peut effectuer des remboursements"
                            permissionKey="can_refund_payments"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Voir les rapports financiers"
                            description="Peut consulter les rapports de revenus détaillés"
                            permissionKey="can_view_payment_reports"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Exporter les paiements"
                            description="Peut exporter l'historique des transactions"
                            permissionKey="can_export_payments"
                        />
                    </CardContent>
                </Card>

                {/* Permissions Employés */}
                <Card>
                    <CardHeader>
                        <CardTitle>Gestion des Employés</CardTitle>
                        <CardDescription>
                            Contrôle les actions sur les employés
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <PermissionSwitch
                            label="Voir les employés"
                            description="Peut consulter la liste des employés"
                            permissionKey="can_view_employees"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Créer des employés"
                            description="Peut ajouter de nouveaux employés"
                            permissionKey="can_create_employees"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Modifier des employés"
                            description="Peut modifier les informations des employés"
                            permissionKey="can_edit_employees"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Supprimer des employés"
                            description="Peut supprimer des employés"
                            permissionKey="can_delete_employees"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Gérer les permissions"
                            description="Peut modifier les permissions des autres employés"
                            permissionKey="can_manage_employee_permissions"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Modifier les plannings"
                            description="Peut modifier les horaires de travail des employés"
                            permissionKey="can_edit_employee_schedule"
                        />
                    </CardContent>
                </Card>

                {/* Permissions Paramètres */}
                <Card>
                    <CardHeader>
                        <CardTitle>Paramètres du Salon</CardTitle>
                        <CardDescription>
                            Contrôle l'accès aux paramètres
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PermissionSwitch
                            label="Modifier les paramètres généraux"
                            description="Peut modifier les paramètres globaux (devise, langue, etc.)"
                            permissionKey="can_edit_salon_settings"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Modifier les informations du salon"
                            description="Peut modifier le nom, l'adresse et les coordonnées du salon"
                            permissionKey="can_edit_salon_info"
                        />
                        <Separator />
                        <PermissionSwitch
                            label="Modifier les horaires d'ouverture"
                            description="Peut définir les heures d'ouverture du salon"
                            permissionKey="can_edit_salon_hours"
                        />
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                    <Button variant="outline" asChild>
                        <Link to={`/admin/employees/${id}`}>Annuler</Link>
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Enregistrement...' : 'Enregistrer les permissions'}
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
