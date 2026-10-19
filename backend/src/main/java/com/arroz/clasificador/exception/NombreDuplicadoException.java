/*
 * Nombre: NombreDuplicadoException.java
 * Descripción: Se lanza cuando otro producto ya usa el mismo nombre (respuesta 409).
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.exception;

import lombok.Getter;

/**
 * El nombre del producto ya está registrado.
 */
@Getter
public class NombreDuplicadoException extends RuntimeException {

    private final String nombre;

    /**
     * @param nombre nombre repetido
     */
    public NombreDuplicadoException(String nombre) {
        super("Nombre duplicado: " + nombre);
        this.nombre = nombre;
    }
}
