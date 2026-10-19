/*
 * Nombre: ArchivoGrandeException.java
 * Descripción: Se lanza cuando la imagen supera el tamaño máximo permitido (respuesta 413,
 *              criterio CA-06.3). Complementa el límite del contenedor web.
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.exception;

/**
 * Archivo de imagen demasiado grande.
 */
public class ArchivoGrandeException extends RuntimeException {

    /**
     * @param bytes tamaño recibido
     */
    public ArchivoGrandeException(long bytes) {
        super("Archivo demasiado grande: " + bytes + " bytes");
    }
}
