/*
 * Nombre: ComparacionResponse.java
 * Descripción: Resultado de clasificar la misma foto con los 5 modelos y con el ensamble
 *              (criterio CA-06.7).
 * Fecha de creación: 2026-10-18
 * Última actualización: 2026-10-18
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.dto;

import java.util.List;

/**
 * Comparación de todos los modelos.
 *
 * @param modelos  predicción de cada modelo
 * @param ensamble predicción del voto suave ponderado
 * @param consenso {@code true} si todos los modelos sugieren la misma variedad
 */
public record ComparacionResponse(List<ClasificacionResponse> modelos, ClasificacionResponse ensamble, boolean consenso) {
}
