/*
 * Nombre: TipoClasificacion.java
 * Descripción: Forma en que se pidió una clasificación: con un solo modelo o comparando los 5.
 * Fecha de creación: 2026-10-21
 * Última actualización: 2026-10-21
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.model;

/**
 * Tipo de clasificación registrada.
 */
public enum TipoClasificacion {
    /** Clasificación con un modelo o con el ensamble. */
    UN_MODELO,
    /** Comparación de los 5 modelos y el ensamble sobre la misma foto. */
    COMPARACION
}
