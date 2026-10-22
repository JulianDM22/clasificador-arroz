/*
 * Nombre: EstadisticasService.java
 * Descripción: Calcula las estadísticas del panel del administrador (HU-10) a partir de los lotes
 *              y del registro de clasificaciones.
 * Fecha de creación: 2026-10-21
 * Última actualización: 2026-10-21
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.service;

import java.sql.Date;
import java.time.Clock;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.arroz.clasificador.dto.EstadisticasResponse;
import com.arroz.clasificador.model.CategoriaArroz;
import com.arroz.clasificador.model.EstadoProducto;
import com.arroz.clasificador.repository.ClasificacionRepository;
import com.arroz.clasificador.repository.ProductoRepository;

/**
 * Estadísticas de lotes y de uso del clasificador.
 */
@Service
@Transactional(readOnly = true)
public class EstadisticasService {

    /** Zona horaria en la que se agrupan los días. */
    public static final ZoneId ZONA = ZoneId.of("America/Bogota");
    /** Días que muestra la gráfica de uso. */
    public static final int DIAS_GRAFICA = 14;

    private final ProductoRepository productos;
    private final ClasificacionRepository clasificaciones;
    private final Clock reloj;

    /**
     * @param productos       repositorio de lotes
     * @param clasificaciones repositorio de clasificaciones
     * @param reloj           reloj del sistema (se reemplaza en las pruebas)
     */
    public EstadisticasService(ProductoRepository productos, ClasificacionRepository clasificaciones, Clock reloj) {
        this.productos = productos;
        this.clasificaciones = clasificaciones;
        this.reloj = reloj;
    }

    /**
     * @return estadísticas actuales
     */
    public EstadisticasResponse calcular() {
        long activos = productos.countByEstado(EstadoProducto.ACTIVO);
        long inactivos = productos.countByEstado(EstadoProducto.INACTIVO);
        EstadisticasResponse.Lotes lotes = new EstadisticasResponse.Lotes(activos + inactivos, activos, inactivos,
                porVariedad(productos.contarPorCategoria()));

        LocalDate hoy = LocalDate.now(reloj.withZone(ZONA));
        OffsetDateTime desde7 = hoy.minusDays(6).atStartOfDay(ZONA).toOffsetDateTime();
        OffsetDateTime desde14 = hoy.minusDays(DIAS_GRAFICA - 1L).atStartOfDay(ZONA).toOffsetDateTime();
        Map<String, Long> porModelo = new LinkedHashMap<>();
        for (Object[] fila : clasificaciones.contarPorModelo()) {
            porModelo.put((String) fila[0], ((Number) fila[1]).longValue());
        }
        EstadisticasResponse.Clasificaciones uso = new EstadisticasResponse.Clasificaciones(
                clasificaciones.count(),
                clasificaciones.countByFechaGreaterThanEqual(desde7),
                porVariedad(clasificaciones.contarPorCategoria()),
                porModelo,
                porDia(clasificaciones.contarPorDia(desde14), hoy));
        return new EstadisticasResponse(lotes, uso);
    }

    /**
     * Cantidad por variedad, con 0 en las variedades que no aparecen.
     *
     * @param filas filas [variedad, cantidad]
     * @return las 5 variedades en orden
     */
    static Map<CategoriaArroz, Long> porVariedad(List<Object[]> filas) {
        Map<CategoriaArroz, Long> mapa = new EnumMap<>(CategoriaArroz.class);
        for (CategoriaArroz c : CategoriaArroz.values()) {
            mapa.put(c, 0L);
        }
        for (Object[] fila : filas) {
            mapa.put((CategoriaArroz) fila[0], ((Number) fila[1]).longValue());
        }
        return mapa;
    }

    /**
     * Los últimos {@value #DIAS_GRAFICA} días hasta hoy, con 0 en los días sin clasificaciones.
     *
     * @param filas filas [día, cantidad]; el día llega como {@link Date} desde PostgreSQL
     * @param hoy   último día de la serie
     * @return un elemento por día, del más antiguo al más reciente
     */
    static List<EstadisticasResponse.Dia> porDia(List<Object[]> filas, LocalDate hoy) {
        Map<LocalDate, Long> conteo = new HashMap<>();
        for (Object[] fila : filas) {
            LocalDate fecha = fila[0] instanceof Date d ? d.toLocalDate() : (LocalDate) fila[0];
            conteo.put(fecha, ((Number) fila[1]).longValue());
        }
        List<EstadisticasResponse.Dia> dias = new ArrayList<>();
        for (int i = DIAS_GRAFICA - 1; i >= 0; i--) {
            LocalDate fecha = hoy.minusDays(i);
            dias.add(new EstadisticasResponse.Dia(fecha, conteo.getOrDefault(fecha, 0L)));
        }
        return dias;
    }
}
