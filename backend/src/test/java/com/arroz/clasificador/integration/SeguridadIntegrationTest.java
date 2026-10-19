/*
 * Nombre: SeguridadIntegrationTest.java
 * Descripción: Pruebas de seguridad sobre la aplicación completa: autenticación, tokens
 *              alterados o vencidos, permisos por rol, CORS y cabeceras de seguridad (HU-01).
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;

@DisplayName("Seguridad (aplicación completa)")
class SeguridadIntegrationTest extends IntegracionBase {

    @Autowired
    private JwtEncoder encoder;

    private String login(String usuario, String password) {
        return "{\"username\":\"%s\",\"password\":\"%s\"}".formatted(usuario, password);
    }

    @Test
    @DisplayName("CA-01.1 login correcto devuelve token Bearer con rol")
    void loginCorrecto() throws Exception {
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(login("admin", ADMIN_PASSWORD)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tipo").value("Bearer"))
                .andExpect(jsonPath("$.rol").value("ADMIN"))
                .andExpect(jsonPath("$.expiraEnSegundos").value(3600));
    }

    @ParameterizedTest(name = "usuario={0}")
    @CsvSource({"admin,clave-incorrecta", "no-existe,Admin123*"})
    @DisplayName("CA-01.2 contraseña incorrecta y usuario inexistente dan el mismo 401")
    void credencialesIncorrectas(String usuario, String password) throws Exception {
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(login(usuario, password)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Usuario o contraseña incorrectos"));
    }

    @Test
    @DisplayName("CA-01.5 login con campos vacíos: 400")
    void loginVacio() throws Exception {
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(login("", "")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores.username").exists())
                .andExpect(jsonPath("$.errores.password").exists());
    }

    @Test
    @DisplayName("CA-01.3 sin token: 401")
    void sinToken() throws Exception {
        mvc.perform(get("/api/v1/productos")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/clasificaciones")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("CA-01.3 token con la firma alterada: 401")
    void tokenAlterado() throws Exception {
        String token = admin();
        String alterado = token.substring(0, token.length() - 4) + (token.endsWith("AAAA") ? "BBBB" : "AAAA");
        mvc.perform(get("/api/v1/productos").header("Authorization", alterado))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("CA-01.3 token vencido: 401")
    void tokenVencido() throws Exception {
        Instant hace2h = Instant.now().minusSeconds(7200);
        JwtClaimsSet claims = JwtClaimsSet.builder().subject("admin").issuedAt(hace2h)
                .expiresAt(hace2h.plusSeconds(3600)).claim("roles", List.of("ADMIN")).build();
        String vencido = encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                .getTokenValue();
        mvc.perform(get("/api/v1/productos").header("Authorization", "Bearer " + vencido))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("CA-01.3 token firmado con otra clave: 401")
    void tokenOtraClave() throws Exception {
        // Token HS256 válido en formato, firmado con una clave distinta (generado aparte).
        String ajeno = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGVzIjpbIkFETUlOIl0sImV4cCI6NDEwMjQ0NDgwMH0."
                + "x0ZtVlpZrW9m2qkY4c6uS5u7h8v9w0x1y2z3a4b5c6d";
        mvc.perform(get("/api/v1/productos").header("Authorization", "Bearer " + ajeno))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("CA-01.4 el operario (USUARIO) no puede eliminar: 403")
    void operarioNoElimina() throws Exception {
        mvc.perform(delete("/api/v1/productos/1").header("Authorization", operario()))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/productos/1").header("Authorization", operario()))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("CA-07.1 errores de seguridad en inglés con Accept-Language: en")
    void seguridadEnIngles() throws Exception {
        mvc.perform(get("/api/v1/productos").header("Accept-Language", "en"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("You must sign in to access this resource"));
    }

    @Test
    @DisplayName("CORS: el origen del front-end está permitido")
    void corsPermitido() throws Exception {
        mvc.perform(options("/api/v1/productos")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }

    @Test
    @DisplayName("CORS: un origen desconocido es rechazado")
    void corsRechazado() throws Exception {
        mvc.perform(options("/api/v1/productos")
                        .header("Origin", "https://sitio-malicioso.example")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Cabeceras de seguridad presentes (nosniff, anti-iframe, sin caché)")
    void cabecerasSeguridad() throws Exception {
        mvc.perform(get("/api/v1/productos").header("Authorization", operario()))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().exists("Cache-Control"));
    }

    @Test
    @DisplayName("Una ruta inexistente no expone detalles internos")
    void rutaInexistente() throws Exception {
        mvc.perform(get("/api/v1/no-existe").header("Authorization", operario()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.trace").doesNotExist());
    }
}
