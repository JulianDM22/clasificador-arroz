/*
 * Nombre: ClasificacionRepository.java
 * Descripción: Acceso a la tabla "clasificaciones" y consultas agregadas para el panel del
 *              administrador.
 * Fecha de creación: 2026-10-21
 * Última actualización: 2026-10-21
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.repository;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.arroz.clasificador.model.Clasificacion;

/**
 * Repositorio de {@link Clasificacion}.
 */
public interface ClasificacionRepository extends JpaRepository<Clasificacion, Long> {

    /**
     * @param desde fecha inicial (incluida)
     * @return cantidad de clasificaciones desde esa fecha
     */
    long countByFechaGreaterThanEqual(OffsetDateTime desde);

    /**
     * @return filas [variedad, cantidad]
     */
    @Query("SELECT c.categoria, COUNT(c) FROM Clasificacion c GROUP BY c.categoria")
    List<Object[]> contarPorCategoria();

    /**
     * @return filas [modelo, cantidad], de la más usada a la menos usada
     */
    @Query("SELECT c.modelo, COUNT(c) FROM Clasificacion c GROUP BY c.modelo ORDER BY COUNT(c) DESC")
    List<Object[]> contarPorModelo();

    /**
     * Cantidad por día (hora de Colombia) desde una fecha.
     *
     * @param desde fecha inicial (incluida)
     * @return filas [día (java.sql.Date), cantidad], en orden de fecha
     */
    @Query(value = """
            SELECT CAST(fecha AT TIME ZONE 'America/Bogota' AS DATE) AS dia, COUNT(*) AS cantidad
            FROM clasificaciones
            WHERE fecha >= :desde
            GROUP BY dia
            ORDER BY dia
            """, nativeQuery = true)
    List<Object[]> contarPorDia(@Param("desde") OffsetDateTime desde);
}
