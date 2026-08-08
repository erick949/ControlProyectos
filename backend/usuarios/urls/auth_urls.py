"""
URLs de autenticación → prefijo: /api/auth/
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from usuarios.views.auth_views import (
    LoginView,
    LogoutView,
    MeView,
    ChangePasswordView,
    RegistroPublicoView,
)

urlpatterns = [
    path("login/",           LoginView.as_view(),          name="auth-login"),
    path("logout/",          LogoutView.as_view(),          name="auth-logout"),
    path("refresh/",         TokenRefreshView.as_view(),    name="auth-refresh"),
    path("me/",              MeView.as_view(),              name="auth-me"),
    path("change-password/", ChangePasswordView.as_view(),  name="auth-change-password"),
    path("registro/",        RegistroPublicoView.as_view(), name="auth-registro"),
]
