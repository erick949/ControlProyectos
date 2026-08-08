"""
Serializers de la app usuarios.
"""

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Usuario, PerfilInvestigador


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class LoginSerializer(serializers.Serializer):
    """Valida credenciales y devuelve tokens JWT + datos de sesión."""

    usuario = serializers.CharField(label="Usuario o email")
    contrasena = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, data):
        usuario_input = data.get("usuario", "").strip()
        contrasena = data.get("contrasena", "")

        # Acepta email o nombre de usuario (email preferido)
        user = authenticate(
            request=self.context.get("request"),
            username=usuario_input,
            password=contrasena,
        )

        if user is None:
            raise serializers.ValidationError("Usuario o contraseña incorrectos.")

        if not user.is_active:
            raise serializers.ValidationError("Esta cuenta está desactivada.")

        data["user"] = user
        return data

    def create(self, validated_data):
        user = validated_data["user"]
        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": user.rol,
            "nombre": user.nombre,
            "email": user.email,
            "id": user.id,
        }


class LogoutSerializer(serializers.Serializer):
    """Recibe el refresh token para añadirlo a la blacklist."""
    refresh = serializers.CharField()


# ---------------------------------------------------------------------------
# Usuario
# ---------------------------------------------------------------------------

class PerfilInvestigadorSerializer(serializers.ModelSerializer):
    division_display = serializers.CharField(source="get_division_display", read_only=True)

    class Meta:
        model = PerfilInvestigador
        fields = [
            "id",
            "clave",
            "area_participacion",
            "division",
            "division_display",
            "linea_investigacion",
            "avatar",
        ]


class UsuarioListSerializer(serializers.ModelSerializer):
    """Vista resumida para listas."""

    perfil = PerfilInvestigadorSerializer(read_only=True)

    class Meta:
        model = Usuario
        fields = ["id", "email", "nombre", "rol", "is_active", "fecha_registro", "perfil"]


class UsuarioDetailSerializer(serializers.ModelSerializer):
    """Vista completa para detalle y creación."""

    perfil = PerfilInvestigadorSerializer(required=False)
    password = serializers.CharField(
        write_only=True,
        required=False,
        validators=[validate_password],
        style={"input_type": "password"},
    )

    class Meta:
        model = Usuario
        fields = [
            "id", "email", "nombre", "rol", "is_active",
            "fecha_registro", "perfil", "password",
        ]
        read_only_fields = ["id", "fecha_registro"]

    def create(self, validated_data):
        perfil_data = validated_data.pop("perfil", None)
        password = validated_data.pop("password", None)

        user = Usuario(**validated_data)
        if password:
            user.set_password(password)
        else:
            # Genera contraseña aleatoria si no se especifica
            user.set_unusable_password()
        user.save()

        if perfil_data and user.rol == Usuario.ROL_INVESTIGADOR:
            PerfilInvestigador.objects.create(usuario=user, **perfil_data)

        return user

    def update(self, instance, validated_data):
        perfil_data = validated_data.pop("perfil", None)
        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        if perfil_data and instance.rol == Usuario.ROL_INVESTIGADOR:
            PerfilInvestigador.objects.update_or_create(
                usuario=instance,
                defaults=perfil_data,
            )

        return instance


class ChangePasswordSerializer(serializers.Serializer):
    """Cambio de contraseña autenticado."""

    old_password = serializers.CharField(write_only=True, style={"input_type": "password"})
    new_password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        style={"input_type": "password"},
    )

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("La contraseña actual es incorrecta.")
        return value


class MeSerializer(serializers.ModelSerializer):
    """Datos del usuario autenticado (/auth/me/)."""

    perfil = PerfilInvestigadorSerializer(read_only=True)

    class Meta:
        model = Usuario
        fields = ["id", "email", "nombre", "rol", "fecha_registro", "perfil"]
