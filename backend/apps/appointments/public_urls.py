"""
Public URLs for booking (no authentication required)
"""
from django.urls import path
from .public_views import (
    PublicBookingView,
    PublicCheckClientView,
    PublicAvailableSlotsView,
)

urlpatterns = [
    path('create/', PublicBookingView.as_view(), name='public-booking-create'),
    path('check-client/', PublicCheckClientView.as_view(), name='public-check-client'),
    path('available-slots/', PublicAvailableSlotsView.as_view(), name='public-available-slots'),
]
