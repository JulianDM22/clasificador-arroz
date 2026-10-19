"""
Nombre: main.py
Descripción: API del servicio de inferencia (FastAPI) con los 5 modelos del proyecto:
               GET  /modelos           catálogo con las métricas de cada modelo
               POST /predecir?modelo=  clasifica con el modelo elegido o con el ensamble
               POST /comparar          clasifica con los 5 modelos y el ensamble a la vez
             Si se define INFERENCIA_API_KEY, exige esa clave en la cabecera X-API-Key, para que
             solo el back-end pueda usarlo. Expone /salud y métricas Prometheus en /metrics.
Fecha de creación: 2026-10-18
Última actualización: 2026-10-18
Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
Versión: 1.1.0
"""
from __future__ import annotations

import hmac
import logging
import os
import time
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, File, Header, HTTPException, Query, UploadFile
from fastapi.responses import PlainTextResponse
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest

from app.modelo import (ENSAMBLE, TAMANO_MAXIMO_BYTES, Catalogo, ImagenInvalidaError, ModeloDesconocidoError,
                        cargar_catalogo)

log = logging.getLogger("inferencia")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

DIR_MODELO = Path(os.getenv("DIR_MODELO", Path(__file__).resolve().parent.parent / "modelo"))
API_KEY = os.getenv("INFERENCIA_API_KEY", "")

PREDICCIONES = Counter("predicciones_total", "Imágenes clasificadas", ["modelo", "categoria"])
COMPARACIONES = Counter("comparaciones_total", "Comparaciones de todos los modelos")
RECHAZADAS = Counter("imagenes_rechazadas_total", "Imágenes rechazadas por inválidas")
LATENCIA = Histogram("prediccion_segundos", "Tiempo de preprocesamiento + inferencia", ["operacion"],
                     buckets=(0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 5))

estado: dict[str, Catalogo | None] = {"catalogo": None}


@asynccontextmanager
async def ciclo_de_vida(app: FastAPI):
    if estado["catalogo"] is None:
        estado["catalogo"] = cargar_catalogo(DIR_MODELO)
    yield


app = FastAPI(
    title="Servicio de inferencia - Clasificador de arroz",
    version="1.1.0",
    description="Clasifica la variedad de un grano de arroz con 5 modelos (3 CNN y 2 transformers) en TensorFlow Lite.",
    lifespan=ciclo_de_vida,
)


def verificar_clave(x_api_key: str | None = Header(default=None)) -> None:
    """Exige la clave compartida si está configurada (comparación en tiempo constante)."""
    if API_KEY and not hmac.compare_digest(x_api_key or "", API_KEY):
        raise HTTPException(status_code=401, detail="Clave de API inválida")


def catalogo_cargado() -> Catalogo:
    catalogo = estado["catalogo"]
    if catalogo is None:
        raise HTTPException(status_code=503, detail="Los modelos no están cargados")
    return catalogo


async def leer(archivo: UploadFile) -> bytes:
    return await archivo.read(TAMANO_MAXIMO_BYTES + 1)


@app.get("/salud")
def salud() -> dict:
    """Estado del servicio: 200 si hay modelos cargados, 503 si no."""
    catalogo = catalogo_cargado()
    return {"estado": "UP", "modelos": [i["id"] for i in catalogo.info], "por_defecto": catalogo.por_defecto}


@app.get("/modelos", dependencies=[Depends(verificar_clave)])
def modelos(catalogo: Catalogo = Depends(catalogo_cargado)) -> dict:
    """Catálogo de modelos con sus métricas de test y su peso en el ensamble."""
    return catalogo.descripcion()


@app.post("/predecir", dependencies=[Depends(verificar_clave)])
async def predecir(archivo: UploadFile = File(...),
                   modelo: str | None = Query(default=None, max_length=40, pattern=r"^[a-z0-9_]+$"),
                   catalogo: Catalogo = Depends(catalogo_cargado)) -> dict:
    """Clasifica una imagen JPEG o PNG (≤ 5 MB) con el modelo indicado, con 'ensamble' o con el modelo por defecto."""
    contenido = await leer(archivo)
    inicio = time.perf_counter()
    try:
        p = catalogo.predecir(contenido, modelo)
    except ImagenInvalidaError as e:
        RECHAZADAS.inc()
        raise HTTPException(status_code=400, detail=str(e)) from e
    except ModeloDesconocidoError as e:
        opciones = ", ".join([i["id"] for i in catalogo.info] + [ENSAMBLE])
        raise HTTPException(status_code=404, detail=f"Modelo no disponible: {modelo}. Opciones: {opciones}") from e
    LATENCIA.labels("predecir").observe(time.perf_counter() - inicio)
    PREDICCIONES.labels(p.modelo, p.categoria).inc()
    return p.como_dict()


@app.post("/comparar", dependencies=[Depends(verificar_clave)])
async def comparar(archivo: UploadFile = File(...), catalogo: Catalogo = Depends(catalogo_cargado)) -> dict:
    """Clasifica la misma imagen con todos los modelos y con el ensamble."""
    contenido = await leer(archivo)
    inicio = time.perf_counter()
    try:
        r = catalogo.comparar(contenido)
    except ImagenInvalidaError as e:
        RECHAZADAS.inc()
        raise HTTPException(status_code=400, detail=str(e)) from e
    LATENCIA.labels("comparar").observe(time.perf_counter() - inicio)
    COMPARACIONES.inc()
    for p in r["modelos"]:
        PREDICCIONES.labels(p["modelo"], p["categoria"]).inc()
    return r


@app.get("/metrics", response_class=PlainTextResponse)
def metricas() -> PlainTextResponse:
    """Métricas en formato Prometheus."""
    return PlainTextResponse(generate_latest(), media_type=CONTENT_TYPE_LATEST)
