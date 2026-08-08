"""
Modelos de la app usuarios.

Usuario  – extiende AbstractBaseUser para incluir el campo `rol`.
Perfil   – información adicional del investigador (avatar, área, división, línea).
"""

import os
import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _


def avatar_upload_path(instance, filename):
    """Sube el avatar a media/avatares/<uuid>.<ext>"""
    ext = os.path.splitext(filename)[1]
    return f"avatares/{uuid.uuid4().hex}{ext}"


class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("El correo electrónico es obligatorio.")
        email = self.normalize_email(email)
        extra_fields.setdefault("is_active", True)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("rol", Usuario.ROL_JEFE)
        return self.create_user(email, password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    """
    Usuario del sistema. El email es el identificador único.
    Roles: 'jefe' (Jefe de Departamento) o 'investigador'.
    """

    ROL_JEFE = "jefe"
    ROL_INVESTIGADOR = "investigador"
    ROL_CHOICES = [
        (ROL_JEFE, "Jefe de Departamento de Investigación"),
        (ROL_INVESTIGADOR, "Investigador"),
    ]

    email = models.EmailField(_("correo electrónico"), unique=True)
    nombre = models.CharField(_("nombre completo"), max_length=200)
    rol = models.CharField(
        _("rol"),
        max_length=20,
        choices=ROL_CHOICES,
        default=ROL_INVESTIGADOR,
    )
    is_active = models.BooleanField(_("activo"), default=True)
    is_staff = models.BooleanField(_("staff"), default=False)
    fecha_registro = models.DateTimeField(_("fecha de registro"), auto_now_add=True)

    objects = UsuarioManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nombre"]

    class Meta:
        verbose_name = _("usuario")
        verbose_name_plural = _("usuarios")
        ordering = ["nombre"]

    def __str__(self):
        return f"{self.nombre} <{self.email}>"

    @property
    def es_jefe(self):
        return self.rol == self.ROL_JEFE

    @property
    def es_investigador(self):
        return self.rol == self.ROL_INVESTIGADOR


class PerfilInvestigador(models.Model):
    """
    Información extendida del investigador (vinculada 1-a-1 con Usuario).
    Solo aplica a usuarios con rol 'investigador'.
    """

    DIVISIONES = [
        ("ID", "Investigación y Desarrollo"),
        ("IT", "Ingeniería y Tecnología"),
        ("CB", "Ciencias Básicas"),
        ("CS", "Ciencias de la Salud"),
    ]

    usuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        related_name="perfil",
        verbose_name=_("usuario"),
    )
    clave = models.CharField(_("clave de investigador"), max_length=30, unique=True)
    area_participacion = models.CharField(_("área de participación"), max_length=200)
    division = models.CharField(_("división"), max_length=2, choices=DIVISIONES)
    linea_investigacion = models.CharField(_("línea de investigación"), max_length=200)
    avatar = models.ImageField(
        _("avatar"),
        upload_to=avatar_upload_path,
        blank=True,
        null=True,
    )

    class Meta:
        verbose_name = _("perfil de investigador")
        verbose_name_plural = _("perfiles de investigadores")

    def __str__(self):
        return f"Perfil de {self.usuario.nombre}"
