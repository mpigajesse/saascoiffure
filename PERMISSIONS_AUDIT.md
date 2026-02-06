# Audit Complet des Permissions par Module

## 📋 Vue d'ensemble

Ce document liste **TOUTES** les permissions possibles pour chaque module de l'application SaaS Coiffure.

---

## 🗓️ Module RENDEZ-VOUS (Appointments)

### Permissions Actuelles ✅
- ✅ `can_create_appointments` - Créer des rendez-vous
- ✅ `can_view_all_appointments` - Voir tous les rendez-vous
- ✅ `can_confirm_appointments` - Confirmer les rendez-vous
- ✅ `can_start_appointments` - Démarrer les rendez-vous
- ✅ `can_complete_appointments` - Terminer les rendez-vous
- ✅ `can_cancel_appointments` - Annuler les rendez-vous
- ✅ `can_reschedule_appointments` - Reporter les rendez-vous
- ✅ `can_move_appointments` - Déplacer vers un autre coiffeur
- ✅ `can_delete_appointments` - Supprimer définitivement

### Permissions Manquantes ❌
- ❌ `can_edit_appointments` - Modifier les détails d'un RDV (notes, service, etc.)
- ❌ `can_view_own_appointments` - Voir uniquement ses propres RDV (pour coiffeurs)
- ❌ `can_export_appointments` - Exporter la liste des RDV (CSV, PDF)
- ❌ `can_send_appointment_reminders` - Envoyer des rappels aux clients

**Recommandation** : Ajouter `can_edit_appointments` et `can_export_appointments`

---

## 👥 Module CLIENTS

### Permissions Actuelles ✅
- ✅ `can_create_clients` - Créer des clients
- ✅ `can_view_clients` - Voir la liste des clients
- ✅ `can_edit_clients` - Modifier les informations
- ✅ `can_delete_clients` - Supprimer des clients

### Permissions Manquantes ❌
- ❌ `can_view_client_history` - Voir l'historique complet d'un client
- ❌ `can_export_clients` - Exporter la liste des clients
- ❌ `can_merge_clients` - Fusionner des doublons
- ❌ `can_send_client_messages` - Envoyer des messages/SMS aux clients

**Recommandation** : Ajouter `can_export_clients` et `can_send_client_messages`

---

## ✂️ Module SERVICES

### Permissions Actuelles ✅
- ✅ `can_create_services` - Créer des services
- ✅ `can_view_services` - Voir la liste des services
- ✅ `can_edit_services` - Modifier les services
- ✅ `can_delete_services` - Supprimer des services

### Permissions Manquantes ❌
- ❌ `can_manage_service_categories` - Gérer les catégories de services
- ❌ `can_set_service_prices` - Modifier les prix (permission séparée)
- ❌ `can_publish_services` - Publier/dépublier sur le site public

**Recommandation** : Les permissions actuelles sont suffisantes pour l'instant

---

## 💰 Module PAIEMENTS (Payments)

### Permissions Actuelles ✅
- ✅ `can_view_payments` - Voir l'historique des paiements
- ✅ `can_create_payments` - Enregistrer des paiements

### Permissions Manquantes ❌
- ❌ `can_edit_payments` - Modifier un paiement existant
- ❌ `can_delete_payments` - Supprimer un paiement
- ❌ `can_refund_payments` - Effectuer des remboursements
- ❌ `can_view_payment_reports` - Voir les rapports financiers
- ❌ `can_export_payments` - Exporter les données de paiement
- ❌ `can_manage_payment_methods` - Gérer les moyens de paiement acceptés

**Recommandation** : Ajouter `can_refund_payments`, `can_view_payment_reports`, et `can_export_payments`

---

## 👨‍💼 Module EMPLOYÉS (Employees)

### Permissions Actuelles ✅
- ✅ `can_view_employees` - Voir la liste des employés
- ✅ `can_create_employees` - Créer des employés
- ✅ `can_edit_employees` - Modifier les informations
- ✅ `can_delete_employees` - Supprimer des employés

### Permissions Manquantes ❌
- ❌ `can_manage_employee_permissions` - Gérer les permissions des employés
- ❌ `can_view_employee_schedule` - Voir les plannings
- ❌ `can_edit_employee_schedule` - Modifier les plannings
- ❌ `can_manage_employee_roles` - Changer les rôles
- ❌ `can_view_employee_performance` - Voir les statistiques de performance

**Recommandation** : Ajouter `can_manage_employee_permissions` et `can_edit_employee_schedule`

---

## ⚙️ Module PARAMÈTRES (Settings)

### Permissions Actuelles ✅
- ✅ `can_edit_salon_settings` - Modifier les paramètres du salon

### Permissions Manquantes ❌
- ❌ `can_edit_salon_info` - Modifier les infos de base (nom, adresse, etc.)
- ❌ `can_edit_salon_hours` - Modifier les horaires d'ouverture
- ❌ `can_edit_salon_theme` - Modifier le thème/couleurs
- ❌ `can_manage_salon_integrations` - Gérer les intégrations (WhatsApp, etc.)
- ❌ `can_view_salon_analytics` - Voir les statistiques du salon
- ❌ `can_manage_notifications` - Gérer les paramètres de notifications

**Recommandation** : Diviser `can_edit_salon_settings` en permissions plus granulaires

---

## 📊 Module RAPPORTS & STATISTIQUES (À créer)

### Permissions Nécessaires ❌
- ❌ `can_view_dashboard` - Voir le tableau de bord
- ❌ `can_view_reports` - Voir les rapports
- ❌ `can_export_reports` - Exporter les rapports
- ❌ `can_view_analytics` - Voir les analyses détaillées
- ❌ `can_view_revenue_stats` - Voir les statistiques de revenus

