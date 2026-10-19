/*
 * Nombre: PaginaResponse.java
 * Descripción: Envoltura JSON estable para resultados paginados (criterio CA-03.1).
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.dto;

import java.util.List;

import org.springframework.data.domain.Page;

/**
 * Página de resultados.
 *
 * @param content       elementos de la página
 * @param page          número de página (desde 0)
 * @param size          tamaño de página
 * @param totalElements total de elementos
 * @param totalPages    total de páginas
 * @param <T>           tipo de los elementos
 */
public record PaginaResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages) {

    /**
     * Convierte una {@link Page} de Spring Data.
     *
     * @param pagina página de origen
     * @param <T>    tipo de los elementos
     * @return página serializable
     */
    public static <T> PaginaResponse<T> de(Page<T> pagina) {
        return new PaginaResponse<>(pagina.getContent(), pagina.getNumber(), pagina.getSize(),
                pagina.getTotalElements(), pagina.getTotalPages());
    }
}
