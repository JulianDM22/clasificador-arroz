/*
 * Nombre: CatalogoModelosResponse.java
 * Descripción: Modelos disponibles con sus métricas de test, para que el usuario elija con cuál
 *              clasificar y compare su desempeño (criterios CA-06.6 y CA-06.7).
 * Fecha de creación: 2026-10-18
 * Última actualización: 2026-10-18
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Catálogo de modelos.
 *
 * @param modeloPorDefecto   id del modelo que se usa si no se elige otro
 * @param ensambleDisponible si hay más de un modelo para combinar
 * @param esPrueba           {@code true} si los modelos cargados son de prueba (sin entrenar)
 * @param modelos            información de cada modelo
 */
public record CatalogoModelosResponse(
        @JsonProperty("modelo_por_defecto") String modeloPorDefecto,
        @JsonProperty("ensamble_disponible") boolean ensambleDisponible,
        @JsonProperty("es_prueba") boolean esPrueba,
        List<Modelo> modelos) {

    /**
     * Métricas de un modelo (las del notebook 04, sobre 11.206 imágenes de test).
     *
     * @param id            identificador
     * @param nombre        nombre legible
     * @param tipo          "CNN" o "Transformer"
     * @param accuracyTest  exactitud en test
     * @param f1Test        F1 macro en test
     * @param paramsM       millones de parámetros
     * @param mb            tamaño del archivo TFLite
     * @param msCpu         milisegundos por imagen en CPU (medido al exportar)
     * @param cuantizacion  precisión de los pesos (fp16 o int8)
     * @param pesoEnsamble  peso en el voto suave ponderado
     */
    public record Modelo(
            String id,
            String nombre,
            String tipo,
            @JsonProperty("accuracy_test") Double accuracyTest,
            @JsonProperty("f1_test") Double f1Test,
            @JsonProperty("params_M") Double paramsM,
            Double mb,
            @JsonProperty("ms_cpu") Double msCpu,
            String cuantizacion,
            @JsonProperty("peso_ensamble") Double pesoEnsamble) {
    }
}
