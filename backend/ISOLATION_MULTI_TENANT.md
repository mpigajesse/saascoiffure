# Architecture Multi-Tenant - Isolation des Données

## 📋 Vue d'ensemble

Notre système utilise une **isolation par données** (row-level), où chaque entité est rattachée à un `salon` (tenant) via une clé étrangère.

## 🏗️ Modèles

```
Salon (tenant)
├── User (rattaché au salon, sauf superusers)
├── Employee (rattaché au salon via TenantAwareModel)
├── Service (rattaché au salon via TenantAwareModel)
├── Client (rattaché au salon via TenantAwareModel)
├── Appointment (rattaché au salon via TenantAwareModel)
└── Payment (rattaché au salon via TenantAwareModel)
```

## 🔐 Principes de Sécurité

### 1. **TenantAwareModel** (Base abstraite)
- ✅ Toute entité métier DOIT hériter de `TenantAwareModel`
- ✅ Chaque enregistrement a obligatoirement un `salon_id`
- ✅ La méthode `save()` valide cette contrainte

### 2. **Middleware de Tenant** (`TenantMiddleware`)
- ✅ Injecte `request.salon` basé sur l'utilisateur authentifié
- ⚠️ **PROBLÈME**: Pour les superusers, `request.salon = None`

### 3. **Filtrage par ViewSet**
- ✅ Les ViewSets filtrent automatiquement par `request.salon`
- ⚠️ **PROBLÈME**: Cela exclut les superusers !

## 🐛 Problème Identifié

**Naomie (superuser)** ne peut pas voir les salons car :

```python
# Situation actuelle:
- Naomie: is_superuser=True, salon=None
- request.salon = None (du middleware)
- ViewSet.get_queryset() filtre par: salon__in=[None]  ❌
- Résultat: Aucun salon retourné
```

## ✅ Solution

Modifier les ViewSets pour permettre aux **superusers** de voir/gérer tous les salons :

```python
def get_queryset(self):
    user = self.request.user
    
    # Cas 1: Superuser - accès à tous les salons
    if user.is_superuser:
        return Salon.objects.all()
    
    # Cas 2: Utilisateur normal - filtré par son salon
    elif request.salon:
        return Model.objects.filter(salon=request.salon)
    
    # Cas 3: Pas authentifié
    else:
        return Model.objects.none()
```

## 📁 Fichiers à Modifier

- [ ] `apps/services/views.py` - ServiceViewSet
- [ ] `apps/employees/views.py` - EmployeeViewSet
- [ ] `apps/clients/views.py` - ClientViewSet
- [ ] `apps/appointments/views.py` - AppointmentViewSet
- [ ] `apps/payments/views.py` - PaymentViewSet
- [ ] `apps/accounts/views.py` - UserViewSet

## 🎯 Pattern à Suivre

```python
class MyViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        user = self.request.user
        
        if user.is_superuser:
            # Superusers voient tout
            return MyModel.objects.all()
        elif self.request.salon:
            # Utilisateurs normaux voient seulement leur salon
            return MyModel.objects.filter(salon=self.request.salon)
        else:
            # Pas d'accès
            return MyModel.objects.none()
```

## 🔒 Isolation Garantie

- ✅ Chaque donnée a un `salon_id` obligatoire
- ✅ Les QuerySets filtrent automatiquement par tenant
- ✅ Les superusers peuvent manager tous les tenants
- ✅ Les utilisateurs normaux ne voient que leurs données
- ✅ Les migrations de schéma ne sont pas nécessaires (données, pas schéma)

## 📝 Notes

- L'isolation est au niveau **application**, pas au niveau **base de données**
- Un backup/restore complet ne pose pas de problème d'isolation
- Les performances restent bonnes (simple filtrage SQL)
- Facilite la migration et le scaling
