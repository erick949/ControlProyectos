"""
Permisos personalizados para el sistema Proyecta.
"""

from rest_framework.permissions import BasePermission


class EsJefe(BasePermission):
    """Solo permite acceso al Jefe de Departamento de Investigación."""

    message = "Acceso restringido al Jefe de Departamento."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.rol == "jefe"
        )


class EsInvestigador(BasePermission):
    """Solo permite acceso a los Investigadores."""

    message = "Acceso restringido a Investigadores."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.rol == "investigador"
        )


class EsJefeOPropietario(BasePermission):
    """
    Permite acceso si el usuario es Jefe, o si es el propietario del objeto.
    El objeto debe tener un atributo `investigador` (FK a Usuario).
    """

    message = "No tienes permiso para realizar esta acción."

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.rol == "jefe":
            return True
        # Para proyectos, el campo se llama `investigador`
        propietario = getattr(obj, "investigador", None)
        return propietario == request.user
