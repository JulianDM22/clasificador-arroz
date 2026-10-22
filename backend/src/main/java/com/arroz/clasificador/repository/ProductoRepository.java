/*
 * Nombre: ProductoRepository.java
 * Descripción: Acceso a datos de productos con Spring Data JPA. Las consultas usan parámetros
 *              enlazados, lo que impide la inyección SQL (criterio CA-02.6).
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-21
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.1.0
 */
package com.arroz.clasificador.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.arroz.clasificador.model.CategoriaArroz;
import com.arroz.clasificador.model.EstadoProducto;
import com.arroz.clasificador.model.Producto;

/**
 * Repositorio de {@link Producto}.
 */
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    /**
     * Indica si existe un producto con ese nombre, sin distinguir mayúsculas.
     *
     * @param nombre nombre a buscar
     * @return {@code true} si existe
     */
    boolean existsByNombreIgnoreCase(String nombre);

    /**
     * Indica si otro producto (distinto de {@code id}) usa ese nombre.
     *
     * @param nombre nombre a buscar
     * @param id     producto que se excluye
     * @return {@code true} si otro producto lo usa
     */
    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);

    /**
     * @param estado estado a contar
     * @return cantidad de lotes en ese estado
     */
    long countByEstado(EstadoProducto estado);

    /**
     * @return filas [variedad, cantidad de lotes]
     */
    @Query("SELECT p.categoria, COUNT(p) FROM Producto p GROUP BY p.categoria")
    List<Object[]> contarPorCategoria();

    /**
     * Busca con filtros opcionales: un filtro nulo no restringe.
     *
     * @param categoria variedad o {@code null}
     * @param estado    estado o {@code null}
     * @param texto     texto contenido en el nombre, en minúsculas y con comodines, o {@code null}
     * @param pageable  paginación y orden
     * @return página de productos
     */
    @Query("""
            SELECT p FROM Producto p
            WHERE (:categoria IS NULL OR p.categoria = :categoria)
              AND (:estado IS NULL OR p.estado = :estado)
              AND (:texto IS NULL OR LOWER(p.nombre) LIKE :texto ESCAPE '\\')
            """)
    Page<Producto> buscar(@Param("categoria") CategoriaArroz categoria,
                          @Param("estado") EstadoProducto estado,
                          @Param("texto") String texto,
                          Pageable pageable);
}
