"""
Vistas de la app proyectos.

GET    /api/proyectos/                  → listar proyectos (filtros: linea, estado, search, investigador)
POST   /api/proyectos/                  → crear proyecto   (solo investigador)
GET    /api/proyectos/<id>/             → detalle
PUT    /api/proyectos/<id>/             → actualizar completo   (jefe o propietario)
PATCH  /api/proyectos/<id>/             → actualizar parcial    (jefe o propietario)
DELETE /api/proyectos/<id>/             → eliminar             (solo jefe)
GET    /api/proyectos/estadisticas/     → métricas del dashboard
GET    /api/proyectos/lineas/           → catálogo de líneas de investigación
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from usuarios.permissions import EsJefe, EsInvestigador, EsJefeOPropietario
from .models import Proyecto, LineaInvestigacion
from .serializers import (
    ProyectoListSerializer,
    ProyectoCreateUpdateSerializer,
    EstadisticasSerializer,
    LineaInvestigacionSerializer,
)


class ProyectoListCreateView(APIView):
    """
    Lista proyectos con filtros opcionales, o crea uno nuevo.
    - Jefe: ve todos los proyectos.
    - Investigador: solo ve los suyos.
    """

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @extend_schema(
        parameters=[
            OpenApiParameter("search", OpenApiTypes.STR, description="Búsqueda por nombre, línea o investigador"),
            OpenApiParameter("linea", OpenApiTypes.STR, description="Filtrar por línea de investigación"),
            OpenApiParameter("estado", OpenApiTypes.STR, description="Filtrar por estado: Activo | Inactivo"),
            OpenApiParameter("investigador", OpenApiTypes.INT, description="ID del investigador (solo jefe)"),
            OpenApiParameter("mis_proyectos", OpenApiTypes.BOOL, description="true → solo proyectos propios"),
        ],
        responses=ProyectoListSerializer(many=True),
        summary="Listar proyectos",
        tags=["Proyectos"],
    )
    def get(self, request):
        user = request.user
        qs = Proyecto.objects.select_related("investigador").all()

        # Investigadores solo ven sus propios proyectos
        if user.rol == "investigador":
            qs = qs.filter(investigador=user)
        else:
            # Jefe puede filtrar por investigador específico
            investigador_id = request.query_params.get("investigador")
            if investigador_id:
                qs = qs.filter(investigador_id=investigador_id)

            mis = request.query_params.get("mis_proyectos", "").lower()
            if mis in ("true", "1"):
                qs = qs.filter(investigador=user)

        # Filtros comunes
        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                models_Q(nombre__icontains=search)
                | models_Q(linea__icontains=search)
                | models_Q(investigador__nombre__icontains=search)
            )

        linea = request.query_params.get("linea", "").strip()
        if linea:
            qs = qs.filter(linea__icontains=linea)

        estado = request.query_params.get("estado", "").strip()
        if estado and estado != "Todos":
            qs = qs.filter(estado=estado)

        serializer = ProyectoListSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)

    @extend_schema(
        request=ProyectoCreateUpdateSerializer,
        responses={201: ProyectoListSerializer},
        summary="Crear proyecto",
        tags=["Proyectos"],
    )
    def post(self, request):
        # Jefe también puede crear proyectos (para registrar en nombre de un investigador)
        serializer = ProyectoCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # El investigador es el usuario autenticado, a menos que el jefe especifique otro
        investigador = request.user
        if request.user.rol == "jefe":
            inv_id = request.data.get("investigador")
            if inv_id:
                from usuarios.models import Usuario
                try:
                    investigador = Usuario.objects.get(pk=inv_id, rol="investigador")
                except Usuario.DoesNotExist:
                    return Response(
                        {"investigador": "Investigador no encontrado."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        proyecto = serializer.save(investigador=investigador)
        return Response(
            ProyectoListSerializer(proyecto, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class ProyectoDetailView(APIView):
    """Detalle, actualización y eliminación de un proyecto."""

    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [IsAuthenticated, EsJefeOPropietario]

    def get_object(self, pk):
        try:
            obj = Proyecto.objects.select_related("investigador").get(pk=pk)
            self.check_object_permissions(self.request, obj)
            return obj
        except Proyecto.DoesNotExist:
            return None

    @extend_schema(responses=ProyectoListSerializer, summary="Detalle de proyecto", tags=["Proyectos"])
    def get(self, request, pk):
        proyecto = self.get_object(pk)
        if proyecto is None:
            return Response({"detail": "No encontrado."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProyectoListSerializer(proyecto, context={"request": request}).data)

    @extend_schema(request=ProyectoCreateUpdateSerializer, responses=ProyectoListSerializer, summary="Actualizar proyecto", tags=["Proyectos"])
    def put(self, request, pk):
        proyecto = self.get_object(pk)
        if proyecto is None:
            return Response({"detail": "No encontrado."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProyectoCreateUpdateSerializer(proyecto, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response(ProyectoListSerializer(updated, context={"request": request}).data)

    @extend_schema(request=ProyectoCreateUpdateSerializer, responses=ProyectoListSerializer, summary="Actualización parcial", tags=["Proyectos"])
    def patch(self, request, pk):
        proyecto = self.get_object(pk)
        if proyecto is None:
            return Response({"detail": "No encontrado."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProyectoCreateUpdateSerializer(proyecto, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response(ProyectoListSerializer(updated, context={"request": request}).data)

    @extend_schema(responses={204: None}, summary="Eliminar proyecto", tags=["Proyectos"])
    def delete(self, request, pk):
        if request.user.rol != "jefe":
            return Response({"detail": "Solo el Jefe puede eliminar proyectos."}, status=status.HTTP_403_FORBIDDEN)
        proyecto = self.get_object(pk)
        if proyecto is None:
            return Response({"detail": "No encontrado."}, status=status.HTTP_404_NOT_FOUND)
        if proyecto.pdf:
            proyecto.pdf.delete(save=False)
        proyecto.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EstadisticasView(APIView):
    """
    Devuelve estadísticas globales para el Dashboard.
    - Jefe: estadísticas de todos los proyectos.
    - Investigador: estadísticas de sus propios proyectos.
    """

    @extend_schema(responses=EstadisticasSerializer, summary="Estadísticas del dashboard", tags=["Proyectos"])
    def get(self, request):
        user = request.user
        qs = Proyecto.objects.all()

        if user.rol == "investigador":
            qs = qs.filter(investigador=user)

        activos = qs.filter(estado=Proyecto.ESTADO_ACTIVO).count()
        totales = qs.count()
        con_pdf = qs.exclude(pdf="").exclude(pdf__isnull=True).count()
        investigadores = qs.values("investigador").distinct().count()

        data = {
            "totales": totales,
            "activos": activos,
            "inactivos": totales - activos,
            "investigadores": investigadores,
            "con_pdf": con_pdf,
        }
        return Response(EstadisticasSerializer(data).data)


class LineaInvestigacionListView(APIView):
    """Devuelve el catálogo de líneas de investigación activas."""

    @extend_schema(
        responses=LineaInvestigacionSerializer(many=True),
        summary="Catálogo de líneas de investigación",
        tags=["Proyectos"],
    )
    def get(self, request):
        lineas = LineaInvestigacion.objects.filter(activa=True)
        # Si no hay líneas en BD, devuelve las del mockData como fallback
        if not lineas.exists():
            fallback = [
                "Inteligencia Artificial Aplicada",
                "Energías Renovables",
                "Biotecnología Molecular",
                "Nanomateriales y Nanotecnología",
            ]
            return Response([{"id": None, "nombre": n, "activa": True} for n in fallback])
        return Response(LineaInvestigacionSerializer(lineas, many=True).data)


# Importación diferida para evitar circular imports en el filtro de búsqueda
from django.db.models import Q as models_Q
