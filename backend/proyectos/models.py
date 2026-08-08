"""
Modelos de la app proyectos.

Proyecto – registro de un proyecto de investigación, asociado a un investigador.
"""

import os
import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


def pdf_upload_path(instance, filename):
    """Sube el PDF a media/proyectos/pdfs/<uuid>.pdf"""
    ext = os.path.splitext(filename)[1]
    return f"proyectos/pdfs/{uuid.uuid4().hex}{ext}"


class LineaInvestigacion(models.Model):
    """Catálogo de líneas de investigación (configurable desde el admin)."""

    nombre = models.CharField(_("nombre"), max_length=200, unique=True)
    activa = models.BooleanField(_("activa"), default=True)

    class Meta:
        verbose_name = _("línea de investigación")
        verbose_name_plural = _("líneas de investigación")
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


class Proyecto(models.Model):
    """Proyecto de investigación registrado por un investigador."""

    ESTADO_ACTIVO = "Activo"
    ESTADO_INACTIVO = "Inactivo"
    ESTADO_CHOICES = [
        (ESTADO_ACTIVO, "Activo"),
        (ESTADO_INACTIVO, "Inactivo"),
    ]

    # Identificador legible (PR001, PR002, …) generado automáticamente
    codigo = models.CharField(_("código"), max_length=10, unique=True, blank=True)

    linea = models.CharField(_("línea de investigación"), max_length=200)
    nombre = models.CharField(_("nombre del proyecto"), max_length=120)
    descripcion = models.TextField(_("descripción"))  # min_length validado en el serializer
    estado = models.CharField(
        _("estado"),
        max_length=10,
        choices=ESTADO_CHOICES,
        default=ESTADO_ACTIVO,
    )

    investigador = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="proyectos",
        verbose_name=_("investigador"),
        limit_choices_to={"rol": "investigador"},
    )

    pdf = models.FileField(
        _("memoria técnica (PDF)"),
        upload_to=pdf_upload_path,
        blank=True,
        null=True,
    )
    pdf_nombre_original = models.CharField(
        _("nombre original del PDF"),
        max_length=255,
        blank=True,
    )

    fecha_registro = models.DateTimeField(_("fecha de registro"), auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(_("última actualización"), auto_now=True)

    class Meta:
        verbose_name = _("proyecto")
        verbose_name_plural = _("proyectos")
        ordering = ["-fecha_registro"]

    def __str__(self):
        return f"[{self.codigo}] {self.nombre}"

    def save(self, *args, **kwargs):
        # Genera el código incremental (PR001, PR002, …) solo en la primera creación
        if not self.codigo:
            ultimo = Proyecto.objects.order_by("id").last()
            siguiente = (ultimo.id + 1) if ultimo else 1
            self.codigo = f"PR{str(siguiente).zfill(3)}"
        super().save(*args, **kwargs)
