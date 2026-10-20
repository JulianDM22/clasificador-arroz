"""
Nombre: test_modelo_real.py
Descripción: Pruebas con los archivos .tflite del catálogo incluido en el repositorio (no con
             modelos falsos): que todos carguen, que devuelvan distribuciones de probabilidad
             válidas, que cada uno clasifique una imagen en menos de 1 s (criterio CA-09.3) y
             que acierte las 25 fotos de test reales de tests/muestras (5 por variedad, nunca
             vistas en el entrenamiento). Se omiten si el intérprete de TensorFlow Lite no está
             instalado en el equipo.
Fecha de creación: 2026-10-18
Última actualización: 2026-10-19
Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
Versión: 1.2.0
"""
import io
import json
import time
from pathlib import Path

import pytest
from PIL import Image

from app.modelo import cargar_catalogo

DIR = Path(__file__).resolve().parent.parent / "modelo"
MUESTRAS = Path(__file__).resolve().parent / "muestras"


@pytest.fixture(scope="module")
def catalogo():
    try:
        import ai_edge_litert  # noqa: F401
    except ImportError:
        pytest.importorskip("tensorflow", reason="No hay intérprete de TensorFlow Lite instalado")
    cat = cargar_catalogo(DIR)
    assert cat is not None, "No se pudo cargar ningún modelo del catálogo"
    return cat


def _jpeg() -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", (250, 250), (235, 235, 240)).save(buf, format="JPEG")
    return buf.getvalue()


def test_todos_los_modelos_del_catalogo_cargan(catalogo):
    declarados = [m["id"] for m in json.loads((DIR / "modelos.json").read_text(encoding="utf-8"))["modelos"]]
    assert sorted(catalogo.modelos) == sorted(declarados)


def test_cada_modelo_devuelve_probabilidades_validas(catalogo):
    r = catalogo.comparar(_jpeg())
    for p in r["modelos"] + [r["ensamble"]]:
        assert sum(p["probabilidades"].values()) == pytest.approx(1.0, abs=1e-4)
        assert 0.0 <= p["confianza"] <= 1.0


def test_ca_09_3_cada_modelo_clasifica_en_menos_de_un_segundo(catalogo):
    imagen = _jpeg()
    for modelo_id in catalogo.modelos:
        catalogo.predecir(imagen, modelo_id)  # calentamiento
        tiempos = []
        for _ in range(3):
            inicio = time.perf_counter()
            catalogo.predecir(imagen, modelo_id)
            tiempos.append(time.perf_counter() - inicio)
        assert sorted(tiempos)[1] < 1.0, f"{modelo_id}: mediana {sorted(tiempos)[1]:.3f} s"


def test_cada_modelo_acierta_las_fotos_reales_de_test(catalogo):
    if catalogo.es_prueba:
        pytest.skip("El catálogo es de prueba (modelos sin entrenar)")
    fotos = sorted(MUESTRAS.glob("*.jpg"))
    assert len(fotos) == 25
    for modelo_id in list(catalogo.modelos) + ["ensamble"]:
        errores = [f.name for f in fotos
                   if catalogo.predecir(f.read_bytes(), modelo_id).categoria != f.name.split("_")[0].upper()]
        # Con exactitudes de test entre 99,1 % y 99,9 % se admite como mucho un error en 25 fotos.
        assert len(errores) <= 1, f"{modelo_id} falló en {errores}"
