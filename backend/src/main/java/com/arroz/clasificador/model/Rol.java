/*
 * Nombre: Rol.java
 * Descripción: Roles de seguridad del sistema.
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.model;

/**
 * Rol de un usuario.
 */
public enum Rol {
    /** Consulta, registra, actualiza y clasifica. */
    USUARIO,
    /** Además de lo anterior, elimina productos. */
    ADMIN
}
