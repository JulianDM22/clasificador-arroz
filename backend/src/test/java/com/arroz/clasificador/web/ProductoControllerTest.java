/*
 * Nombre: ProductoControllerTest.java
 * Descripción: Pruebas de la capa web con Spring Test (@WebMvcTest): validaciones, valores
 *              límite, códigos HTTP, permisos por rol e idioma de los mensajes. El servicio se
 *              simula con Mockito, así que no se necesita base de datos.
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.arroz.clasificador.config.AppProperties;
import com.arroz.clasificador.config.SecurityConfig;
import com.arroz.clasificador.config.WebConfig;
import com.arroz.clasificador.controller.ProductoController;
import com.arroz.clasificador.dto.PaginaResponse;
import com.arroz.clasificador.dto.ProductoRequest;
import com.arroz.clasificador.dto.ProductoResponse;
import com.arroz.clasificador.exception.NombreDuplicadoException;
import com.arroz.clasificador.exception.RecursoNoEncontradoException;
import com.arroz.clasificador.model.CategoriaArroz;
import com.arroz.clasificador.model.EstadoProducto;
import com.arroz.clasificador.service.ProductoService;
import com.arroz.clasificador.service.UsuarioDetailsService;

@WebMvcTest(ProductoController.class)
@Import({SecurityConfig.class, WebConfig.class})
@EnableConfigurationProperties(AppProperties.class)
@DisplayName("ProductoController (Spring Test, capa web)")
class ProductoControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private ProductoService servicio;

    @MockitoBean
    private UsuarioDetailsService usuarios;

    private static final OffsetDateTime AHORA = OffsetDateTime.parse("2026-10-17T12:00:00Z");

    private static JwtRequestPostProcessor usuario() {
        return jwt().authorities(new SimpleGrantedAuthority("ROLE_USUARIO"));
    }

    private static JwtRequestPostProcessor admin() {
        return jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    private static String json(String nombre, String categoria, String descripcion, String estado) {
        StringBuilder sb = new StringBuilder("{");
        if (nombre != null) {
            sb.append("\"nombre\":\"").append(nombre).append("\",");
        }
        if (categoria != null) {
            sb.append("\"categoria\":\"").append(categoria).append("\",");
        }
        if (descripcion != null) {
            sb.append("\"descripcion\":\"").append(descripcion).append("\",");
        }
        if (estado != null) {
            sb.append("\"estado\":\"").append(estado).append("\",");
        }
        if (sb.length() > 1) {
            sb.setLength(sb.length() - 1);
        }
        return sb.append("}").toString();
    }

    private static ProductoResponse respuesta(Long id, String nombre) {
        return new ProductoResponse(id, nombre, CategoriaArroz.BASMATI, null, EstadoProducto.ACTIVO, AHORA, AHORA);
    }

    @Test
    @DisplayName("CA-02.1 POST válido responde 201 con Location")
    void creaProducto() throws Exception {
        when(servicio.crear(any())).thenReturn(respuesta(10L, "Lote nuevo"));

        mvc.perform(post("/api/v1/productos").with(usuario())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("Lote nuevo", "BASMATI", null, "ACTIVO")))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "http://localhost/api/v1/productos/10"))
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.nombre").value("Lote nuevo"));
    }

    @ParameterizedTest(name = "nombre de {0} caracteres → {1}")
    @CsvSource({"2,400", "3,201", "50,201", "100,201", "101,400"})
    @DisplayName("CA-02.2 valores límite de la longitud del nombre")
    void limitesNombre(int largo, int estado) throws Exception {
        when(servicio.crear(any())).thenReturn(respuesta(1L, "x"));
        mvc.perform(post("/api/v1/productos").with(usuario())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("a".repeat(largo), "IPSALA", null, "ACTIVO")))
                .andExpect(status().is(estado));
    }

    @ParameterizedTest(name = "descripción de {0} caracteres → {1}")
    @CsvSource({"0,201", "499,201", "500,201", "501,400"})
    @DisplayName("CA-02.3 valores límite de la longitud de la descripción")
    void limitesDescripcion(int largo, int estado) throws Exception {
        when(servicio.crear(any())).thenReturn(respuesta(1L, "x"));
        mvc.perform(post("/api/v1/productos").with(usuario())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("Lote", "IPSALA", "d".repeat(largo), "ACTIVO")))
                .andExpect(status().is(estado));
    }

    @Test
    @DisplayName("CA-02.2 nombre vacío: 400 con el error en el campo nombre, en español")
    void nombreVacio() throws Exception {
        mvc.perform(post("/api/v1/productos").with(usuario())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("   ", "IPSALA", null, "ACTIVO")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores.nombre").value("El nombre es obligatorio"));
        verify(servicio, never()).crear(any());
    }

    @Test
    @DisplayName("CA-02.4 sin categoría ni estado: 400 con ambos errores")
    void faltanEnumeraciones() throws Exception {
        mvc.perform(post("/api/v1/productos").with(usuario())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("Lote", null, null, null)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores.categoria").exists())
                .andExpect(jsonPath("$.errores.estado").exists());
    }

    @Test
    @DisplayName("CA-02.4 categoría no permitida: 400")
    void categoriaInvalida() throws Exception {
        mvc.perform(post("/api/v1/productos").with(usuario())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("Lote", "INTEGRAL", null, "ACTIVO")))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("CA-02.5 nombre duplicado: 409")
    void duplicado() throws Exception {
        when(servicio.crear(any())).thenThrow(new NombreDuplicadoException("Lote"));
        mvc.perform(post("/api/v1/productos").with(usuario())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("Lote", "IPSALA", null, "ACTIVO")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Ya existe un producto con el nombre 'Lote'"));
    }

    @Test
    @DisplayName("CA-07.1 con Accept-Language: en los mensajes salen en inglés")
    void mensajesEnIngles() throws Exception {
        mvc.perform(post("/api/v1/productos").with(usuario())
                        .header("Accept-Language", "en")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("ab", "IPSALA", null, "ACTIVO")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Bad request"))
                .andExpect(jsonPath("$.errores.nombre").value("Name must be between 3 and 100 characters"));
    }

    @Test
    @DisplayName("CA-03.1 GET lista con paginación")
    void lista() throws Exception {
        when(servicio.listar(eq(CategoriaArroz.BASMATI), eq(null), eq("lote"), eq(0), eq(20)))
                .thenReturn(new PaginaResponse<>(List.of(respuesta(1L, "Lote")), 0, 20, 1, 1));
        mvc.perform(get("/api/v1/productos?categoria=BASMATI&q=lote").with(usuario()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].nombre").value("Lote"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("CA-03.3 id inexistente: 404")
    void noExiste() throws Exception {
        when(servicio.obtener(99L)).thenThrow(new RecursoNoEncontradoException(99L));
        mvc.perform(get("/api/v1/productos/99").with(usuario()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("No existe un producto con id 99"));
    }

    @Test
    @DisplayName("CA-03.3 id no numérico: 400")
    void idNoNumerico() throws Exception {
        mvc.perform(get("/api/v1/productos/abc").with(usuario()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("CA-04.1 PUT válido responde 200")
    void actualiza() throws Exception {
        when(servicio.actualizar(eq(5L), any(ProductoRequest.class))).thenReturn(respuesta(5L, "Cambiado"));
        mvc.perform(put("/api/v1/productos/5").with(usuario())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("Cambiado", "BASMATI", null, "INACTIVO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Cambiado"));
    }

    @Test
    @DisplayName("CA-01.4 USUARIO no puede eliminar: 403")
    void usuarioNoElimina() throws Exception {
        mvc.perform(delete("/api/v1/productos/5").with(usuario()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.detail").value("Su rol no tiene permiso para realizar esta acción"));
        verify(servicio, never()).eliminar(any());
    }

    @Test
    @DisplayName("CA-05.1 ADMIN elimina: 204")
    void adminElimina() throws Exception {
        mvc.perform(delete("/api/v1/productos/5").with(admin()))
                .andExpect(status().isNoContent());
        verify(servicio).eliminar(5L);
    }

    @Test
    @DisplayName("CA-01.3 sin token: 401 en JSON")
    void sinToken() throws Exception {
        mvc.perform(get("/api/v1/productos"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string("WWW-Authenticate", "Bearer"))
                .andExpect(jsonPath("$.detail").value("Debe iniciar sesión para acceder a este recurso"));
    }

    @Test
    @DisplayName("JSON mal formado: 400 sin detalles internos")
    void jsonMalFormado() throws Exception {
        mvc.perform(post("/api/v1/productos").with(usuario())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{nombre:"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value(
                        "El cuerpo de la petición no es JSON válido o contiene valores no permitidos"));
    }
}