**Recommandation** : Créer ce module de permissions

---

## 📱 Module SITE PUBLIC (À créer)

### Permissions Nécessaires ❌
- ❌ `can_manage_public_site` - Gérer le site public
- ❌ `can_edit_public_content` - Modifier le contenu public
- ❌ `can_manage_public_bookings` - Gérer les réservations en ligne
- ❌ `can_respond_to_contacts` - Répondre aux messages de contact

**Recommandation** : Créer ce module de permissions

---

## 📦 Module INVENTAIRE/PRODUITS (À créer si applicable)

### Permissions Nécessaires ❌
- ❌ `can_view_inventory` - Voir l'inventaire
- ❌ `can_manage_inventory` - Gérer l'inventaire
- ❌ `can_create_products` - Créer des produits
- ❌ `can_edit_products` - Modifier des produits
- ❌ `can_delete_products` - Supprimer des produits
- ❌ `can_manage_suppliers` - Gérer les fournisseurs

**Recommandation** : À implémenter si gestion de stock nécessaire

---

## 🎯 RÉSUMÉ DES RECOMMANDATIONS

### Priorité HAUTE 🔴

1. **Rendez-vous**
   - Ajouter `can_edit_appointments`
   - Ajouter `can_export_appointments`

2. **Paiements**
   - Ajouter `can_refund_payments`
   - Ajouter `can_view_payment_reports`
   - Ajouter `can_export_payments`

3. **Employés**
   - Ajouter `can_manage_employee_permissions`
   - Ajouter `can_edit_employee_schedule`

### Priorité MOYENNE 🟡

4. **Clients**
   - Ajouter `can_export_clients`
   - Ajouter `can_send_client_messages`

5. **Paramètres**
   - Diviser `can_edit_salon_settings` en :
     - `can_edit_salon_info`
     - `can_edit_salon_hours`
     - `can_edit_salon_theme`

### Priorité BASSE 🟢

6. **Rapports & Statistiques**
   - Créer le module complet

7. **Site Public**
   - Créer le module complet

---

## 📝 PLAN D'IMPLÉMENTATION

### Phase 1 : Compléter les modules existants

```python
# Ajouter dans apps/employees/permissions_model.py

class EmployeePermission(models.Model):
    # ... champs existants ...
    
    # RENDEZ-VOUS - Nouvelles permissions
    can_edit_appointments = models.BooleanField(default=None, null=True, blank=True)
    can_export_appointments = models.BooleanField(default=None, null=True, blank=True)
    
    # PAIEMENTS - Nouvelles permissions
    can_edit_payments = models.BooleanField(default=None, null=True, blank=True)
    can_delete_payments = models.BooleanField(default=None, null=True, blank=True)
    can_refund_payments = models.BooleanField(default=None, null=True, blank=True)
    can_view_payment_reports = models.BooleanField(default=None, null=True, blank=True)
    can_export_payments = models.BooleanField(default=None, null=True, blank=True)
    
    # CLIENTS - Nouvelles permissions
    can_export_clients = models.BooleanField(default=None, null=True, blank=True)
    can_send_client_messages = models.BooleanField(default=None, null=True, blank=True)
    
    # EMPLOYÉS - Nouvelles permissions
    can_manage_employee_permissions = models.BooleanField(default=None, null=True, blank=True)
    can_edit_employee_schedule = models.BooleanField(default=None, null=True, blank=True)
    
    # PARAMÈTRES - Permissions granulaires
    can_edit_salon_info = models.BooleanField(default=None, null=True, blank=True)
    can_edit_salon_hours = models.BooleanField(default=None, null=True, blank=True)
    can_edit_salon_theme = models.BooleanField(default=None, null=True, blank=True)
```

### Phase 2 : Créer les nouveaux modules

```python
# RAPPORTS
can_view_dashboard = models.BooleanField(default=None, null=True, blank=True)
can_view_reports = models.BooleanField(default=None, null=True, blank=True)
can_export_reports = models.BooleanField(default=None, null=True, blank=True)
can_view_analytics = models.BooleanField(default=None, null=True, blank=True)
can_view_revenue_stats = models.BooleanField(default=None, null=True, blank=True)

# SITE PUBLIC
can_manage_public_site = models.BooleanField(default=None, null=True, blank=True)
can_edit_public_content = models.BooleanField(default=None, null=True, blank=True)
can_manage_public_bookings = models.BooleanField(default=None, null=True, blank=True)
```

---

## ✅ PERMISSIONS ACTUELLEMENT IMPLÉMENTÉES

**Total : 23 permissions**

### Par Module
- Rendez-vous : 9 permissions ✅
- Clients : 4 permissions ✅
- Services : 4 permissions ✅
- Paiements : 2 permissions ✅
- Employés : 4 permissions ✅
- Paramètres : 1 permission ✅ (trop générale)

---

## 🎯 PERMISSIONS RECOMMANDÉES À AJOUTER

**Total recommandé : +18 permissions**

### Priorité Haute (+11)
- Rendez-vous : +2
- Paiements : +3
- Employés : +2
- Clients : +2
- Paramètres : +2

### Priorité Moyenne (+7)
- Rapports : +5
- Site Public : +2

---

## 📊 TOTAL FINAL RECOMMANDÉ

**41 permissions** pour couvrir tous les besoins de l'application

Cela permettra une gestion très granulaire des accès tout en restant maintenable.
