"""
Nombre: test_api.py
Descripción: Pruebas del servicio de inferencia con pytest. Los modelos reales se reemplazan por
             modelos falsos con probabilidades conocidas, para verificar la selección de modelo,
             el ensamble ponderado, la comparación y las validaciones sin depender de los .tflite.
Fecha de creación: 2026-10-18
Última actualización: 2026-10-18
Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
Versión: 1.1.0
"""
import io

import numpy as np
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app import main
from app.modelo import TAMANO_MAXIMO_BYTES, Catalogo, ImagenInvalidaError, ModeloDesconocidoError, preprocesar

CLASES = ["ARBORIO", "BASMATI", "IPSALA", "JASMINE", "KARACADAG"]


class ModeloFalso:
    def __init__(self, probs):
        self.probs = np.array(probs, dtype=np.float32)
        self.ultimo_lote = None

    def probabilidades(self, lote):
        self.ultimo_lote = lote
        return self.probs


INFO = [
    {"id": "resnet50v2", "nombre": "ResNet50V2", "tipo": "CNN", "accuracy_test": 0.9991, "peso_ensamble": 0.5},
    {"id": "vit_b16", "nombre": "ViT-B/16", "tipo": "Transformer", "accuracy_test": 0.998, "peso_ensamble": 0.3},
    {"id": "cnn_propia", "nombre": "CNN propia", "tipo": "CNN", "accuracy_test": 0.9908, "peso_ensamble": 0.2},
]


def catalogo_falso():
    modelos = {
        "resnet50v2": ModeloFalso([0.01, 0.90, 0.04, 0.03, 0.02]),   # BASMATI
        "vit_b16": ModeloFalso([0.05, 0.60, 0.05, 0.25, 0.05]),      # BASMATI
        "cnn_propia": ModeloFalso([0.05, 0.10, 0.05, 0.75, 0.05]),   # JASMINE
    }
    return Catalogo(modelos, INFO, CLASES, 224, "resnet50v2")


