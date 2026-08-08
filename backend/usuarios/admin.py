from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import Usuario, PerfilInvestigador


class PerfilInline(admin.StackedInline):
    model = PerfilInvestigador
    can_delete = False
    verbose_name_plural = "Perfil de Investigador"
    extra = 0


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    inlines = [PerfilInline]
    ordering = ["email"]
    list_display = ["email", "nombre", "rol", "is_active", "fecha_registro"]
    list_filter = ["rol", "is_active"]
    search_fields = ["email", "nombre"]

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Información personal"), {"fields": ("nombre", "rol")}),
        (_("Permisos"), {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        (_("Fechas importantes"), {"fields": ("last_login", "fecha_registro")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "nombre", "rol", "password1", "password2"),
        }),
    )
    readonly_fields = ["fecha_registro"]


@admin.register(PerfilInvestigador)
class PerfilAdmin(admin.ModelAdmin):
    list_display = ["usuario", "clave", "division", "linea_investigacion"]
    search_fields = ["usuario__nombre", "clave"]
    list_filter = ["division"]
