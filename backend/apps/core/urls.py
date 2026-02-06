"""
URL Configuration for core app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SalonViewSet, PublicSalonView
from .views_openinghours import SalonOpeningHourViewSet

router = DefaultRouter()
router.register(r'salons', SalonViewSet, basename='salon')
router.register(r'opening-hours', SalonOpeningHourViewSet, basename='openinghour')

urlpatterns = [
    path('', include(router.urls)),
    # Public endpoint for salon by slug (no auth required)
    path('public/salon/<slug:slug>/', PublicSalonView.as_view(), name='public-salon'),
]
