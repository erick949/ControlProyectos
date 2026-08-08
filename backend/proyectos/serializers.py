"""
Serializers de la app proyectos.
"""

from rest_framework import serializers
from .models import Proyecto, LineaInvestigacion


class LineaInvestigacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LineaInvestigacion
        fields = ["id", "nombre", "activa"]


class ProyectoListSerializer(serializers.ModelSerializer):
    """Vista resumida para tablas y listas."""

    investigador_nombre = serializers.CharField(source="investigador.nombre", read_only=True)
    investigador_email = serializers.CharField(source="investigador.email", read_only=True)
    pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = Proyecto
        fields = [
            "id",
            "codigo",
            "linea",
            "nombre",
            "descripcion",
            "estado",
            "investigador",
            "investigador_nombre",
            "investigador_email",
            "pdf_nombre_original",
            "pdf_url",
            "fecha_registro",
            "fecha_actualizacion",
        ]

    def get_pdf_url(self, obj):
        request = self.context.get("request")
        if obj.pdf and request:
            return request.build_absolute_uri(obj.pdf.url)
        return None


class ProyectoCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer de escritura: crea o actualiza un proyecto."""

    pdf = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Proyecto
        fields = [
            "linea",
            "nombre",
            "descripcion",
            "estado",
            "pdf",
        ]

    def validate_pdf(self, value):
        if value is None:
            return value
        if not value.name.lower().endswith(".pdf"):
            raise serializers.ValidationError("Solo se permiten archivos en formato .pdf")
        max_size = 10 * 1024 * 1024  # 10 MB
        if value.size > max_size:
            raise serializers.ValidationError("El archivo excede el tamaño máximo de 10 MB.")
        return value

    def validate_descripcion(self, value):
        if len(value.strip()) < 50:
            raise serializers.ValidationError("La descripción debe tener al menos 50 caracteres.")
        return value

    def create(self, validated_data):
        pdf_file = validated_data.pop("pdf", None)
        proyecto = Proyecto(**validated_data)
        if pdf_file:
            proyecto.pdf = pdf_file
            proyecto.pdf_nombre_original = pdf_file.name
        proyecto.save()
        return proyecto

    def update(self, instance, validated_data):
        pdf_file = validated_data.pop("pdf", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if pdf_file:
            # Eliminar el PDF anterior si existe
            if instance.pdf:
                instance.pdf.delete(save=False)
            instance.pdf = pdf_file
            instance.pdf_nombre_original = pdf_file.name
        instance.save()
        return instance


class EstadisticasSerializer(serializers.Serializer):
    """Datos para el Dashboard."""

    totales = serializers.IntegerField()
    activos = serializers.IntegerField()
    inactivos = serializers.IntegerField()
    investigadores = serializers.IntegerField()
    con_pdf = serializers.IntegerField()
