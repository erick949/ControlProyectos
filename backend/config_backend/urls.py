from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView


# Endpoint de prueba para verificar la conexión con React
def api_test_status(request):
    return JsonResponse({
        "status": "success",
        "message": "¡Conexión exitosa entre Django Backend y React Frontend!",
        "version": "1.0.0"
    })




urlpatterns = [
    # Admin de Django
    path("admin/", admin.site.urls),
    path('api/status/', api_test_status),
    # Apps de la API
    path("api/auth/",      include("usuarios.urls.auth_urls")),
    path("api/usuarios/",  include("usuarios.urls.usuario_urls")),
    path("api/proyectos/", include("proyectos.urls")),

    # Documentación OpenAPI
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/",   SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/",  SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
