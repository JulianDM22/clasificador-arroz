"""
Nombre: modelo.py
Descripción: Carga los modelos TensorFlow Lite del catálogo (modelos.json) y clasifica imágenes
             de granos de arroz con un modelo elegido, con el ensamble (voto suave ponderado) o
             con todos a la vez para compararlos. Valida que la imagen sea JPEG o PNG y la
             preprocesa una sola vez igual que en el entrenamiento (RGB, 224×224, 0-255; la
             normalización de cada arquitectura va dentro de su modelo).
Fecha de creación: 2026-10-18
Última actualización: 2026-10-18
Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
Versión: 1.1.0
"""
from __future__ import annotations

import io
import json
import logging
import threading
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

import numpy as np
from PIL import Image, UnidentifiedImageError

log = logging.getLogger("inferencia")

FORMATOS_PERMITIDOS = {"JPEG", "PNG"}
TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024
ENSAMBLE = "ensamble"


class ImagenInvalidaError(ValueError):
    """El contenido recibido no es una imagen JPEG o PNG válida."""


class ModeloDesconocidoError(KeyError):
    """Se pidió un modelo que no está en el catálogo."""


@dataclass(frozen=True)
class Prediccion:
    """Resultado de clasificar una imagen con un modelo (o con el ensamble)."""

    modelo: str
    nombre: str
    categoria: str
    confianza: float
    probabilidades: dict[str, float]
    ms: float

    def como_dict(self) -> dict:
        return {"modelo": self.modelo, "nombre": self.nombre, "categoria": self.categoria,
                "confianza": self.confianza, "probabilidades": self.probabilidades, "ms": self.ms}


class Modelo(Protocol):
    """Cualquier objeto que, dado un lote preprocesado, devuelva probabilidades."""

    def probabilidades(self, lote: np.ndarray) -> np.ndarray: ...


def preprocesar(contenido: bytes, tamano: int) -> np.ndarray:
    """
    Convierte los bytes de una imagen en un lote de forma (1, tamano, tamano, 3) en float32.

    :raises ImagenInvalidaError: si está vacío, supera 5 MB o no es JPEG/PNG
    """
    if not contenido:
        raise ImagenInvalidaError("El archivo está vacío")
    if len(contenido) > TAMANO_MAXIMO_BYTES:
        raise ImagenInvalidaError("La imagen supera 5 MB")
    try:
        with Image.open(io.BytesIO(contenido)) as img:
            if img.format not in FORMATOS_PERMITIDOS:
                raise ImagenInvalidaError(f"Formato no permitido: {img.format}")
            img.load()
            rgb = img.convert("RGB").resize((tamano, tamano), Image.BILINEAR)
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError) as e:
        raise ImagenInvalidaError("El archivo no es una imagen válida") from e
    return np.asarray(rgb, dtype=np.float32)[np.newaxis, ...]


def normalizar(p) -> np.ndarray:
    p = np.asarray(p, dtype=np.float64).reshape(-1)
    return p / p.sum()


