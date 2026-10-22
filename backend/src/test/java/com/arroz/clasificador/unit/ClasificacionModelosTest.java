/*
 * Nombre: ClasificacionModelosTest.java
 * Descripción: Pruebas unitarias de la selección de modelo, el ensamble, la comparación de los 5
 *              modelos y el catálogo de métricas (CA-06.6, CA-06.7). El servicio de inferencia se
 *              simula con MockRestServiceServer.
 * Fecha de creación: 2026-10-18
 * Última actualización: 2026-10-21
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.unit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withBadRequest;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withResourceNotFound;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import com.arroz.clasificador.dto.CatalogoModelosResponse;
import com.arroz.clasificador.dto.ClasificacionResponse;
import com.arroz.clasificador.dto.ComparacionResponse;
import com.arroz.clasificador.exception.ArchivoInvalidoException;
import com.arroz.clasificador.exception.ModeloDesconocidoException;
import com.arroz.clasificador.exception.ServicioClasificacionException;
import com.arroz.clasificador.model.CategoriaArroz;
import com.arroz.clasificador.model.Clasificacion;
import com.arroz.clasificador.model.TipoClasificacion;
import com.arroz.clasificador.repository.ClasificacionRepository;
import com.arroz.clasificador.service.ClasificacionService;

@DisplayName("ClasificacionService: selección de modelo, comparación y catálogo (unitarias)")
class ClasificacionModelosTest {

    static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 1, 2};
    static final String PRED_CNN = """
            {"modelo":"cnn_propia","nombre":"CNN propia","categoria":"JASMINE","confianza":0.81,
             "probabilidades":{"ARBORIO":0.1,"BASMATI":0.05,"IPSALA":0.02,"JASMINE":0.81,"KARACADAG":0.02},"ms":4.2}
            """;
    static final String COMPARACION = """
            {"modelos":[
               {"modelo":"resnet50v2","nombre":"ResNet50V2","categoria":"BASMATI","confianza":0.99,"probabilidades":{"BASMATI":0.99},"ms":40.0},
               {"modelo":"cnn_propia","nombre":"CNN propia","categoria":"JASMINE","confianza":0.81,"probabilidades":{"JASMINE":0.81},"ms":4.0}],
             "ensamble":{"modelo":"ensamble","nombre":"Ensamble (2 modelos)","categoria":"BASMATI","confianza":0.7,"probabilidades":{"BASMATI":0.7},"ms":44.0},
             "consenso":false}
            """;
    static final String CATALOGO = """
            {"modelo_por_defecto":"resnet50v2","ensamble_disponible":true,"es_prueba":false,"clases":["ARBORIO"],
             "modelos":[{"id":"resnet50v2","nombre":"ResNet50V2","tipo":"CNN","archivo":"r.tflite","accuracy_test":0.99911,
                         "f1_test":0.99911,"params_M":23.58,"mb":47.0,"ms_cpu":120.5,"cuantizacion":"fp16",
                         "coincidencia_keras":1.0,"peso_ensamble":0.33}]}
            """;

    private final ClasificacionRepository registro = Mockito.mock(ClasificacionRepository.class);
    private MockRestServiceServer servidor;
    private ClasificacionService servicio;

    @BeforeEach
    void preparar() {
        RestClient.Builder builder = RestClient.builder().baseUrl("http://inferencia");
        servidor = MockRestServiceServer.bindTo(builder).build();
        servicio = new ClasificacionService(builder.build(), registro);
    }

    private static MockMultipartFile foto() {
        return new MockMultipartFile("archivo", "g.jpg", "image/jpeg", JPEG);
    }

    @Test
    @DisplayName("CA-06.6 envía el modelo elegido como parámetro y devuelve su predicción")
    void modeloElegido() {
        servidor.expect(requestTo("http://inferencia/predecir?modelo=cnn_propia")).andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(PRED_CNN, MediaType.APPLICATION_JSON));

        ClasificacionResponse r = servicio.clasificar(foto(), "cnn_propia");

        assertThat(r.modelo()).isEqualTo("cnn_propia");
        assertThat(r.nombre()).isEqualTo("CNN propia");
        assertThat(r.categoria()).isEqualTo(CategoriaArroz.JASMINE);
        assertThat(r.ms()).isEqualTo(4.2);
        servidor.verify();
    }

    @Test
    @DisplayName("CA-06.6 el ensamble se pide como un modelo más")
    void ensamble() {
        servidor.expect(requestTo("http://inferencia/predecir?modelo=ensamble"))
                .andRespond(withSuccess(PRED_CNN, MediaType.APPLICATION_JSON));
        assertThat(servicio.clasificar(foto(), "ensamble")).isNotNull();
        servidor.verify();
    }

    @ParameterizedTest
    @ValueSource(strings = {"../admin", "resnet50v2&modelo=x", "ResNet", "", "a b"})
    @DisplayName("CA-06.6 ids de modelo con caracteres no permitidos se rechazan sin llamar al servicio")
    void idInvalido(String id) {
        assertThatThrownBy(() -> servicio.clasificar(foto(), id))
                .isInstanceOf(ModeloDesconocidoException.class)
                .extracting("modelo").isEqualTo(id);
        servidor.verify();
    }

    @Test
    @DisplayName("CA-06.6 un modelo que el servicio no conoce (404) se informa como modelo desconocido")
    void modeloInexistente() {
        servidor.expect(requestTo("http://inferencia/predecir?modelo=resnet152")).andRespond(withResourceNotFound());
        assertThatThrownBy(() -> servicio.clasificar(foto(), "resnet152"))
                .isInstanceOf(ModeloDesconocidoException.class)
                .extracting("modelo").isEqualTo("resnet152");
    }

    @Test
    @DisplayName("CA-06.2 una imagen que pasa la firma pero no se puede leer (400) se informa como archivo ilegible")
    void imagenIlegible() {
        servidor.expect(requestTo("http://inferencia/predecir")).andRespond(withBadRequest());
        assertThatThrownBy(() -> servicio.clasificar(foto()))
                .isInstanceOf(ArchivoInvalidoException.class)
                .extracting("claveMensaje").isEqualTo("error.archivo.ilegible");
    }

    @Test
    @DisplayName("CA-06.7 la comparación devuelve cada modelo, el ensamble y el consenso")
    void comparar() {
        servidor.expect(requestTo("http://inferencia/comparar")).andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(COMPARACION, MediaType.APPLICATION_JSON));

        ComparacionResponse r = servicio.comparar(foto());

        assertThat(r.modelos()).extracting(ClasificacionResponse::modelo).containsExactly("resnet50v2", "cnn_propia");
        assertThat(r.ensamble().categoria()).isEqualTo(CategoriaArroz.BASMATI);
        assertThat(r.consenso()).isFalse();

        // CA-10.1 se registra una sola fila: la del ensamble, marcada como comparación.
        ArgumentCaptor<Clasificacion> guardada = ArgumentCaptor.forClass(Clasificacion.class);
        Mockito.verify(registro).save(guardada.capture());
        assertThat(guardada.getValue().getTipo()).isEqualTo(TipoClasificacion.COMPARACION);
        assertThat(guardada.getValue().getModelo()).isEqualTo("ensamble");
        assertThat(guardada.getValue().getCategoria()).isEqualTo(CategoriaArroz.BASMATI);
        assertThat(guardada.getValue().getConfianza()).isEqualTo(0.7);
    }

    @Test
    @DisplayName("CA-06.7 una comparación sin modelos se trata como servicio no disponible")
    void comparacionVacia() {
        servidor.expect(requestTo("http://inferencia/comparar"))
                .andRespond(withSuccess("{\"modelos\":[],\"consenso\":true}", MediaType.APPLICATION_JSON));
        assertThatThrownBy(() -> servicio.comparar(foto())).isInstanceOf(ServicioClasificacionException.class);
    }

    @Test
    @DisplayName("CA-06.7 la comparación también valida la imagen antes de llamar al servicio")
    void comparacionValida() {
        assertThatThrownBy(() -> servicio.comparar(new MockMultipartFile("archivo", "x.jpg", "image/jpeg", "texto".getBytes())))
                .isInstanceOf(ArchivoInvalidoException.class);
        servidor.verify();
    }

    @Test
    @DisplayName("CA-06.7 el catálogo trae las métricas de cada modelo")
    void catalogo() {
        servidor.expect(requestTo("http://inferencia/modelos")).andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(CATALOGO, MediaType.APPLICATION_JSON));

        CatalogoModelosResponse r = servicio.catalogo();

        assertThat(r.modeloPorDefecto()).isEqualTo("resnet50v2");
        assertThat(r.ensambleDisponible()).isTrue();
        assertThat(r.esPrueba()).isFalse();
        CatalogoModelosResponse.Modelo m = r.modelos().get(0);
        assertThat(m.accuracyTest()).isEqualTo(0.99911);
        assertThat(m.msCpu()).isEqualTo(120.5);
        assertThat(m.pesoEnsamble()).isEqualTo(0.33);
        assertThat(m.tipo()).isEqualTo("CNN");
    }

    @Test
    @DisplayName("CA-06.4 un catálogo vacío se trata como servicio no disponible")
    void catalogoVacio() {
        servidor.expect(requestTo("http://inferencia/modelos")).andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));
        assertThatThrownBy(() -> servicio.catalogo()).isInstanceOf(ServicioClasificacionException.class);
    }
}
