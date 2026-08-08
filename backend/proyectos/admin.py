from django.contrib import admin
from .models import Proyecto, LineaInvestigacion


@admin.register(LineaInvestigacion)
class LineaInvestigacionAdmin(admin.ModelAdmin):
    list_display = ["nombre", "activa"]
    list_editable = ["activa"]
    search_fields = ["nombre"]


@admin.register(Proyecto)
class ProyectoAdmin(admin.ModelAdmin):
    list_display = ["codigo", "nombre", "linea", "investigador", "estado", "fecha_registro"]
    list_filter = ["estado", "linea"]
    search_fields = ["codigo", "nombre", "investigador__nombre"]
    readonly_fields = ["codigo", "fecha_registro", "fecha_actualizacion"]
    raw_id_fields = ["investigador"]

    fieldsets = (
        ("Identificación", {"fields": ("codigo", "estado")}),
        ("Contenido", {"fields": ("linea", "nombre", "descripcion")}),
        ("Investigador", {"fields": ("investigador",)}),
        ("Documento", {"fields": ("pdf", "pdf_nombre_original")}),
        ("Fechas", {"fields": ("fecha_registro", "fecha_actualizacion")}),
    )
