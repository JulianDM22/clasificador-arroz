/*
 * Nombre: EstadisticasResponse.java
 * Descripción: Datos del panel del administrador (HU-10): inventario de lotes y uso del
 *              clasificador.
 * Fecha de creación: 2026-10-21
 * Última actualización: 2026-10-21
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import com.arroz.clasificador.model.CategoriaArroz;

/**
 * Estadísticas del sistema.
 *
 * @param lotes           inventario de lotes
 * @param clasificaciones uso del clasificador
 */
public record EstadisticasResponse(Lotes lotes, Clasificaciones clasificaciones) {

    /**
     * @param total       cantidad de lotes
     * @param activos     lotes activos
     * @param inactivos   lotes inactivos
     * @param porVariedad cantidad de lotes de cada variedad (incluye las variedades sin lotes)
     */
    public record Lotes(long total, long activos, long inactivos, Map<CategoriaArroz, Long> porVariedad) {
    }

    /**
     * @param total        clasificaciones registradas
     * @param ultimos7Dias clasificaciones de los últimos 7 días (incluido hoy)
     * @param porVariedad  variedad sugerida (incluye las variedades sin clasificaciones)
     * @param porModelo    modelo usado, del más usado al menos usado
     * @param porDia       cantidad de cada uno de los últimos 14 días (hora de Colombia)
     */
    public record Clasificaciones(long total, long ultimos7Dias, Map<CategoriaArroz, Long> porVariedad,
                                  Map<String, Long> porModelo, List<Dia> porDia) {
    }

    /**
     * @param fecha    día
     * @param cantidad clasificaciones de ese día
     */
    public record Dia(LocalDate fecha, long cantidad) {
    }
}
