/*
 * Nombre: ModeloDesconocidoException.java
 * Descripción: Se lanza cuando se pide clasificar con un modelo que no existe (respuesta 400,
 *              criterio CA-06.6).
 * Fecha de creación: 2026-10-18
 * Última actualización: 2026-10-18
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.exception;

import lombok.Getter;

/**
 * Modelo de clasificación inexistente.
 */
@Getter
public class ModeloDesconocidoException extends RuntimeException {

    private final String modelo;

    /**
     * @param modelo id pedido
     */
    public ModeloDesconocidoException(String modelo) {
        super("Modelo desconocido: " + modelo);
        this.modelo = modelo;
    }
}
