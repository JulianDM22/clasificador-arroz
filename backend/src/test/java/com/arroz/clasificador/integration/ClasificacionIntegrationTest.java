/*
 * Nombre: ClasificacionIntegrationTest.java
 * Descripción: Pruebas de integración del endpoint de clasificación con un servicio de
 *              inferencia falso (servidor HTTP embebido) y con el servicio caído (HU-06).
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;

import com.sun.net.httpserver.HttpServer;

@DisplayName("Clasificación: integración")
class ClasificacionIntegrationTest {

    static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 1, 2, 3, 4};
    static final String CLAVE = "clave-compartida-de-prueba";

    /** Servicio de inferencia falso que siempre responde BASMATI. */
    static final HttpServer INFERENCIA_FALSA;

    static {
        try {
            INFERENCIA_FALSA = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
        INFERENCIA_FALSA.createContext("/predecir", intercambio -> {
            String consulta = intercambio.getRequestURI().getQuery();
            if (consulta != null && consulta.contains("modelo=inexistente")) {
                responder(intercambio, 404, "{\"detail\":\"Modelo no disponible\"}");
                return;
            }
            String modelo = consulta == null ? "resnet50v2" : consulta.replace("modelo=", "");
            responder(intercambio, 200, """
                    {"modelo":"%s","nombre":"Falso","categoria":"BASMATI","confianza":0.98,
                     "probabilidades":{"ARBORIO":0.0,"BASMATI":0.98,"IPSALA":0.0,"JASMINE":0.02,"KARACADAG":0.0},
                     "ms":3.5}""".formatted(modelo));
        });
        INFERENCIA_FALSA.createContext("/comparar", intercambio -> responder(intercambio, 200, """
                {"modelos":[
                   {"modelo":"resnet50v2","nombre":"ResNet50V2","categoria":"BASMATI","confianza":0.98,"probabilidades":{"BASMATI":0.98},"ms":40},
                   {"modelo":"vit_b16","nombre":"ViT-B/16","categoria":"BASMATI","confianza":0.95,"probabilidades":{"BASMATI":0.95},"ms":90}],
                 "ensamble":{"modelo":"ensamble","nombre":"Ensamble (2 modelos)","categoria":"BASMATI","confianza":0.97,"probabilidades":{"BASMATI":0.97},"ms":130},
                 "consenso":true}"""));
        INFERENCIA_FALSA.createContext("/modelos", intercambio -> responder(intercambio, 200, """
                {"modelo_por_defecto":"resnet50v2","ensamble_disponible":true,"es_prueba":false,
                 "modelos":[{"id":"resnet50v2","nombre":"ResNet50V2","tipo":"CNN","accuracy_test":0.99911,"peso_ensamble":0.6},
                            {"id":"vit_b16","nombre":"ViT-B/16","tipo":"Transformer","accuracy_test":0.99804,"peso_ensamble":0.4}]}"""));
        INFERENCIA_FALSA.start();
    }

    /** Responde como el servicio real: sin la clave compartida, 401. */
    static void responder(com.sun.net.httpserver.HttpExchange intercambio, int estado, String json) throws IOException {
        if (!CLAVE.equals(intercambio.getRequestHeaders().getFirst("X-API-Key"))) {
            intercambio.sendResponseHeaders(401, -1);
            intercambio.close();
            return;
        }
        byte[] r = json.getBytes(StandardCharsets.UTF_8);
        intercambio.getResponseHeaders().add("Content-Type", "application/json");
        intercambio.sendResponseHeaders(estado, r.length);
        try (OutputStream os = intercambio.getResponseBody()) {
            os.write(r);
        }
    }

    @AfterAll
    static void detener() {
        INFERENCIA_FALSA.stop(0);
    }

    @Nested
    @DisplayName("con el servicio de inferencia disponible")
    class Disponible extends IntegracionBase {

        @DynamicPropertySource
        static void url(DynamicPropertyRegistry r) {
            r.add("app.inferencia.url", () -> "http://localhost:" + INFERENCIA_FALSA.getAddress().getPort());
            r.add("app.inferencia.api-key", () -> CLAVE);
        }

        @Test
        @DisplayName("CA-06.1 una foto JPEG devuelve la variedad sugerida (el back-end envía la clave X-API-Key)")
        void clasifica() throws Exception {
            mvc.perform(multipart("/api/v1/clasificaciones")
                            .file(new MockMultipartFile("archivo", "grano.jpg", "image/jpeg", JPEG))
                            .header("Authorization", operario()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.categoria").value("BASMATI"))
                    .andExpect(jsonPath("$.confianza").value(0.98))
                    .andExpect(jsonPath("$.probabilidades.JASMINE").value(0.02));
        }

        @Test
        @DisplayName("CA-06.6 clasificar con el modelo elegido")
        void modeloElegido() throws Exception {
            mvc.perform(multipart("/api/v1/clasificaciones")
                            .file(new MockMultipartFile("archivo", "grano.jpg", "image/jpeg", JPEG))
                            .param("modelo", "vit_b16")
                            .header("Authorization", operario()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.modelo").value("vit_b16"))
                    .andExpect(jsonPath("$.ms").value(3.5));
        }

        @Test
        @DisplayName("CA-06.6 un modelo inexistente: 400 con mensaje claro")
        void modeloInexistente() throws Exception {
            mvc.perform(multipart("/api/v1/clasificaciones")
                            .file(new MockMultipartFile("archivo", "grano.jpg", "image/jpeg", JPEG))
                            .param("modelo", "inexistente")
                            .header("Authorization", operario()))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.startsWith("El modelo 'inexistente' no existe")));
        }

        @Test
        @DisplayName("CA-06.7 comparar los modelos devuelve cada predicción, el ensamble y el consenso")
        void comparar() throws Exception {
            mvc.perform(multipart("/api/v1/clasificaciones/comparacion")
                            .file(new MockMultipartFile("archivo", "grano.jpg", "image/jpeg", JPEG))
                            .header("Authorization", operario()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.modelos.length()").value(2))
                    .andExpect(jsonPath("$.modelos[1].nombre").value("ViT-B/16"))
                    .andExpect(jsonPath("$.ensamble.modelo").value("ensamble"))
                    .andExpect(jsonPath("$.consenso").value(true));
        }

        @Test
        @DisplayName("CA-06.7 el catálogo de modelos expone las métricas de test")
        void catalogo() throws Exception {
            mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v1/modelos")
                            .header("Authorization", operario()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.modelo_por_defecto").value("resnet50v2"))
                    .andExpect(jsonPath("$.modelos[0].accuracy_test").value(0.99911))
                    .andExpect(jsonPath("$.modelos[1].tipo").value("Transformer"));
        }

        @Test
        @DisplayName("CA-01.3 el catálogo de modelos exige sesión")
        void catalogoSinToken() throws Exception {
            mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v1/modelos"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("CA-06.2 un archivo que no es imagen: 400")
        void noImagen() throws Exception {
            mvc.perform(multipart("/api/v1/clasificaciones")
                            .file(new MockMultipartFile("archivo", "virus.jpg", "image/jpeg", "MZ ejecutable".getBytes()))
                            .header("Authorization", operario()))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.detail").value("El archivo debe ser una imagen JPEG o PNG"));
        }

        @Test
        @DisplayName("CA-06.2 sin archivo: 400")
        void sinArchivo() throws Exception {
            mvc.perform(multipart("/api/v1/clasificaciones").header("Authorization", operario()))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("CA-06.3 una imagen de más de 5 MB: 413")
        void muyGrande() throws Exception {
            byte[] grande = new byte[5 * 1024 * 1024 + 1];
            System.arraycopy(JPEG, 0, grande, 0, JPEG.length);
            mvc.perform(multipart("/api/v1/clasificaciones")
                            .file(new MockMultipartFile("archivo", "grande.jpg", "image/jpeg", grande))
                            .header("Authorization", operario()))
                    .andExpect(status().isPayloadTooLarge());
        }
    }

    @Nested
    @DisplayName("con el servicio de inferencia caído")
    @TestPropertySource(properties = {"app.inferencia.url=http://localhost:9", "app.inferencia.timeout-segundos=2"})
    class Caido extends IntegracionBase {

        @Test
        @DisplayName("CA-06.4 responde 503 con mensaje claro y el CRUD sigue funcionando")
        void servicioCaido() throws Exception {
            String token = operario();
            mvc.perform(multipart("/api/v1/clasificaciones")
                            .file(new MockMultipartFile("archivo", "grano.jpg", "image/jpeg", JPEG))
                            .header("Authorization", token))
                    .andExpect(status().isServiceUnavailable())
                    .andExpect(jsonPath("$.title").value("Servicio no disponible"));
            mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v1/productos")
                            .header("Authorization", token))
                    .andExpect(status().isOk());
        }
    }
}
