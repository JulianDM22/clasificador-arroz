/*
 * Nombre: IntegracionBase.java
 * Descripción: Base de las pruebas de integración y de sistema: levanta la aplicación completa
 *              contra una PostgreSQL real en Docker (Testcontainers), compartida por todas las
 *              clases, y ofrece utilidades para iniciar sesión.
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
abstract class IntegracionBase {

    /** Una sola base de datos para toda la ejecución de pruebas. */
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    static {
        POSTGRES.start();
    }

    static final String ADMIN_PASSWORD = "Admin123*";
    static final String OPERARIO_PASSWORD = "Operario123*";

    @Autowired
    protected MockMvc mvc;

    @Autowired
    protected ObjectMapper json;

    /**
     * Inicia sesión con la API real y devuelve la cabecera Authorization.
     *
     * @param usuario  nombre de usuario
     * @param password contraseña
     * @return "Bearer &lt;token&gt;"
     * @throws Exception si la petición falla
     */
    protected String bearer(String usuario, String password) throws Exception {
        String cuerpo = mvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"%s\",\"password\":\"%s\"}".formatted(usuario, password)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        JsonNode nodo = json.readTree(cuerpo);
        return "Bearer " + nodo.get("token").asText();
    }

    protected String admin() throws Exception {
        return bearer("admin", ADMIN_PASSWORD);
    }

    protected String operario() throws Exception {
        return bearer("operario", OPERARIO_PASSWORD);
    }
}