def imagen(formato="JPEG", tamano=(250, 250), color=(200, 200, 210)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", tamano, color).save(buf, format=formato)
    return buf.getvalue()


@pytest.fixture
def catalogo():
    cat = catalogo_falso()
    main.estado["catalogo"] = cat
    yield cat
    main.estado["catalogo"] = None


@pytest.fixture
def cliente(catalogo):
    with TestClient(main.app) as c:
        yield c


def foto():
    return {"archivo": ("g.jpg", imagen(), "image/jpeg")}


def test_ca_06_1_sin_modelo_usa_el_modelo_por_defecto(cliente, catalogo):
    r = cliente.post("/predecir", files=foto())
    assert r.status_code == 200
    cuerpo = r.json()
    assert cuerpo["modelo"] == "resnet50v2"
    assert cuerpo["categoria"] == "BASMATI"
    assert cuerpo["confianza"] == pytest.approx(0.9, abs=1e-6)
    assert set(cuerpo["probabilidades"]) == set(CLASES)
    assert cuerpo["ms"] >= 0
    lote = catalogo.modelos["resnet50v2"].ultimo_lote
    assert lote.shape == (1, 224, 224, 3) and lote.dtype == np.float32 and lote.max() <= 255


def test_ca_06_6_clasifica_con_el_modelo_elegido(cliente):
    r = cliente.post("/predecir?modelo=cnn_propia", files=foto())
    assert r.status_code == 200
    assert r.json()["modelo"] == "cnn_propia"
    assert r.json()["categoria"] == "JASMINE"


def test_ca_06_6_ensamble_es_el_voto_suave_ponderado(cliente):
    r = cliente.post("/predecir?modelo=ensamble", files=foto())
    assert r.status_code == 200
    esperado = 0.5 * np.array([0.01, 0.90, 0.04, 0.03, 0.02]) + 0.3 * np.array([0.05, 0.60, 0.05, 0.25, 0.05]) \
        + 0.2 * np.array([0.05, 0.10, 0.05, 0.75, 0.05])
    cuerpo = r.json()
    assert cuerpo["modelo"] == "ensamble"
    assert cuerpo["categoria"] == "BASMATI"
    assert cuerpo["probabilidades"]["JASMINE"] == pytest.approx(esperado[3], abs=1e-5)


def test_ca_06_6_modelo_desconocido_da_404_con_las_opciones(cliente):
    r = cliente.post("/predecir?modelo=resnet152", files=foto())
    assert r.status_code == 404
    assert "resnet50v2" in r.json()["detail"] and "ensamble" in r.json()["detail"]


def test_nombre_de_modelo_con_caracteres_no_permitidos_da_422(cliente):
    assert cliente.post("/predecir?modelo=../etc", files=foto()).status_code == 422


def test_ca_06_7_comparar_devuelve_todos_los_modelos_y_el_ensamble(cliente):
    r = cliente.post("/comparar", files=foto())
    assert r.status_code == 200
    cuerpo = r.json()
    assert [m["modelo"] for m in cuerpo["modelos"]] == ["resnet50v2", "vit_b16", "cnn_propia"]
    assert [m["categoria"] for m in cuerpo["modelos"]] == ["BASMATI", "BASMATI", "JASMINE"]
    assert cuerpo["ensamble"]["categoria"] == "BASMATI"
    assert cuerpo["consenso"] is False
    assert all(m["ms"] >= 0 for m in cuerpo["modelos"])


def test_ca_06_7_catalogo_con_metricas(cliente):
    r = cliente.get("/modelos")
    assert r.status_code == 200
    cuerpo = r.json()
    assert cuerpo["modelo_por_defecto"] == "resnet50v2"
    assert cuerpo["ensamble_disponible"] is True
    assert cuerpo["modelos"][0]["accuracy_test"] == 0.9991


def test_ca_06_1_png_y_escala_de_grises_se_aceptan(cliente):
    buf = io.BytesIO()
    Image.new("L", (100, 60), 128).save(buf, format="PNG")
    assert cliente.post("/predecir", files={"archivo": ("g.png", buf.getvalue(), "image/png")}).status_code == 200


@pytest.mark.parametrize("ruta", ["/predecir", "/comparar"])
@pytest.mark.parametrize("contenido", [b"", b"no soy una imagen", b"\xff\xd8\xff" + b"0" * 20])
def test_ca_06_2_contenido_invalido_da_400(cliente, ruta, contenido):
    assert cliente.post(ruta, files={"archivo": ("x.jpg", contenido, "image/jpeg")}).status_code == 400


def test_ca_06_2_formato_no_permitido_da_400(cliente):
    r = cliente.post("/predecir", files={"archivo": ("x.gif", imagen("GIF"), "image/gif")})
    assert r.status_code == 400
    assert "GIF" in r.json()["detail"]


def test_ca_06_3_mas_de_5_mb_da_400(cliente):
    grande = imagen() + b"0" * TAMANO_MAXIMO_BYTES
    assert cliente.post("/predecir", files={"archivo": ("g.jpg", grande, "image/jpeg")}).status_code == 400


def test_sin_archivo_da_422(cliente):
    assert cliente.post("/predecir").status_code == 422


def test_ca_06_4_sin_modelos_cargados_da_503():
    main.estado["catalogo"] = None
    with TestClient(main.app) as c:
        main.estado["catalogo"] = None  # el arranque no encuentra modelos en este entorno de pruebas
        assert c.post("/predecir", files=foto()).status_code == 503
        assert c.post("/comparar", files=foto()).status_code == 503
        assert c.get("/salud").status_code == 503


def test_salud_con_modelos(cliente):
    r = cliente.get("/salud")
    assert r.status_code == 200
    assert r.json()["modelos"] == ["resnet50v2", "vit_b16", "cnn_propia"]


def test_clave_de_api(cliente, monkeypatch):
    monkeypatch.setattr(main, "API_KEY", "secreta")
    assert cliente.post("/predecir", files=foto()).status_code == 401
    assert cliente.get("/modelos").status_code == 401
    assert cliente.post("/comparar", files=foto(), headers={"X-API-Key": "otra"}).status_code == 401
    assert cliente.post("/predecir", files=foto(), headers={"X-API-Key": "secreta"}).status_code == 200


def test_metricas_cuentan_predicciones_por_modelo(cliente):
    cliente.post("/predecir?modelo=cnn_propia", files=foto())
    cliente.post("/comparar", files=foto())
    texto = cliente.get("/metrics").text
    assert 'predicciones_total{categoria="JASMINE",modelo="cnn_propia"}' in texto
    assert "comparaciones_total" in texto


def test_preprocesar_redimensiona_y_conserva_rango():
    lote = preprocesar(imagen(tamano=(300, 120), color=(255, 0, 10)), 224)
    assert lote.shape == (1, 224, 224, 3)
    assert lote[0, 100, 100].tolist() == pytest.approx([255, 0, 10], abs=2)


def test_catalogo_normaliza_probabilidades_y_pesos():
    cat = Catalogo({"a": ModeloFalso([1, 1, 2, 0, 0])}, [{"id": "a", "nombre": "A", "peso_ensamble": 7}], CLASES, 224, "a")
    p = cat.predecir(imagen())
    assert p.categoria == "IPSALA" and p.confianza == pytest.approx(0.5)
    assert cat.pesos == {"a": 1.0}


def test_modelo_por_defecto_inexistente_usa_el_primero():
    cat = Catalogo({"a": ModeloFalso([1, 0, 0, 0, 0])}, [{"id": "a", "nombre": "A"}], CLASES, 224, "no_existe")
    assert cat.por_defecto == "a"


def test_errores_de_dominio():
    with pytest.raises(ImagenInvalidaError):
        preprocesar(b"", 224)
    with pytest.raises(ModeloDesconocidoError):
        catalogo_falso().predecir(imagen(), "otro")
