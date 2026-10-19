/*
 * Nombre: ProductoService.java
 * Descripción: Reglas de negocio del CRUD de productos: unicidad del nombre, límites de
 *              paginación y existencia antes de actualizar o eliminar (HU-02 a HU-05).
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.service;

import java.util.Locale;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.arroz.clasificador.dto.PaginaResponse;
import com.arroz.clasificador.dto.ProductoRequest;
import com.arroz.clasificador.dto.ProductoResponse;
import com.arroz.clasificador.exception.NombreDuplicadoException;
import com.arroz.clasificador.exception.RecursoNoEncontradoException;
import com.arroz.clasificador.mapper.ProductoMapper;
import com.arroz.clasificador.model.CategoriaArroz;
import com.arroz.clasificador.model.EstadoProducto;
import com.arroz.clasificador.model.Producto;
import com.arroz.clasificador.repository.ProductoRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Servicio de productos.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductoService {

    /** Tamaño de página por defecto (CA-03.4). */
    public static final int TAMANO_POR_DEFECTO = 20;
    /** Tamaño máximo de página (CA-03.4). */
    public static final int TAMANO_MAXIMO = 100;

    private final ProductoRepository repositorio;

    /**
     * Lista productos con filtros opcionales.
     *
     * @param categoria variedad o {@code null}
     * @param estado    estado o {@code null}
     * @param texto     texto contenido en el nombre o {@code null}
     * @param pagina    número de página (los negativos se tratan como 0)
     * @param tamano    tamaño de página (se limita entre 1 y 100; inválido → 20)
     * @return página de productos ordenada por id
     */
    @Transactional(readOnly = true)
    public PaginaResponse<ProductoResponse> listar(CategoriaArroz categoria, EstadoProducto estado,
                                                   String texto, int pagina, int tamano) {
        Pageable pageable = PageRequest.of(Math.max(pagina, 0), tamanoValido(tamano), Sort.by("id"));
        String patron = (texto == null || texto.isBlank())
                ? null
                : "%" + escaparLike(texto.trim().toLowerCase(Locale.ROOT)) + "%";
        return PaginaResponse.de(repositorio.buscar(categoria, estado, patron, pageable)
                .map(ProductoMapper::aRespuesta));
    }

    /**
     * Obtiene un producto.
     *
     * @param id identificador
     * @return producto
     * @throws RecursoNoEncontradoException si no existe
     */
    @Transactional(readOnly = true)
    public ProductoResponse obtener(Long id) {
        return ProductoMapper.aRespuesta(buscar(id));
    }

    /**
     * Registra un producto nuevo.
     *
     * @param req datos validados
     * @return producto creado
     * @throws NombreDuplicadoException si el nombre ya existe
     */
    @Transactional
    public ProductoResponse crear(ProductoRequest req) {
        String nombre = req.nombre().trim();
        if (repositorio.existsByNombreIgnoreCase(nombre)) {
            throw new NombreDuplicadoException(nombre);
        }
        Producto guardado = repositorio.save(ProductoMapper.aEntidad(req));
        log.info("Producto creado id={}", guardado.getId());
        return ProductoMapper.aRespuesta(guardado);
    }

    /**
     * Actualiza un producto existente.
     *
     * @param id  identificador
     * @param req datos validados
     * @return producto actualizado
     * @throws RecursoNoEncontradoException si no existe
     * @throws NombreDuplicadoException     si otro producto usa el nombre
     */
    @Transactional
    public ProductoResponse actualizar(Long id, ProductoRequest req) {
        Producto producto = buscar(id);
        String nombre = req.nombre().trim();
        if (repositorio.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw new NombreDuplicadoException(nombre);
        }
        ProductoMapper.actualizar(producto, req);
        Producto guardado = repositorio.saveAndFlush(producto);
        log.info("Producto actualizado id={}", id);
        return ProductoMapper.aRespuesta(guardado);
    }

    /**
     * Elimina un producto.
     *
     * @param id identificador
     * @throws RecursoNoEncontradoException si no existe
     */
    @Transactional
    public void eliminar(Long id) {
        repositorio.delete(buscar(id));
        log.info("Producto eliminado id={}", id);
    }

    /**
     * Aplica los límites de tamaño de página (CA-03.4).
     *
     * @param tamano tamaño pedido
     * @return tamaño entre 1 y {@value #TAMANO_MAXIMO}
     */
    static int tamanoValido(int tamano) {
        if (tamano <= 0) {
            return TAMANO_POR_DEFECTO;
        }
        return Math.min(tamano, TAMANO_MAXIMO);
    }

    /**
     * Escapa los comodines de LIKE para que "%" y "_" se busquen como texto literal.
     *
     * @param texto texto del usuario
     * @return texto escapado
     */
    static String escaparLike(String texto) {
        return texto.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }

    private Producto buscar(Long id) {
        return repositorio.findById(id).orElseThrow(() -> new RecursoNoEncontradoException(id));
    }
}
