"""
URLs de proyectos → prefijo: /api/proyectos/
"""

from django.urls import path
from .views import (
    ProyectoListCreateView,
    ProyectoDetailView,
    EstadisticasView,
    LineaInvestigacionListView,
)

urlpatterns = [
    path("",                  ProyectoListCreateView.as_view(), name="proyecto-list-create"),
    path("<int:pk>/",         ProyectoDetailView.as_view(),     name="proyecto-detail"),
    path("estadisticas/",     EstadisticasView.as_view(),       name="proyecto-estadisticas"),
    path("lineas/",           LineaInvestigacionListView.as_view(), name="lineas-investigacion"),
]
