"""
Main URL Configuration for SaaS Coiffure
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from rest_framework.routers import SimpleRouter
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Import ViewSets
from apps.clients.views import ClientViewSet
from apps.employees.views import EmployeeViewSet, PublicEmployeeViewSet
from apps.services.views import ServiceViewSet, ServiceCategoryViewSet, PublicServiceViewSet, PublicServiceCategoryViewSet
from apps.appointments.views import AppointmentViewSet
from apps.payments.views import PaymentViewSet
from apps.core.views import SalonViewSet, PublicSalonView
from apps.core.views_openinghours import SalonOpeningHourViewSet

# API Documentation
schema_view = get_schema_view(
    openapi.Info(
        title="SaaS Coiffure API",
        default_version='v1',
        description="API de gestion de salons de coiffure multi-tenant",
        contact=openapi.Contact(email="contact@saascoiffure.ga"),
        license=openapi.License(name="Proprietary"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# Main API Router
router = SimpleRouter()
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'services/categories', ServiceCategoryViewSet, basename='service-category')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'salons', SalonViewSet, basename='salon')
router.register(r'opening-hours', SalonOpeningHourViewSet, basename='openinghour')

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # API v1 - Auth (separate because it uses different views)
    path('api/v1/auth/', include('apps.accounts.urls')),
    
    # API v1 - Public endpoints (no auth required)
    path('api/v1/public/salon/<slug:slug>/', PublicSalonView.as_view(), name='public-salon'),
    path('api/v1/public/salon/<slug:salon_slug>/services/', 
         PublicServiceViewSet.as_view({'get': 'list'}), name='public-services'),
    path('api/v1/public/salon/<slug:salon_slug>/services/<int:pk>/', 
         PublicServiceViewSet.as_view({'get': 'retrieve'}), name='public-service-detail'),
    path('api/v1/public/salon/<slug:salon_slug>/categories/', 
         PublicServiceCategoryViewSet.as_view({'get': 'list'}), name='public-categories'),
    path('api/v1/public/salon/<slug:salon_slug>/employees/', 
         PublicEmployeeViewSet.as_view({'get': 'list'}), name='public-employees'),
    
    # API v1 - Public booking endpoints (no auth required)
    path('api/v1/public/booking/', include('apps.appointments.public_urls')),
    
    # API v1 - All other endpoints via main router
    path('api/v1/', include(router.urls)),
]

# Media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
