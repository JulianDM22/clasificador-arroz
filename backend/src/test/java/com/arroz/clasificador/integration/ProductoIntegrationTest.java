/*
 * Nombre: ProductoIntegrationTest.java
 * Descripción: Pruebas de integración y de sistema del CRUD: recorren la API real (seguridad,
 *              validación, servicio, JPA, Flyway y PostgreSQL) con un token obtenido por login.
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.containsStringIgnoringCase;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import com.fasterxml.jackson.databind.JsonNode;

@DisplayName("Productos: integración y sistema (PostgreSQL real)")
class ProductoIntegrationTest extends IntegracionBase {

    private String token;

    @BeforeEach
    void login() throws Exception {
        token = operario();
    }

    private static String unico(String base) {
        return base + " " + UUID.randomUUID().toString().substring(0, 8);
    }

    private static String cuerpo(String nombre, String categoria, String descripcion, String estado) {
        return """
                {"nombre":%s,"categoria":"%s","descripcion":%s,"estado":"%s"}
                """.formatted(cadena(nombre), categoria, cadena(descripcion), estado);
    }

    private static String cadena(String s) {
        return s == null ? "null" : "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
    }

    private JsonNode crear(String nombre, String categoria) throws Exception {
        String r = mvc.perform(post("/api/v1/productos").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo(nombre, categoria, "desc", "ACTIVO")))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(r);
    }

    @Test
    @DisplayName("Flyway cargó los 5 productos de ejemplo y el listado ordena por id (CA-03.1)")
    void datosIniciales() throws Exception {
        mvc.perform(get("/api/v1/productos?size=100").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(5)))
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].nombre").value("Lote Arborio 2026-01"));
    }

    @Test
    @DisplayName("Ciclo completo: crear → consultar → actualizar → eliminar (ADMIN) → 404 (CA-02.1, 03.3, 04.1, 05.1)")
    void cicloCompleto() throws Exception {
        String nombre = unico("Lote ciclo");
        JsonNode creado = crear(nombre, "JASMINE");
        long id = creado.get("id").asLong();
        assertThat(creado.get("fechaCreacion").asText()).isNotBlank();

        mvc.perform(get("/api/v1/productos/" + id).header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value(nombre));

        String nuevoNombre = unico("Lote ciclo editado");
        String actualizado = mvc.perform(put("/api/v1/productos/" + id).header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo(nuevoNombre, "BASMATI", null, "INACTIVO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categoria").value("BASMATI"))
                .andExpect(jsonPath("$.estado").value("INACTIVO"))
                .andReturn().getResponse().getContentAsString();
        assertThat(json.readTree(actualizado).get("fechaActualizacion").asText())
                .isGreaterThanOrEqualTo(creado.get("fechaActualizacion").asText());

        mvc.perform(delete("/api/v1/productos/" + id).header("Authorization", admin()))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/productos/" + id).header("Authorization", token))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("CA-02.1 la cabecera Location apunta al producto creado")
    void location() throws Exception {
        String ubicacion = mvc.perform(post("/api/v1/productos").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo(unico("Lote loc"), "IPSALA", null, "ACTIVO")))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andReturn().getResponse().getHeader("Location");
        mvc.perform(get(ubicacion).header("Authorization", token)).andExpect(status().isOk());
    }

    @Test
    @DisplayName("CA-02.5 nombre duplicado sin distinguir mayúsculas: 409")
    void duplicadoMayusculas() throws Exception {
        String nombre = unico("Lote dup");
        crear(nombre, "ARBORIO");
        mvc.perform(post("/api/v1/productos").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo(nombre.toUpperCase(), "ARBORIO", null, "ACTIVO")))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("CA-04.3 actualizar con el nombre de otro producto: 409 y no cambia")
    void actualizarDuplicado() throws Exception {
        String a = unico("Lote A");
        crear(a, "ARBORIO");
        long idB = crear(unico("Lote B"), "ARBORIO").get("id").asLong();

        mvc.perform(put("/api/v1/productos/" + idB).header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo(a, "ARBORIO", null, "ACTIVO")))
                .andExpect(status().isConflict());
        mvc.perform(get("/api/v1/productos/" + idB).header("Authorization", token))
                .andExpect(jsonPath("$.nombre", containsStringIgnoringCase("Lote B")));
    }

    @Test
    @DisplayName("CA-04.2 / CA-05.2 actualizar o eliminar un id inexistente: 404")
    void inexistentes() throws Exception {
        mvc.perform(put("/api/v1/productos/999999").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo("Lote fantasma", "ARBORIO", null, "ACTIVO")))
                .andExpect(status().isNotFound());
        mvc.perform(delete("/api/v1/productos/999999").header("Authorization", admin()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("CA-03.2 filtros por categoría, estado y texto")
    void filtros() throws Exception {
        String marca = UUID.randomUUID().toString().substring(0, 6);
        crear("Filtro " + marca + " uno", "KARACADAG");
        crear("Filtro " + marca + " dos", "KARACADAG");
        crear("Filtro " + marca + " tres", "IPSALA");

        mvc.perform(get("/api/v1/productos").param("q", marca.toUpperCase()).param("categoria", "KARACADAG")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.content[*].categoria", everyItem(is("KARACADAG"))));

        mvc.perform(get("/api/v1/productos").param("estado", "INACTIVO").header("Authorization", token))
                .andExpect(jsonPath("$.content[*].estado", everyItem(is("INACTIVO"))));
    }

    @Test
    @DisplayName("CA-03.2 los comodines % y _ del texto se buscan literalmente")
    void comodinesLiterales() throws Exception {
        String marca = UUID.randomUUID().toString().substring(0, 6);
        crear("Lote 100% " + marca, "BASMATI");
        crear("Lote 1000 " + marca, "BASMATI");
        mvc.perform(get("/api/v1/productos").param("q", "100% " + marca).header("Authorization", token))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("CA-03.4 el tamaño de página se limita a 100")
    void tamanoMaximo() throws Exception {
        mvc.perform(get("/api/v1/productos").param("size", "1000").header("Authorization", token))
                .andExpect(jsonPath("$.size").value(100));
    }

    @Test
    @DisplayName("CA-02.6 inyección SQL y <script> se guardan como texto literal")
    void textoMalicioso() throws Exception {
        String sql = "x' OR 1=1; DROP TABLE productos; -- " + UUID.randomUUID().toString().substring(0, 6);
        String xss = "<script>alert('xss')</script>";
        long id = json.readTree(mvc.perform(post("/api/v1/productos").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo(sql, "ARBORIO", xss, "ACTIVO")))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString()).get("id").asLong();

        mvc.perform(get("/api/v1/productos/" + id).header("Authorization", token))
                .andExpect(jsonPath("$.nombre").value(sql))
                .andExpect(jsonPath("$.descripcion").value(xss));
        // La tabla sigue existiendo y la búsqueda con comillas no altera la consulta.
        mvc.perform(get("/api/v1/productos").param("q", "' OR '1'='1").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    @DisplayName("CA-09.2 /actuator/health responde UP e incluye la base de datos")
    void salud() throws Exception {
        mvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.components.db.status").value("UP"));
    }

    @Test
    @DisplayName("La documentación OpenAPI es pública y describe los endpoints")
    void openApi() throws Exception {
        mvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title").value("API Clasificador de Arroz"))
                .andExpect(jsonPath("$.paths['/api/v1/productos']").exists());
    }
}
