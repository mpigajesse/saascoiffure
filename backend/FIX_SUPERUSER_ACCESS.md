# Fix Multi-Tenant Isolation - Action Plan

## STATUS: EN COURS

### ✅ COMPLETED
- [x] SalonViewSet - Already handles superusers correctly (line 24-28)
- [x] Identified the root cause: request.salon = None for superusers

### 🔄 IN PROGRESS - VIEWSETS À CORRIGER

1. **ServiceViewSet** (`apps/services/views.py`)
   - Current: Uses `self.request.salon` in get_queryset
   - Problem: Superusers get `request.salon = None`
   - Fix: Add superuser check

2. **ServiceCategoryViewSet** (`apps/services/views.py`)
   - Current: Uses `ServiceCategory.objects.for_salon(self.request.salon)`
   - Problem: Same as above
   - Fix: Add superuser check

3. **EmployeeViewSet** (`apps/employees/views.py`)
   - Current: Uses `Employee.objects.for_salon(self.request.salon)`
   - Problem: Same as above
   - Fix: Add superuser check

4. **ClientViewSet** (`apps/clients/views.py`)
   - Current: Uses `Client.objects.for_salon(self.request.salon)`
   - Problem: Same as above
   - Fix: Add superuser check

5. **AppointmentViewSet** (`apps/appointments/views.py`)
   - Current: Uses `Appointment.objects.for_salon(self.request.salon)`
   - Problem: Same as above
   - Fix: Add superuser check

6. **PaymentViewSet** (`apps/payments/views.py`)
   - Current: Uses `Payment.objects.for_salon(self.request.salon)`
   - Problem: Same as above
   - Fix: Add superuser check

7. **UserViewSet** (`apps/accounts/views.py`)
   - Current: Uses `User.objects.filter(salon=self.request.salon)`
   - Problem: Same as above
   - Fix: Add superuser check

### 📋 FIX TEMPLATE

```python
def get_queryset(self):
    user = self.request.user
    
    # Superusers see all data across all salons
    if user.is_superuser:
        return MyModel.objects.all()
    
    # Regular users see only their salon's data
    if self.request.salon:
        return MyModel.objects.filter(salon=self.request.salon)
    
    # No access
    return MyModel.objects.none()
```

### 🧪 TEST CHECKLIST

After fixes, test with:
- [ ] Naomie (superuser) can GET /api/v1/salons/
- [ ] Naomie (superuser) can GET /api/v1/services/
- [ ] Naomie (superuser) can GET /api/v1/employees/
- [ ] Naomie (superuser) can GET /api/v1/clients/
- [ ] Naomie (superuser) can GET /api/v1/appointments/
- [ ] Regular user sees only their salon's data
- [ ] Regular user cannot modify other salons' data
