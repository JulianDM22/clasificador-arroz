"""
Nombre: crear_modelo_de_prueba.py
Descripción: Genera 5 modelos TensorFlow Lite de prueba (sin entrenar) con la misma interfaz que
             los reales (entrada 224×224×3 en 0-255, salida softmax de 5 clases) y su catálogo
             modelos.json, marcado como "es_prueba". Permite probar el sistema completo sin los
             modelos entrenados del notebook 08.
             Uso: python pruebas/crear_modelo_de_prueba.py <carpeta_destino>
Fecha de creación: 2026-10-18
Última actualización: 2026-10-18
Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
Versión: 1.1.0
"""
import json
import shutil
import sys
from pathlib import Path

import keras
import tensorflow as tf

destino = Path(sys.argv[1])
destino.mkdir(parents=True, exist_ok=True)
for viejo in list(destino.glob("*.tflite")) + list(destino.glob("*.json")):
    viejo.unlink()

MODELOS = [  # id, nombre, tipo — métricas reales de test del notebook 04, solo como referencia visual
    ("cnn_propia", "CNN propia", "CNN", 0.99081, 0.99085),
    ("efficientnetb0", "EfficientNetB0", "CNN", 0.99866, 0.99867),
    ("resnet50v2", "ResNet50V2", "CNN", 0.99911, 0.99911),
    ("vit_b16", "ViT-B/16", "Transformer", 0.99804, 0.99805),
    ("deit_s", "DeiT-S", "Transformer", 0.99563, 0.99563),
]
catalogo = {"clases": ["ARBORIO", "BASMATI", "IPSALA", "JASMINE", "KARACADAG"], "tamano_entrada": 224,
            "rango_pixeles": "0-255", "modelo_por_defecto": "resnet50v2", "es_prueba": True, "modelos": []}

for semilla, (mid, nombre, tipo, acc, f1) in enumerate(MODELOS):
    keras.utils.set_random_seed(semilla)
    entrada = keras.Input((224, 224, 3))
    x = keras.layers.GlobalAveragePooling2D()(keras.layers.Rescaling(1 / 255)(entrada))
    modelo = keras.Model(entrada, keras.layers.Dense(5, activation="softmax")(x))
    carpeta = destino / "_savedmodel"
    modelo.export(str(carpeta), verbose=False)
    contenido = tf.lite.TFLiteConverter.from_saved_model(str(carpeta)).convert()
    shutil.rmtree(carpeta)
    archivo = f"{mid}_prueba.tflite"
    (destino / archivo).write_bytes(contenido)
    catalogo["modelos"].append({"id": mid, "nombre": nombre, "tipo": tipo, "archivo": archivo, "cuantizacion": "prueba",
                                "accuracy_test": acc, "f1_test": f1, "params_M": 0.0, "mb": round(len(contenido) / 1e6, 3),
                                "ms_cpu": 0.0, "coincidencia_keras": None, "peso_ensamble": 0.2})

(destino / "modelos.json").write_text(json.dumps(catalogo, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"5 modelos de prueba en {destino}")
