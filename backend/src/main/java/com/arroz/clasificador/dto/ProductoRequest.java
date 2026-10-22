/*
 * Nombre: ProductoRequest.java
 * Descripción: Datos de entrada (JSON) para registrar o actualizar un producto, con sus
 *              validaciones (criterios CA-02.2 a CA-02.4). El estado no viene aquí: todo lote
 *              nuevo queda ACTIVO y solo ADMIN lo cambia con PATCH .../estado (CA-10.2).
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-21
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 2.0.0
 */
package com.arroz.clasificador.dto;

import com.arroz.clasificador.model.CategoriaArroz;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Cuerpo de las peticiones POST y PUT de productos.
 *
 * @param nombre      nombre único del lote, de 3 a 100 caracteres
 * @param categoria   variedad de arroz
 * @param descripcion texto libre opcional, máximo 500 caracteres
 */
@Schema(description = "Datos para registrar o actualizar un producto")
public record ProductoRequest(
        @Schema(example = "Lote Basmati premium 2026-10")
        @NotBlank(message = "{producto.nombre.obligatorio}")
        @Size(min = 3, max = 100, message = "{producto.nombre.tamano}")
        String nombre,

        @Schema(example = "BASMATI")
        @NotNull(message = "{producto.categoria.obligatoria}")
        CategoriaArroz categoria,

        @Schema(example = "Grano largo, cosecha de octubre")
        @Size(max = 500, message = "{producto.descripcion.tamano}")
        String descripcion) {
}
