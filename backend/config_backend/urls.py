from django.contrib import admin
from django.urls import path
from django.http import JsonResponse

# Endpoint de prueba para verificar la conexión con React
def api_test_status(request):
    return JsonResponse({
        "status": "success",
        "message": "¡Conexión exitosa entre Django Backend y React Frontend!",
        "version": "1.0.0"
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/status/', api_test_status),
]