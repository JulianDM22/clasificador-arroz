/*
 * Nombre: ClasificacionServiceTest.java
 * Descripción: Pruebas unitarias del cliente del servicio de inferencia. El servidor HTTP se
 *              simula con MockRestServiceServer (HU-06).
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.unit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import com.arroz.clasificador.dto.ClasificacionResponse;
import com.arroz.clasificador.exception.ArchivoGrandeException;
import com.arroz.clasificador.exception.ArchivoInvalidoException;
import com.arroz.clasificador.exception.ServicioClasificacionException;
import com.arroz.clasificador.model.CategoriaArroz;
import com.arroz.clasificador.service.ClasificacionService;

@DisplayName("ClasificacionService (unitarias)")
class ClasificacionServiceTest {

    static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 1, 2};
    static final byte[] PNG = {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0};
    static final String RESPUESTA = """
            {"categoria":"BASMATI","confianza":0.97,
             "probabilidades":{"ARBORIO":0.01,"BASMATI":0.97,"IPSALA":0.0,"JASMINE":0.02,"KARACADAG":0.0},
             "modelo":"resnet50v2"}
            """;

    private MockRestServiceServer servidor;
    private ClasificacionService servicio;

    @BeforeEach
    void preparar() {
        RestClient.Builder builder = RestClient.builder().baseUrl("http://inferencia");
        servidor = MockRestServiceServer.bindTo(builder).build();
        servicio = new ClasificacionService(builder.build());
    }

    @Test
    @DisplayName("CA-06.1 envía un JPEG y devuelve la variedad sugerida")
    void clasificaJpeg() {
        servidor.expect(requestTo("http://inferencia/predecir")).andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(RESPUESTA, MediaType.APPLICATION_JSON));

        ClasificacionResponse r = servicio.clasificar(new MockMultipartFile("archivo", "g.jpg", "image/jpeg", JPEG));

        assertThat(r.categoria()).isEqualTo(CategoriaArroz.BASMATI);
        assertThat(r.confianza()).isEqualTo(0.97);
        assertThat(r.probabilidades()).hasSize(5);
        servidor.verify();
    }

    @Test
    @DisplayName("CA-06.1 reenvía la imagen en la parte 'archivo' conservando el nombre original")
    void reenviaParteArchivo() {
        servidor.expect(requestTo("http://inferencia/predecir"))
                .andExpect(content().string(containsString("name=\"archivo\"; filename=\"grano.jpg\"")))
                .andRespond(withSuccess(RESPUESTA, MediaType.APPLICATION_JSON));
        servicio.clasificar(new MockMultipartFile("archivo", "grano.jpg", "image/jpeg", JPEG));
        servidor.verify();
    }

    @Test
    @DisplayName("CA-06.1 si el archivo no trae nombre se envía como 'imagen'")
    void nombrePorDefecto() {
        servidor.expect(requestTo("http://inferencia/predecir"))
                .andExpect(content().string(containsString("filename=\"imagen\"")))
                .andRespond(withSuccess(RESPUESTA, MediaType.APPLICATION_JSON));
        servicio.clasificar(new MockMultipartFile("archivo", null, "image/jpeg", JPEG));
        servidor.verify();
    }

    @Test
    @DisplayName("CA-06.2 valor límite: un archivo del tamaño exacto de la firma JPEG o PNG es aceptado")
    void firmaExacta() {
        servidor.expect(requestTo("http://inferencia/predecir"))
                .andRespond(withSuccess(RESPUESTA, MediaType.APPLICATION_JSON));
        servidor.expect(requestTo("http://inferencia/predecir"))
                .andRespond(withSuccess(RESPUESTA, MediaType.APPLICATION_JSON));
        byte[] soloJpeg = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
        byte[] soloPng = {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
        assertThat(servicio.clasificar(new MockMultipartFile("archivo", "a.jpg", null, soloJpeg))).isNotNull();
        assertThat(servicio.clasificar(new MockMultipartFile("archivo", "a.png", null, soloPng))).isNotNull();
    }

    @Test
    @DisplayName("CA-06.1 acepta PNG aunque el nombre no tenga extensión")
    void clasificaPng() {
        servidor.expect(requestTo("http://inferencia/predecir"))
                .andRespond(withSuccess(RESPUESTA, MediaType.APPLICATION_JSON));
        assertThat(servicio.clasificar(new MockMultipartFile("archivo", "sin_extension", null, PNG)).categoria())
                .isEqualTo(CategoriaArroz.BASMATI);
    }

    @Test
    @DisplayName("CA-06.2 rechaza un archivo vacío")
    void vacio() {
        assertThatThrownBy(() -> servicio.clasificar(new MockMultipartFile("archivo", new byte[0])))
                .isInstanceOf(ArchivoInvalidoException.class)
                .extracting("claveMensaje").isEqualTo("error.archivo.vacio");
    }

    @Test
    @DisplayName("CA-06.2 rechaza un archivo nulo")
    void nulo() {
        assertThatThrownBy(() -> servicio.clasificar(null)).isInstanceOf(ArchivoInvalidoException.class);
    }

    @Test
    @DisplayName("CA-06.2 rechaza un texto disfrazado de .jpg (se revisa el contenido real)")
    void noEsImagen() {
        MockMultipartFile falso = new MockMultipartFile("archivo", "foto.jpg", "image/jpeg", "<?php echo 1; ?>".getBytes());
        assertThatThrownBy(() -> servicio.clasificar(falso))
                .isInstanceOf(ArchivoInvalidoException.class)
                .extracting("claveMensaje").isEqualTo("error.archivo.tipo");
    }

    @Test
    @DisplayName("CA-06.2 rechaza archivos más cortos que la firma")
    void muyCorto() {
        assertThatThrownBy(() -> servicio.clasificar(new MockMultipartFile("archivo", new byte[]{(byte) 0xFF, (byte) 0xD8})))
                .isInstanceOf(ArchivoInvalidoException.class);
    }

    @Test
    @DisplayName("CA-06.3 límite de tamaño: 5 MB exactos se aceptan, 5 MB + 1 byte no")
    void limiteTamano() {
        byte[] justo = new byte[(int) ClasificacionService.TAMANO_MAXIMO];
        System.arraycopy(JPEG, 0, justo, 0, JPEG.length);
        servidor.expect(requestTo("http://inferencia/predecir"))
                .andRespond(withSuccess(RESPUESTA, MediaType.APPLICATION_JSON));
        assertThat(servicio.clasificar(new MockMultipartFile("archivo", "g.jpg", "image/jpeg", justo)).categoria())
                .isEqualTo(CategoriaArroz.BASMATI);

        byte[] excede = new byte[justo.length + 1];
        System.arraycopy(JPEG, 0, excede, 0, JPEG.length);
        assertThatThrownBy(() -> servicio.clasificar(new MockMultipartFile("archivo", "g.jpg", "image/jpeg", excede)))
                .isInstanceOf(ArchivoGrandeException.class);
    }

    @Test
    @DisplayName("CA-06.4 un error del servicio de inferencia se convierte en 503")
    void servicioCaido() {
        servidor.expect(requestTo("http://inferencia/predecir")).andRespond(withServerError());
        assertThatThrownBy(() -> servicio.clasificar(new MockMultipartFile("archivo", "g.jpg", "image/jpeg", JPEG)))
                .isInstanceOf(ServicioClasificacionException.class);
    }

    @Test
    @DisplayName("CA-06.4 una respuesta sin categoría se trata como servicio no disponible")
    void respuestaIncompleta() {
        servidor.expect(requestTo("http://inferencia/predecir"))
                .andRespond(withSuccess("{\"confianza\":0.5}", MediaType.APPLICATION_JSON));
        assertThatThrownBy(() -> servicio.clasificar(new MockMultipartFile("archivo", "g.jpg", "image/jpeg", JPEG)))
                .isInstanceOf(ServicioClasificacionException.class);
    }
}
