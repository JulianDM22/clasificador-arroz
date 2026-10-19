/*
 * Nombre: ProductoResponse.java
 * Descripción: Representación JSON de un producto que devuelve la API.
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.dto;

import java.time.OffsetDateTime;

import com.arroz.clasificador.model.CategoriaArroz;
import com.arroz.clasificador.model.EstadoProducto;

/**
 * Producto devuelto por la API.
 *
 * @param id                 identificador
 * @param nombre             nombre del lote
 * @param categoria          variedad
 * @param descripcion        descripción
 * @param estado             estado
 * @param fechaCreacion      fecha de registro
 * @param fechaActualizacion fecha de la última modificación
 */
public record ProductoResponse(
        Long id,
        String nombre,
        CategoriaArroz categoria,
        String descripcion,
        EstadoProducto estado,
        OffsetDateTime fechaCreacion,
        OffsetDateTime fechaActualizacion) {
}
