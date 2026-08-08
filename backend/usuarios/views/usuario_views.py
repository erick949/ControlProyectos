"""
Vistas de gestión de usuarios/investigadores.

GET  /api/usuarios/                → listar investigadores  (solo jefe)
POST /api/usuarios/                → crear investigador     (solo jefe)
GET  /api/usuarios/<id>/           → detalle               (jefe o propietario)
PUT  /api/usuarios/<id>/           → actualizar            (jefe o propietario)
PATCH /api/usuarios/<id>/          → actualizar parcial    (jefe o propietario)
DELETE /api/usuarios/<id>/         → eliminar              (solo jefe)
POST /api/usuarios/<id>/activar/   → activar/desactivar    (solo jefe)
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema

from usuarios.models import Usuario
from usuarios.serializers import UsuarioListSerializer, UsuarioDetailSerializer
from usuarios.permissions import EsJefe, EsJefeOPropietario


class UsuarioListCreateView(APIView):
    """Lista todos los investigadores o crea uno nuevo (solo jefe)."""

    permission_classes = [IsAuthenticated, EsJefe]

    @extend_schema(responses=UsuarioListSerializer(many=True), summary="Listar investigadores", tags=["Usuarios"])
    def get(self, request):
        qs = Usuario.objects.filter(rol=Usuario.ROL_INVESTIGADOR).select_related("perfil")
        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(nombre__icontains=search)
        serializer = UsuarioListSerializer(qs, many=True)
        return Response(serializer.data)

    @extend_schema(request=UsuarioDetailSerializer, responses=UsuarioDetailSerializer, summary="Crear investigador", tags=["Usuarios"])
    def post(self, request):
        data = request.data.copy()
        data["rol"] = Usuario.ROL_INVESTIGADOR
        serializer = UsuarioDetailSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UsuarioDetailSerializer(user).data, status=status.HTTP_201_CREATED)


class UsuarioDetailView(APIView):
    """Detalle, actualización y eliminación de un usuario específico."""

    permission_classes = [IsAuthenticated, EsJefeOPropietario]

    def get_object(self, pk):
        try:
            obj = Usuario.objects.select_related("perfil").get(pk=pk)
            self.check_object_permissions(self.request, obj)
            return obj
        except Usuario.DoesNotExist:
            return None

    @extend_schema(responses=UsuarioDetailSerializer, summary="Detalle de usuario", tags=["Usuarios"])
    def get(self, request, pk):
        user = self.get_object(pk)
        if user is None:
            return Response({"detail": "No encontrado."}, status=status.HTTP_404_NOT_FOUND)
        return Response(UsuarioDetailSerializer(user).data)

    @extend_schema(request=UsuarioDetailSerializer, responses=UsuarioDetailSerializer, summary="Actualizar usuario", tags=["Usuarios"])
    def put(self, request, pk):
        user = self.get_object(pk)
        if user is None:
            return Response({"detail": "No encontrado."}, status=status.HTTP_404_NOT_FOUND)
        serializer = UsuarioDetailSerializer(user, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @extend_schema(request=UsuarioDetailSerializer, responses=UsuarioDetailSerializer, summary="Actualización parcial", tags=["Usuarios"])
    def patch(self, request, pk):
        user = self.get_object(pk)
        if user is None:
            return Response({"detail": "No encontrado."}, status=status.HTTP_404_NOT_FOUND)
        serializer = UsuarioDetailSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @extend_schema(responses={204: None}, summary="Eliminar usuario", tags=["Usuarios"])
    def delete(self, request, pk):
        if not request.user.es_jefe:
            return Response({"detail": "No autorizado."}, status=status.HTTP_403_FORBIDDEN)
        user = self.get_object(pk)
        if user is None:
            return Response({"detail": "No encontrado."}, status=status.HTTP_404_NOT_FOUND)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ActivarUsuarioView(APIView):
    """Activa o desactiva la cuenta de un usuario (toggle)."""

    permission_classes = [IsAuthenticated, EsJefe]

    @extend_schema(
        responses={"200": {"type": "object", "properties": {"is_active": {"type": "boolean"}}}},
        summary="Activar / Desactivar usuario",
        tags=["Usuarios"],
    )
    def post(self, request, pk):
        try:
            user = Usuario.objects.get(pk=pk)
        except Usuario.DoesNotExist:
            return Response({"detail": "No encontrado."}, status=status.HTTP_404_NOT_FOUND)

        user.is_active = not user.is_active
        user.save(update_fields=["is_active"])
        return Response({"is_active": user.is_active})
