/*
 * Nombre: ArchivoInvalidoException.java
 * Descripción: Se lanza cuando el archivo enviado a clasificar no es una imagen JPEG o PNG
 *              válida (respuesta 400, criterio CA-06.2).
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.exception;

import lombok.Getter;

/**
 * Archivo de imagen rechazado.
 */
@Getter
public class ArchivoInvalidoException extends RuntimeException {

    /** Clave del mensaje en messages.properties. */
    private final String claveMensaje;

    /**
     * @param claveMensaje clave i18n que explica el motivo
     */
    public ArchivoInvalidoException(String claveMensaje) {
        super(claveMensaje);
        this.claveMensaje = claveMensaje;
    }
}
