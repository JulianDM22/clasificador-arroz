/*
 * Nombre: ServicioClasificacionException.java
 * Descripción: Se lanza cuando el servicio de inferencia no responde o falla (respuesta 503,
 *              criterio CA-06.4).
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.exception;

/**
 * El servicio de clasificación no está disponible.
 */
public class ServicioClasificacionException extends RuntimeException {

    /**
     * @param causa error original de la llamada HTTP
     */
    public ServicioClasificacionException(Throwable causa) {
        super("Servicio de inferencia no disponible", causa);
    }
}
