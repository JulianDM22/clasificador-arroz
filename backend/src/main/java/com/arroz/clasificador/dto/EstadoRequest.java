/*
 * Nombre: EstadoRequest.java
 * Descripción: Cuerpo JSON para activar o desactivar un lote (solo ADMIN, HU-10).
 * Fecha de creación: 2026-10-21
 * Última actualización: 2026-10-21
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.dto;

import com.arroz.clasificador.model.EstadoProducto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

/**
 * Nuevo estado de un lote.
 *
 * @param estado ACTIVO o INACTIVO
 */
public record EstadoRequest(
        @Schema(example = "INACTIVO")
        @NotNull(message = "{producto.estado.obligatorio}")
        EstadoProducto estado) {
}