class Catalogo:
    """Conjunto de modelos cargados con sus métricas (las del notebook 04)."""

    def __init__(self, modelos: dict[str, Modelo], info: list[dict], clases: list[str],
                 tamano_entrada: int, por_defecto: str, es_prueba: bool = False):
        self.modelos = modelos
        self.info = [i for i in info if i["id"] in modelos]
        self.clases = clases
        self.tamano_entrada = tamano_entrada
        self.por_defecto = por_defecto if por_defecto in modelos else next(iter(modelos))
        self.es_prueba = es_prueba
        pesos = {i["id"]: float(i.get("peso_ensamble", 1.0)) for i in self.info}
        total = sum(pesos.values()) or 1.0
        self.pesos = {k: v / total for k, v in pesos.items()}
        self._nombres = {i["id"]: i["nombre"] for i in self.info}

    def _prediccion(self, modelo_id: str, nombre: str, p: np.ndarray, ms: float) -> Prediccion:
        i = int(np.argmax(p))
        return Prediccion(modelo=modelo_id, nombre=nombre, categoria=self.clases[i],
                          confianza=round(float(p[i]), 6),
                          probabilidades={c: round(float(v), 6) for c, v in zip(self.clases, p)},
                          ms=round(ms, 1))

    def _uno(self, modelo_id: str, lote: np.ndarray) -> tuple[Prediccion, np.ndarray]:
        inicio = time.perf_counter()
        p = normalizar(self.modelos[modelo_id].probabilidades(lote))
        ms = (time.perf_counter() - inicio) * 1000
        return self._prediccion(modelo_id, self._nombres[modelo_id], p, ms), p

    def _ensamble(self, probs: dict[str, np.ndarray], ms: float) -> Prediccion:
        p = sum(self.pesos[k] * v for k, v in probs.items())
        return self._prediccion(ENSAMBLE, f"Ensamble ({len(probs)} modelos)", normalizar(p), ms)

    def predecir(self, contenido: bytes, modelo_id: str | None = None) -> Prediccion:
        """Clasifica con un modelo del catálogo o con el ensamble."""
        modelo_id = modelo_id or self.por_defecto
        if modelo_id != ENSAMBLE and modelo_id not in self.modelos:
            raise ModeloDesconocidoError(modelo_id)
        lote = preprocesar(contenido, self.tamano_entrada)
        if modelo_id == ENSAMBLE:
            return self.comparar_lote(lote)["ensamble"]
        return self._uno(modelo_id, lote)[0]

    def comparar(self, contenido: bytes) -> dict:
        """Clasifica la misma imagen con todos los modelos y con el ensamble."""
        resultado = self.comparar_lote(preprocesar(contenido, self.tamano_entrada))
        return {
            "modelos": [p.como_dict() for p in resultado["modelos"]],
            "ensamble": resultado["ensamble"].como_dict(),
            "consenso": resultado["consenso"],
        }

    def comparar_lote(self, lote: np.ndarray) -> dict:
        predicciones, probs = [], {}
        for modelo_id in self.modelos:
            pred, p = self._uno(modelo_id, lote)
            predicciones.append(pred)
            probs[modelo_id] = p
        ensamble = self._ensamble(probs, sum(p.ms for p in predicciones))
        return {"modelos": predicciones, "ensamble": ensamble,
                "consenso": len({p.categoria for p in predicciones}) == 1}

    def descripcion(self) -> dict:
        return {"modelo_por_defecto": self.por_defecto, "ensamble_disponible": len(self.modelos) > 1,
                "es_prueba": self.es_prueba, "clases": self.clases, "modelos": self.info}


class ModeloTFLite:
    """Un modelo TensorFlow Lite. El intérprete no es seguro entre hilos: se protege con un candado."""

    def __init__(self, ruta_modelo: Path, tamano_entrada: int):
        try:
            from ai_edge_litert.interpreter import Interpreter  # intérprete liviano (Linux/macOS)
        except ImportError:  # en Windows se usa el intérprete incluido en TensorFlow
            import tensorflow as tf

            Interpreter = tf.lite.Interpreter
        self._interprete = Interpreter(model_path=str(ruta_modelo))
        entrada = self._interprete.get_input_details()[0]["index"]
        self._interprete.resize_tensor_input(entrada, [1, tamano_entrada, tamano_entrada, 3])
        self._interprete.allocate_tensors()
        self._entrada = entrada
        self._salida = self._interprete.get_output_details()[0]["index"]
        self._candado = threading.Lock()

    def probabilidades(self, lote: np.ndarray) -> np.ndarray:
        with self._candado:
            self._interprete.set_tensor(self._entrada, lote.astype(np.float32))
            self._interprete.invoke()
            return self._interprete.get_tensor(self._salida)[0].copy()


def cargar_catalogo(directorio: Path) -> Catalogo | None:
    """Carga todos los modelos de modelos.json; omite (y registra) los que fallen."""
    ruta = directorio / "modelos.json"
    if not ruta.exists():
        log.error("No se encontró %s", ruta)
        return None
    meta = json.loads(ruta.read_text(encoding="utf-8"))
    tamano = int(meta.get("tamano_entrada", 224))
    modelos: dict[str, Modelo] = {}
    for info in meta["modelos"]:
        try:
            modelos[info["id"]] = ModeloTFLite(directorio / info["archivo"], tamano)
            log.info("Modelo %s cargado (%s)", info["id"], info["archivo"])
        except Exception:
            log.exception("No se pudo cargar el modelo %s", info["id"])
    if not modelos:
        return None
    return Catalogo(modelos, meta["modelos"], meta["clases"], tamano, meta.get("modelo_por_defecto", ""),
                    bool(meta.get("es_prueba", False)))
