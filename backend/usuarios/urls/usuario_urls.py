"""
URLs de gestión de usuarios → prefijo: /api/usuarios/
"""

from django.urls import path
from usuarios.views.usuario_views import (
    UsuarioListCreateView,
    UsuarioDetailView,
    ActivarUsuarioView,
)

urlpatterns = [
    path("",              UsuarioListCreateView.as_view(), name="usuario-list-create"),
    path("<int:pk>/",     UsuarioDetailView.as_view(),     name="usuario-detail"),
    path("<int:pk>/activar/", ActivarUsuarioView.as_view(), name="usuario-activar"),
]
