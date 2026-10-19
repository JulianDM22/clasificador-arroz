/*
 * Nombre: ProductoMapperTest.java
 * Descripción: Pruebas unitarias de la normalización de textos al convertir DTO ↔ entidad.
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.unit;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.OffsetDateTime;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

import com.arroz.clasificador.dto.ProductoRequest;
import com.arroz.clasificador.dto.ProductoResponse;
import com.arroz.clasificador.mapper.ProductoMapper;
import com.arroz.clasificador.model.CategoriaArroz;
import com.arroz.clasificador.model.EstadoProducto;
import com.arroz.clasificador.model.Producto;

@DisplayName("ProductoMapper (unitarias)")
class ProductoMapperTest {

    @Test
    @DisplayName("recorta nombre y descripción")
    void recortaTextos() {
        Producto p = ProductoMapper.aEntidad(new ProductoRequest("  Lote A ", CategoriaArroz.JASMINE,
                "  grano largo  ", EstadoProducto.ACTIVO));
        assertThat(p.getNombre()).isEqualTo("Lote A");
        assertThat(p.getDescripcion()).isEqualTo("grano largo");
        assertThat(p.getCategoria()).isEqualTo(CategoriaArroz.JASMINE);
        assertThat(p.getEstado()).isEqualTo(EstadoProducto.ACTIVO);
        assertThat(p.getId()).isNull();
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"", "   "})
    @DisplayName("una descripción vacía se guarda como nula")
    void descripcionVacia(String descripcion) {
        Producto p = ProductoMapper.aEntidad(new ProductoRequest("Lote", CategoriaArroz.IPSALA,
                descripcion, EstadoProducto.INACTIVO));
        assertThat(p.getDescripcion()).isNull();
    }

    @Test
    @DisplayName("la respuesta copia todos los campos")
    void respuestaCompleta() {
        OffsetDateTime t = OffsetDateTime.parse("2026-10-17T10:00:00Z");
        Producto p = new Producto(5L, "Lote", CategoriaArroz.KARACADAG, "d", EstadoProducto.ACTIVO, t, t.plusHours(1));
        ProductoResponse r = ProductoMapper.aRespuesta(p);
        assertThat(r).isEqualTo(new ProductoResponse(5L, "Lote", CategoriaArroz.KARACADAG, "d",
                EstadoProducto.ACTIVO, t, t.plusHours(1)));
    }
}
