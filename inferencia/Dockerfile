# Nombre: Dockerfile (inferencia)
# Descripción: Imagen del servicio de inferencia: Python 3.12, FastAPI y el modelo ResNet50V2 en
#              TensorFlow Lite (LiteRT), ejecutado como usuario sin privilegios.
# Fecha de creación: 2026-10-18
# Última actualización: 2026-10-18
# Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
# Versión: 1.0.0

# Debian 12 (bookworm): la librería nativa de LiteRT no carga en el glibc de Debian 13.
FROM python:3.12-slim-bookworm
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=8000
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
COPY modelo ./modelo
RUN useradd --system --uid 1001 app && chown -R app /app
USER app
EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --workers 1"]
