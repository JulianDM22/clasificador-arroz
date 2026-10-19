/*
 * Nombre: EstadoProducto.java
 * Descripción: Estados posibles de un producto en el inventario.
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.model;

/**
 * Estado de un producto.
 */
public enum EstadoProducto {
    /** Lote disponible en inventario. */
    ACTIVO,
    /** Lote retirado o agotado. */
    INACTIVO
}
