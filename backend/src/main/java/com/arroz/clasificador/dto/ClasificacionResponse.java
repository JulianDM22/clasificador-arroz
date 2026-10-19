/*
 * Nombre: ClasificacionResponse.java
 * Descripción: Resultado de clasificar la foto de un grano con un modelo o con el ensamble
 *              (criterios CA-06.1 y CA-06.6). Es el mismo formato JSON que devuelve el servicio de
 *              inferencia.
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-18
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.1.0
 */
package com.arroz.clasificador.dto;

import java.util.Map;

import com.arroz.clasificador.model.CategoriaArroz;

/**
 * Variedad sugerida para una imagen.
 *
 * @param modelo         id del modelo usado ("resnet50v2", ..., o "ensamble")
 * @param nombre         nombre legible del modelo
 * @param categoria      variedad más probable
 * @param confianza      probabilidad de esa variedad (0 a 1)
 * @param probabilidades probabilidad de cada variedad
 * @param ms             tiempo de inferencia en milisegundos
 */
public record ClasificacionResponse(
        String modelo,
        String nombre,
        CategoriaArroz categoria,
        double confianza,
        Map<CategoriaArroz, Double> probabilidades,
        Double ms) {
}
