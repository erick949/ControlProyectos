"""
python manage.py seed_data

Popula la base de datos con:
  - Líneas de investigación del catálogo original
  - Usuario jefe (admin / admin123)
  - 5 investigadores de ejemplo con sus proyectos
"""

from django.core.management.base import BaseCommand
from django.db import transaction


LINEAS = [
    "Inteligencia Artificial Aplicada",
    "Energías Renovables",
    "Biotecnología Molecular",
    "Nanomateriales y Nanotecnología",
    "Software Educativo",
    "Salud Pública",
    "Biotecnología",
    "Inteligencia Artificial",
]

INVESTIGADORES = [
    {
        "email": "alex.ramirez@proyecta.mx",
        "nombre": "Dr. Alex Ramírez",
        "password": "inv123456",
        "clave": "InvestigadorID-101",
        "area": "Ciencias Computacionales",
        "division": "IT",
        "linea": "Inteligencia Artificial Aplicada",
    },
    {
        "email": "ma.gonzalez@proyecta.mx",
        "nombre": "Dra. Ma. González",
        "password": "inv123456",
        "clave": "InvestigadorID-102",
        "area": "Biología Molecular",
        "division": "CB",
        "linea": "Biotecnología Molecular",
    },
    {
        "email": "luis.perez@proyecta.mx",
        "nombre": "Mtro. Luis Pérez",
        "password": "inv123456",
        "clave": "InvestigadorID-103",
        "area": "Ingeniería Energética",
        "division": "IT",
        "linea": "Energías Renovables",
    },
    {
        "email": "sara.flores@proyecta.mx",
        "nombre": "Ing. Sara Flores",
        "password": "inv123456",
        "clave": "InvestigadorID-104",
        "area": "Tecnología Educativa",
        "division": "ID",
        "linea": "Inteligencia Artificial Aplicada",
    },
    {
        "email": "carmen.diaz@proyecta.mx",
        "nombre": "Dra. Carmen Díaz",
        "password": "inv123456",
        "clave": "InvestigadorID-105",
        "area": "Salud Comunitaria",
        "division": "CS",
        "linea": "Biotecnología Molecular",
    },
]

PROYECTOS = [
    {
        "investigador_email": "alex.ramirez@proyecta.mx",
        "linea": "Inteligencia Artificial",
        "nombre": "Desarrollo de IA para Clima",
        "descripcion": "Optimización de modelos predictivos climáticos mediante redes neuronales profundas aplicadas a series temporales regionales.",
        "estado": "Activo",
    },
    {
        "investigador_email": "ma.gonzalez@proyecta.mx",
        "linea": "Biotecnología",
        "nombre": "Nuevos Cultivos Orgánicos",
        "descripcion": "Estudio de resiliencia genética en cultivos orgánicos frente a condiciones de estrés hídrico prolongado.",
        "estado": "Activo",
    },
    {
        "investigador_email": "luis.perez@proyecta.mx",
        "linea": "Energías Renovables",
        "nombre": "Panel Solar Eficiente",
        "descripcion": "Análisis de materiales fotovoltaicos de nueva generación para incrementar la eficiencia de conversión energética.",
        "estado": "Activo",
    },
    {
        "investigador_email": "sara.flores@proyecta.mx",
        "linea": "Software Educativo",
        "nombre": "Plataforma de Aprendizaje",
        "descripcion": "Desarrollo de módulos adaptativos de aprendizaje personalizado basados en el desempeño del estudiante.",
        "estado": "Inactivo",
    },
    {
        "investigador_email": "carmen.diaz@proyecta.mx",
        "linea": "Salud Pública",
        "nombre": "Impacto del Estrés",
        "descripcion": "Investigación de campo sobre el impacto del estrés laboral crónico en comunidades urbanas de alta densidad.",
        "estado": "Activo",
    },
]


class Command(BaseCommand):
    help = "Pobla la base de datos con datos de ejemplo equivalentes al mockData del frontend."

    @transaction.atomic
    def handle(self, *args, **options):
        from apps.usuarios.models import Usuario, PerfilInvestigador
        from apps.proyectos.models import Proyecto, LineaInvestigacion

        self.stdout.write("🌱  Iniciando seed_data...")

        # 1. Líneas de investigación
        for nombre in LINEAS:
            linea, created = LineaInvestigacion.objects.get_or_create(nombre=nombre)
            if created:
                self.stdout.write(f"   ✔ Línea creada: {nombre}")

        # 2. Jefe de departamento
        jefe, created = Usuario.objects.get_or_create(
            email="admin@proyecta.mx",
            defaults={
                "nombre": "Jefe de Investigación",
                "rol": Usuario.ROL_JEFE,
                "is_staff": True,
            },
        )
        if created:
            jefe.set_password("admin123")
            jefe.save()
            self.stdout.write("   ✔ Jefe creado: admin@proyecta.mx / admin123")
        else:
            self.stdout.write("   ℹ Jefe ya existe: admin@proyecta.mx")

        # También creamos el superusuario admin/admin123 para el panel Django
        if not Usuario.objects.filter(email="admin").exists():
            try:
                su, su_created = Usuario.objects.get_or_create(
                    email="superadmin@proyecta.mx",
                    defaults={
                        "nombre": "Super Admin",
                        "rol": Usuario.ROL_JEFE,
                        "is_staff": True,
                        "is_superuser": True,
                    },
                )
                if su_created:
                    su.set_password("admin123")
                    su.save()
                    self.stdout.write("   ✔ Superadmin creado: superadmin@proyecta.mx / admin123")
            except Exception:
                pass

        # 3. Investigadores + Perfiles
        inv_map = {}
        for data in INVESTIGADORES:
            user, created = Usuario.objects.get_or_create(
                email=data["email"],
                defaults={
                    "nombre": data["nombre"],
                    "rol": Usuario.ROL_INVESTIGADOR,
                },
            )
            if created:
                user.set_password(data["password"])
                user.save()
                self.stdout.write(f"   ✔ Investigador creado: {data['email']}")

            PerfilInvestigador.objects.get_or_create(
                usuario=user,
                defaults={
                    "clave": data["clave"],
                    "area_participacion": data["area"],
                    "division": data["division"],
                    "linea_investigacion": data["linea"],
                },
            )
            inv_map[data["email"]] = user

        # 4. Proyectos de ejemplo
        for p_data in PROYECTOS:
            inv = inv_map.get(p_data["investigador_email"])
            if not inv:
                continue
            exists = Proyecto.objects.filter(
                nombre=p_data["nombre"], investigador=inv
            ).exists()
            if not exists:
                Proyecto.objects.create(
                    linea=p_data["linea"],
                    nombre=p_data["nombre"],
                    descripcion=p_data["descripcion"],
                    estado=p_data["estado"],
                    investigador=inv,
                    pdf_nombre_original="PDF.pdf",
                )
                self.stdout.write(f"   ✔ Proyecto creado: {p_data['nombre']}")

        self.stdout.write(self.style.SUCCESS("\n✅  seed_data completado exitosamente."))
        self.stdout.write("")
        self.stdout.write("  Credenciales de acceso:")
        self.stdout.write("  ┌─────────────────────────────────────────────────────┐")
        self.stdout.write("  │ Jefe:         admin@proyecta.mx  /  admin123        │")
        self.stdout.write("  │ Investigador: alex.ramirez@proyecta.mx / inv123456  │")
        self.stdout.write("  └─────────────────────────────────────────────────────┘")
