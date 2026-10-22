/*
 * Nombre: EstadisticasServiceTest.java
 * Descripción: Pruebas unitarias (JUnit 5 + Mockito) del cálculo de estadísticas del panel del
 *              administrador (HU-10): totales, variedades sin datos en 0, ventana de 7 días y
 *              serie de 14 días con huecos.
 * Fecha de creación: 2026-10-21
 * Última actualización: 2026-10-21
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.unit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.sql.Date;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import com.arroz.clasificador.dto.EstadisticasResponse;
import com.arroz.clasificador.model.CategoriaArroz;
import com.arroz.clasificador.model.EstadoProducto;
import com.arroz.clasificador.repository.ClasificacionRepository;
import com.arroz.clasificador.repository.ProductoRepository;
import com.arroz.clasificador.service.EstadisticasService;

@ExtendWith(MockitoExtension.class)
@DisplayName("EstadisticasService (unitarias)")
class EstadisticasServiceTest {

    /** 21-oct-2026 a las 02:00 UTC = 20-oct-2026 a las 21:00 en Colombia. */
    private static final Clock RELOJ = Clock.fixed(Instant.parse("2026-10-21T02:00:00Z"), ZoneOffset.UTC);
    private static final LocalDate HOY_COLOMBIA = LocalDate.of(2026, 10, 20);

    @Mock
    private ProductoRepository productos;

    @Mock
    private ClasificacionRepository clasificaciones;

    private EstadisticasService servicio;

    @BeforeEach
    void preparar() {
        servicio = new EstadisticasService(productos, clasificaciones, RELOJ);
    }

    private static List<Object[]> filas(Object[]... filas) {
        return List.of(filas);
    }

    @Test
    @DisplayName("CA-10.1 lotes: total, activos, inactivos y por variedad (las que no tienen lotes en 0)")
    void lotes() {
        when(productos.countByEstado(EstadoProducto.ACTIVO)).thenReturn(7L);
        when(productos.countByEstado(EstadoProducto.INACTIVO)).thenReturn(2L);
        when(productos.contarPorCategoria()).thenReturn(filas(
                new Object[] {CategoriaArroz.BASMATI, 6L}, new Object[] {CategoriaArroz.JASMINE, 3L}));

        EstadisticasResponse.Lotes l = servicio.calcular().lotes();

        assertThat(l.total()).isEqualTo(9);
        assertThat(l.activos()).isEqualTo(7);
        assertThat(l.inactivos()).isEqualTo(2);
        assertThat(l.porVariedad()).containsExactly(
                Map.entry(CategoriaArroz.ARBORIO, 0L), Map.entry(CategoriaArroz.BASMATI, 6L),
                Map.entry(CategoriaArroz.IPSALA, 0L), Map.entry(CategoriaArroz.JASMINE, 3L),
                Map.entry(CategoriaArroz.KARACADAG, 0L));
    }

    @Test
    @DisplayName("CA-10.1 clasificaciones: total, por variedad y por modelo en orden de uso")
    void clasificaciones() {
        when(clasificaciones.count()).thenReturn(40L);
        when(clasificaciones.countByFechaGreaterThanEqual(Mockito.any())).thenReturn(12L);
        when(clasificaciones.contarPorCategoria()).thenReturn(filas(new Object[] {CategoriaArroz.IPSALA, 40L}));
        when(clasificaciones.contarPorModelo()).thenReturn(filas(
                new Object[] {"resnet50v2", 30L}, new Object[] {"ensamble", 10L}));

        EstadisticasResponse.Clasificaciones c = servicio.calcular().clasificaciones();

        assertThat(c.total()).isEqualTo(40);
        assertThat(c.ultimos7Dias()).isEqualTo(12);
        assertThat(c.porVariedad()).containsEntry(CategoriaArroz.IPSALA, 40L).containsEntry(CategoriaArroz.ARBORIO, 0L);
        assertThat(c.porModelo()).containsExactly(Map.entry("resnet50v2", 30L), Map.entry("ensamble", 10L));
    }

    @Test
    @DisplayName("CA-10.1 los días se cuentan en hora de Colombia: 7 días = desde el 14-oct a las 00:00 (-05:00)")
    void ventanaDeSieteDias() {
        servicio.calcular();

        ArgumentCaptor<OffsetDateTime> desde7 = ArgumentCaptor.forClass(OffsetDateTime.class);
        Mockito.verify(clasificaciones).countByFechaGreaterThanEqual(desde7.capture());
        assertThat(desde7.getValue()).isEqualTo(OffsetDateTime.parse("2026-10-14T00:00:00-05:00"));
        ArgumentCaptor<OffsetDateTime> desde14 = ArgumentCaptor.forClass(OffsetDateTime.class);
        Mockito.verify(clasificaciones).contarPorDia(desde14.capture());
        assertThat(desde14.getValue()).isEqualTo(OffsetDateTime.parse("2026-10-07T00:00:00-05:00"));
    }

    @Test
    @DisplayName("CA-10.1 la serie tiene 14 días hasta hoy, con 0 en los días sin clasificaciones")
    void serieDeCatorceDias() {
        when(clasificaciones.contarPorDia(Mockito.any())).thenReturn(filas(
                new Object[] {Date.valueOf(HOY_COLOMBIA.minusDays(13)), 2L},
                new Object[] {Date.valueOf(HOY_COLOMBIA), 5L}));

        List<EstadisticasResponse.Dia> dias = servicio.calcular().clasificaciones().porDia();

        assertThat(dias).hasSize(EstadisticasService.DIAS_GRAFICA);
        assertThat(dias.get(0)).isEqualTo(new EstadisticasResponse.Dia(HOY_COLOMBIA.minusDays(13), 2));
        assertThat(dias.get(1).cantidad()).isZero();
        assertThat(dias.get(13)).isEqualTo(new EstadisticasResponse.Dia(HOY_COLOMBIA, 5));
        assertThat(dias).extracting(EstadisticasResponse.Dia::cantidad).containsOnly(0L, 2L, 5L);
    }

    @Test
    @DisplayName("la serie también acepta el día como LocalDate")
    void diaComoLocalDate() {
        when(clasificaciones.contarPorDia(Mockito.any())).thenReturn(filas(new Object[] {HOY_COLOMBIA, 3}));

        List<EstadisticasResponse.Dia> dias = servicio.calcular().clasificaciones().porDia();

        assertThat(dias.get(13).cantidad()).isEqualTo(3);
    }
}
