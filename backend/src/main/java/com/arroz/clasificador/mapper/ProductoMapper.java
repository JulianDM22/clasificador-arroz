/*
 * Nombre: ProductoMapper.java
 * Descripción: Conversión entre la entidad Producto y sus DTO JSON. Normaliza los textos
 *              (recorta espacios y convierte la descripción vacía en nula). Los lotes nuevos
 *              quedan ACTIVOS; el estado solo se cambia con ProductoService.cambiarEstado.
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-21
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.1.0
 */
package com.arroz.clasificador.mapper;

import com.arroz.clasificador.dto.ProductoRequest;
import com.arroz.clasificador.dto.ProductoResponse;
import com.arroz.clasificador.model.EstadoProducto;
import com.arroz.clasificador.model.Producto;

/**
 * Mapeador estático de productos.
 */
public final class ProductoMapper {

    private ProductoMapper() {
    }

    /**
     * Crea una entidad nueva, ACTIVA, a partir de la petición.
     *
     * @param req datos validados
     * @return entidad sin id
     */
    public static Producto aEntidad(ProductoRequest req) {
        Producto p = new Producto();
        p.setEstado(EstadoProducto.ACTIVO);
        actualizar(p, req);
        return p;
    }

    /**
     * Copia los datos de la petición sobre una entidad existente (sin tocar el estado).
     *
     * @param p   entidad a modificar
     * @param req datos validados
     */
    public static void actualizar(Producto p, ProductoRequest req) {
        p.setNombre(req.nombre().trim());
        p.setCategoria(req.categoria());
        p.setDescripcion(normalizar(req.descripcion()));
    }

    /**
     * Convierte la entidad en su representación JSON.
     *
     * @param p entidad
     * @return DTO de respuesta
     */
    public static ProductoResponse aRespuesta(Producto p) {
        return new ProductoResponse(p.getId(), p.getNombre(), p.getCategoria(), p.getDescripcion(),
                p.getEstado(), p.getFechaCreacion(), p.getFechaActualizacion());
    }

    private static String normalizar(String texto) {
        if (texto == null || texto.isBlank()) {
            return null;
        }
        return texto.trim();
    }
}
