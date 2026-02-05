"""
URL Configuration for core app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SalonViewSet

router = DefaultRouter()
router.register(r'salons', SalonViewSet, basename='salon')

urlpatterns = [
    path('', include(router.urls)),
]
