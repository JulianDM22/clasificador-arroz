/*
 * Nombre: ProductoServiceTest.java
 * Descripción: Pruebas unitarias del servicio de productos con Mockito (el repositorio se
 *              simula). Cubren reglas de negocio y valores límite de paginación.
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-21
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.unit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import com.arroz.clasificador.dto.PaginaResponse;
import com.arroz.clasificador.dto.ProductoRequest;
import com.arroz.clasificador.dto.ProductoResponse;
import com.arroz.clasificador.exception.NombreDuplicadoException;
import com.arroz.clasificador.exception.RecursoNoEncontradoException;
import com.arroz.clasificador.model.CategoriaArroz;
import com.arroz.clasificador.model.EstadoProducto;
import com.arroz.clasificador.model.Producto;
import com.arroz.clasificador.repository.ProductoRepository;
import com.arroz.clasificador.service.ProductoService;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductoService (unitarias)")
class ProductoServiceTest {

    @Mock
    private ProductoRepository repositorio;

    @InjectMocks
    private ProductoService servicio;

    private static ProductoRequest peticion(String nombre) {
        return new ProductoRequest(nombre, CategoriaArroz.BASMATI, "desc");
    }

    private static Producto producto(Long id, String nombre) {
        return Producto.builder().id(id).nombre(nombre).categoria(CategoriaArroz.BASMATI)
                .descripcion("desc").estado(EstadoProducto.ACTIVO).build();
    }

    @Nested
    @DisplayName("crear")
    class Crear {

        @Test
        @DisplayName("CA-02.1 guarda el producto con el nombre recortado y lo devuelve")
        void creaProducto() {
            when(repositorio.existsByNombreIgnoreCase("Lote 1")).thenReturn(false);
            when(repositorio.save(any(Producto.class))).thenAnswer(inv -> {
                Producto p = inv.getArgument(0);
                p.setId(7L);
                return p;
            });

            ProductoResponse r = servicio.crear(peticion("  Lote 1  "));

            ArgumentCaptor<Producto> captor = ArgumentCaptor.forClass(Producto.class);
            verify(repositorio).save(captor.capture());
            assertThat(captor.getValue().getNombre()).isEqualTo("Lote 1");
            assertThat(r.id()).isEqualTo(7L);
            assertThat(r.categoria()).isEqualTo(CategoriaArroz.BASMATI);
        }

        @Test
        @DisplayName("CA-02.5 rechaza un nombre que ya existe sin guardar nada")
        void rechazaDuplicado() {
            when(repositorio.existsByNombreIgnoreCase("Lote 1")).thenReturn(true);

            assertThatThrownBy(() -> servicio.crear(peticion("Lote 1")))
                    .isInstanceOf(NombreDuplicadoException.class)
                    .extracting("nombre").isEqualTo("Lote 1");
            verify(repositorio, never()).save(any());
        }
    }

    @Nested
    @DisplayName("obtener")
    class Obtener {

        @Test
        @DisplayName("CA-03.3 devuelve el producto existente")
        void existente() {
            when(repositorio.findById(1L)).thenReturn(Optional.of(producto(1L, "Lote")));
            assertThat(servicio.obtener(1L).nombre()).isEqualTo("Lote");
        }

        @Test
        @DisplayName("CA-03.3 lanza 404 si no existe")
        void inexistente() {
            when(repositorio.findById(9L)).thenReturn(Optional.empty());
            assertThatThrownBy(() -> servicio.obtener(9L))
                    .isInstanceOf(RecursoNoEncontradoException.class)
                    .extracting("id").isEqualTo(9L);
        }
    }

    @Nested
    @DisplayName("actualizar")
    class Actualizar {

        @Test
        @DisplayName("CA-04.1 copia los datos nuevos y guarda, sin cambiar el estado")
        void actualiza() {
            Producto existente = producto(3L, "Viejo");
            when(repositorio.findById(3L)).thenReturn(Optional.of(existente));
            when(repositorio.existsByNombreIgnoreCaseAndIdNot("Nuevo", 3L)).thenReturn(false);
            when(repositorio.saveAndFlush(existente)).thenReturn(existente);

            ProductoRequest req = new ProductoRequest("Nuevo", CategoriaArroz.IPSALA, null);
            ProductoResponse r = servicio.actualizar(3L, req);

            assertThat(r.nombre()).isEqualTo("Nuevo");
            assertThat(r.categoria()).isEqualTo(CategoriaArroz.IPSALA);
            assertThat(r.estado()).isEqualTo(EstadoProducto.ACTIVO);
            assertThat(r.descripcion()).isNull();
        }

        @Test
        @DisplayName("CA-04.2 lanza 404 si no existe y no consulta duplicados")
        void inexistente() {
            when(repositorio.findById(3L)).thenReturn(Optional.empty());
            assertThatThrownBy(() -> servicio.actualizar(3L, peticion("X y z")))
                    .isInstanceOf(RecursoNoEncontradoException.class);
            verify(repositorio, never()).existsByNombreIgnoreCaseAndIdNot(anyString(), any());
        }

        @Test
        @DisplayName("CA-04.3 rechaza un nombre usado por otro producto")
        void duplicado() {
            when(repositorio.findById(3L)).thenReturn(Optional.of(producto(3L, "Viejo")));
            when(repositorio.existsByNombreIgnoreCaseAndIdNot("Otro", 3L)).thenReturn(true);
            assertThatThrownBy(() -> servicio.actualizar(3L, peticion("Otro")))
                    .isInstanceOf(NombreDuplicadoException.class);
            verify(repositorio, never()).saveAndFlush(any());
        }
    }

    @Nested
    @DisplayName("cambiar estado")
    class CambiarEstado {

        @Test
        @DisplayName("CA-10.2 guarda el nuevo estado y lo devuelve")
        void cambia() {
            Producto p = producto(6L, "Lote");
            when(repositorio.findById(6L)).thenReturn(Optional.of(p));
            when(repositorio.saveAndFlush(p)).thenReturn(p);

            ProductoResponse r = servicio.cambiarEstado(6L, EstadoProducto.INACTIVO);

            assertThat(r.estado()).isEqualTo(EstadoProducto.INACTIVO);
            assertThat(p.getEstado()).isEqualTo(EstadoProducto.INACTIVO);
            verify(repositorio).saveAndFlush(p);
        }

        @Test
        @DisplayName("CA-10.2 lanza 404 si el lote no existe")
        void inexistente() {
            when(repositorio.findById(6L)).thenReturn(Optional.empty());
            assertThatThrownBy(() -> servicio.cambiarEstado(6L, EstadoProducto.ACTIVO))
                    .isInstanceOf(RecursoNoEncontradoException.class);
            verify(repositorio, never()).saveAndFlush(any());
        }
    }

    @Nested
    @DisplayName("eliminar")
    class Eliminar {

        @Test
        @DisplayName("CA-05.1 elimina el producto existente")
        void elimina() {
            Producto p = producto(4L, "Lote");
            when(repositorio.findById(4L)).thenReturn(Optional.of(p));
            servicio.eliminar(4L);
            verify(repositorio).delete(p);
        }

        @Test
        @DisplayName("CA-05.2 lanza 404 si no existe")
        void inexistente() {
            when(repositorio.findById(4L)).thenReturn(Optional.empty());
            assertThatThrownBy(() -> servicio.eliminar(4L)).isInstanceOf(RecursoNoEncontradoException.class);
            verify(repositorio, never()).delete(any());
        }
    }

    @Nested
    @DisplayName("listar")
    class Listar {

        @Test
        @DisplayName("CA-03.2 convierte el texto a patrón LIKE en minúsculas y escapa comodines")
        void patronDeBusqueda() {
            Page<Producto> pagina = new PageImpl<>(List.of(producto(1L, "Lote")));
            // "  50%_X " → recortado, en minúsculas y con "%" y "_" escapados.
            when(repositorio.buscar(eq(CategoriaArroz.BASMATI), eq(EstadoProducto.ACTIVO), eq("%50\\%\\_x%"), any()))
                    .thenReturn(pagina);

            PaginaResponse<ProductoResponse> r = servicio.listar(CategoriaArroz.BASMATI, EstadoProducto.ACTIVO,
                    "  50%_X ", 0, 20);

            assertThat(r.content()).hasSize(1);
            assertThat(r.totalElements()).isEqualTo(1);
        }

        @Test
        @DisplayName("CA-03.2 un texto vacío no filtra")
        void textoVacio() {
            ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
            when(repositorio.buscar(isNull(), isNull(), isNull(), pageable.capture()))
                    .thenReturn(new PageImpl<>(List.of()));

            servicio.listar(null, null, "   ", -3, 20);

            assertThat(pageable.getValue().getPageNumber()).isZero();
            assertThat(pageable.getValue().getSort().getOrderFor("id")).isNotNull();
        }
    }

    @ParameterizedTest(name = "tamaño pedido {0} → {1}")
    @CsvSource({"-1,20", "0,20", "1,1", "20,20", "99,99", "100,100", "101,100", "5000,100"})
    @DisplayName("CA-03.4 límites del tamaño de página")
    void limitesTamano(int pedido, int esperado) {
        ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
        when(repositorio.buscar(any(), any(), any(), pageable.capture())).thenReturn(new PageImpl<>(List.of()));

        servicio.listar(null, null, null, 0, pedido);

        assertThat(pageable.getValue().getPageSize()).isEqualTo(esperado);
    }
}
