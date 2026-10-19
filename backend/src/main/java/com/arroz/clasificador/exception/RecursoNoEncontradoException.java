/*
 * Nombre: RecursoNoEncontradoException.java
 * Descripción: Se lanza cuando un producto no existe (respuesta 404).
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.exception;

import lombok.Getter;

/**
 * El recurso solicitado no existe.
 */
@Getter
public class RecursoNoEncontradoException extends RuntimeException {

    private final Long id;

    /**
     * @param id identificador buscado
     */
    public RecursoNoEncontradoException(Long id) {
        super("Producto no encontrado: " + id);
        this.id = id;
    }
}
