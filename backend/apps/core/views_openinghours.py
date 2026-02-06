from rest_framework import viewsets, permissions
from .models_openinghours import SalonOpeningHour
from .serializers_openinghours import SalonOpeningHourSerializer
from apps.core.permissions import IsSalonAdmin

class SalonOpeningHourViewSet(viewsets.ModelViewSet):
    queryset = SalonOpeningHour.objects.all()
    serializer_class = SalonOpeningHourSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsSalonAdmin()]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return SalonOpeningHour.objects.all()
        elif hasattr(user, 'salon') and user.salon:
            return SalonOpeningHour.objects.filter(salon=user.salon)
        return SalonOpeningHour.objects.none()
