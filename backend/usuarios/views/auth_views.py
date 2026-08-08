"""
Vistas de autenticación.

POST /api/auth/login/           → obtener tokens + datos de sesión
POST /api/auth/logout/          → invalidar refresh token
POST /api/auth/refresh/         → renovar access token
GET  /api/auth/me/              → datos del usuario autenticado
PUT  /api/auth/me/              → actualizar nombre (perfil básico)
POST /api/auth/change-password/ → cambiar contraseña
POST /api/auth/registro/        → auto-registro público de investigador
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from drf_spectacular.utils import extend_schema

from usuarios.models import Usuario
from usuarios.serializers import (
    LoginSerializer,
    LogoutSerializer,
    MeSerializer,
    ChangePasswordSerializer,
    UsuarioDetailSerializer,
)


class LoginView(APIView):
    """
    Autentica al usuario con email/nombre+contraseña y devuelve tokens JWT.
    Compatible con el formulario del frontend (campo `usuario` acepta email).
    """

    permission_classes = [AllowAny]

    @extend_schema(
        request=LoginSerializer,
        responses={200: {"type": "object", "properties": {
            "access":  {"type": "string"},
            "refresh": {"type": "string"},
            "role":    {"type": "string"},
            "nombre":  {"type": "string"},
            "email":   {"type": "string"},
            "id":      {"type": "integer"},
        }}},
        summary="Iniciar sesión",
        tags=["Auth"],
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.create(serializer.validated_data), status=status.HTTP_200_OK)


class LogoutView(APIView):
    """Invalida el refresh token (blacklist)."""

    permission_classes = [IsAuthenticated]

    @extend_schema(request=LogoutSerializer, responses={204: None}, summary="Cerrar sesión", tags=["Auth"])
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            token = RefreshToken(serializer.validated_data["refresh"])
            token.blacklist()
        except TokenError:
            pass  # Token ya inválido o expirado → igual devuelve 204
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    """Devuelve o actualiza los datos del usuario autenticado."""

    permission_classes = [IsAuthenticated]

    @extend_schema(responses=MeSerializer, summary="Mis datos", tags=["Auth"])
    def get(self, request):
        serializer = MeSerializer(request.user)
        return Response(serializer.data)

    @extend_schema(
        request={"type": "object", "properties": {"nombre": {"type": "string"}}},
        responses=MeSerializer,
        summary="Actualizar mi perfil",
        tags=["Auth"],
    )
    def put(self, request):
        serializer = MeSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ChangePasswordView(APIView):
    """Cambia la contraseña del usuario autenticado."""

    permission_classes = [IsAuthenticated]

    @extend_schema(request=ChangePasswordSerializer, responses={200: None}, summary="Cambiar contraseña", tags=["Auth"])
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        return Response({"detail": "Contraseña actualizada correctamente."}, status=status.HTTP_200_OK)


class RegistroPublicoView(APIView):
    """
    Auto-registro público de investigador (sin autenticación previa).
    Equivale a la pantalla /registro del frontend.
    """

    permission_classes = [AllowAny]

    @extend_schema(
        request=UsuarioDetailSerializer,
        responses={201: MeSerializer},
        summary="Registro público de investigador",
        tags=["Auth"],
    )
    def post(self, request):
        data = request.data.copy()
        data["rol"] = Usuario.ROL_INVESTIGADOR   # siempre investigador en auto-registro

        serializer = UsuarioDetailSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(MeSerializer(user).data, status=status.HTTP_201_CREATED)
