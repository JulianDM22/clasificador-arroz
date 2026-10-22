/*
 * Nombre: ClasificacionService.java
 * Descripción: Valida la imagen recibida (tamaño y contenido real JPEG o PNG) y consulta al
 *              servicio de inferencia: clasificar con el modelo elegido o con el ensamble,
 *              comparar los 5 modelos y obtener el catálogo de modelos con sus métricas (HU-06).
 *              Registra cada clasificación (sin la foto) para el panel del administrador (HU-10).
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-21
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.2.0
 */
package com.arroz.clasificador.service;

import java.io.IOException;
import java.util.regex.Pattern;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.dao.DataAccessException;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.multipart.MultipartFile;

import com.arroz.clasificador.dto.CatalogoModelosResponse;
import com.arroz.clasificador.dto.ClasificacionResponse;
import com.arroz.clasificador.dto.ComparacionResponse;
import com.arroz.clasificador.exception.ArchivoGrandeException;
import com.arroz.clasificador.exception.ArchivoInvalidoException;
import com.arroz.clasificador.exception.ModeloDesconocidoException;
import com.arroz.clasificador.exception.ServicioClasificacionException;
import com.arroz.clasificador.model.Clasificacion;
import com.arroz.clasificador.model.TipoClasificacion;
import com.arroz.clasificador.repository.ClasificacionRepository;

import lombok.extern.slf4j.Slf4j;

/**
 * Cliente del servicio de inferencia.
 */
@Slf4j
@Service
public class ClasificacionService {

    /** Tamaño máximo de la imagen: 5 MB (CA-06.3). */
    public static final long TAMANO_MAXIMO = 5L * 1024 * 1024;

    /** Ids de modelo válidos: minúsculas, dígitos y guion bajo (evita inyectar rutas o parámetros). */
    private static final Pattern ID_MODELO = Pattern.compile("^[a-z0-9_]{1,40}$");
    private static final byte[] FIRMA_JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] FIRMA_PNG = {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};

    private final RestClient cliente;
    private final ClasificacionRepository registro;

    /**
     * @param inferenciaRestClient cliente HTTP configurado con la URL del servicio de inferencia
     * @param registro             registro de clasificaciones para las estadísticas
     */
    public ClasificacionService(RestClient inferenciaRestClient, ClasificacionRepository registro) {
        this.cliente = inferenciaRestClient;
        this.registro = registro;
    }

    /**
     * Clasifica la imagen con el modelo por defecto.
     *
     * @param archivo imagen JPEG o PNG
     * @return variedad sugerida y probabilidades
     */
    public ClasificacionResponse clasificar(MultipartFile archivo) {
        return clasificar(archivo, null);
    }

    /**
     * Clasifica la imagen de un grano con un modelo concreto (CA-06.6).
     *
     * @param archivo imagen JPEG o PNG
     * @param modelo  id del modelo, "ensamble", o {@code null} para el modelo por defecto
     * @return variedad sugerida y probabilidades
     * @throws ArchivoInvalidoException       si el archivo está vacío, no es JPEG/PNG o es ilegible
     * @throws ArchivoGrandeException         si supera 5 MB
     * @throws ModeloDesconocidoException     si el modelo no existe
     * @throws ServicioClasificacionException si el servicio de inferencia falla
     */
    public ClasificacionResponse clasificar(MultipartFile archivo, String modelo) {
        if (modelo != null && !ID_MODELO.matcher(modelo).matches()) {
            throw new ModeloDesconocidoException(modelo);
        }
        MultiValueMap<String, Object> cuerpo = cuerpoMultipart(archivo);
        ClasificacionResponse r = llamar(modelo, () -> cliente.post()
                .uri(u -> {
                    u.path("/predecir");
                    if (modelo != null) {
                        u.queryParam("modelo", modelo);
                    }
                    return u.build();
                })
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(cuerpo)
                .retrieve()
                .body(ClasificacionResponse.class));
        if (r == null || r.categoria() == null) {
            throw new ServicioClasificacionException(new IllegalStateException("Respuesta vacía"));
        }
        log.info("Clasificación con {}: {} ({})", r.modelo(), r.categoria(), r.confianza());
        registrar(TipoClasificacion.UN_MODELO, r);
        return r;
    }

    /**
     * Clasifica la imagen con todos los modelos y con el ensamble (CA-06.7).
     *
     * @param archivo imagen JPEG o PNG
     * @return predicción de cada modelo, del ensamble y si hay consenso
     */
    public ComparacionResponse comparar(MultipartFile archivo) {
        MultiValueMap<String, Object> cuerpo = cuerpoMultipart(archivo);
        ComparacionResponse r = llamar(null, () -> cliente.post()
                .uri("/comparar")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(cuerpo)
                .retrieve()
                .body(ComparacionResponse.class));
        if (r == null || r.modelos() == null || r.modelos().isEmpty() || r.ensamble() == null) {
            throw new ServicioClasificacionException(new IllegalStateException("Respuesta vacía"));
        }
        registrar(TipoClasificacion.COMPARACION, r.ensamble());
        return r;
    }

    /**
     * Guarda la clasificación para las estadísticas. Si la base de datos falla, la clasificación
     * igual se entrega al usuario: las estadísticas no deben impedir clasificar.
     */
    private void registrar(TipoClasificacion tipo, ClasificacionResponse r) {
        try {
            registro.save(Clasificacion.builder().tipo(tipo).modelo(r.modelo())
                    .categoria(r.categoria()).confianza(r.confianza()).build());
        } catch (DataAccessException e) {
            log.warn("No se pudo registrar la clasificación: {}", e.getMessage());
        }
    }

    /**
     * Catálogo de modelos con sus métricas.
     *
     * @return modelos disponibles
     */
    public CatalogoModelosResponse catalogo() {
        CatalogoModelosResponse r = llamar(null, () -> cliente.get().uri("/modelos").retrieve()
                .body(CatalogoModelosResponse.class));
        if (r == null || r.modelos() == null) {
            throw new ServicioClasificacionException(new IllegalStateException("Respuesta vacía"));
        }
        return r;
    }

    /**
     * Traduce los errores del servicio de inferencia: 404 = modelo inexistente, 400 = imagen que
     * pasó la firma pero no se puede leer, y cualquier otro fallo = servicio no disponible.
     */
    private <T> T llamar(String modelo, java.util.function.Supplier<T> llamada) {
        try {
            return llamada.get();
        } catch (HttpClientErrorException.NotFound e) {
            throw new ModeloDesconocidoException(modelo);
        } catch (HttpClientErrorException.BadRequest e) {
            throw new ArchivoInvalidoException("error.archivo.ilegible");
        } catch (RestClientException e) {
            throw new ServicioClasificacionException(e);
        }
    }

    private MultiValueMap<String, Object> cuerpoMultipart(MultipartFile archivo) {
        byte[] bytes = leer(archivo);
        if (!esImagenPermitida(bytes)) {
            throw new ArchivoInvalidoException("error.archivo.tipo");
        }
        MultiValueMap<String, Object> cuerpo = new LinkedMultiValueMap<>();
        cuerpo.add("archivo", new ByteArrayResource(bytes) {
            @Override
            public String getFilename() {
                // Sin nombre, el servicio de inferencia no reconocería la parte como archivo.
                String nombre = archivo.getOriginalFilename();
                return (nombre == null || nombre.isBlank()) ? "imagen" : nombre;
            }
        });
        return cuerpo;
    }

    /**
     * Verifica la firma binaria del archivo, sin confiar en la extensión ni en el Content-Type
     * declarado por el cliente (criterio CA-06.2).
     *
     * @param bytes contenido del archivo
     * @return {@code true} si empieza como JPEG o PNG
     */
    static boolean esImagenPermitida(byte[] bytes) {
        return empiezaCon(bytes, FIRMA_JPEG) || empiezaCon(bytes, FIRMA_PNG);
    }

    private static boolean empiezaCon(byte[] bytes, byte[] firma) {
        if (bytes.length < firma.length) {
            return false;
        }
        for (int i = 0; i < firma.length; i++) {
            if (bytes[i] != firma[i]) {
                return false;
            }
        }
        return true;
    }

    private static byte[] leer(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new ArchivoInvalidoException("error.archivo.vacio");
        }
        // Se verifica aquí también, sin depender solo del límite configurado en el servidor web.
        if (archivo.getSize() > TAMANO_MAXIMO) {
            throw new ArchivoGrandeException(archivo.getSize());
        }
        try {
            return archivo.getBytes();
        } catch (IOException e) {
            throw new ArchivoInvalidoException("error.archivo.vacio");
        }
    }
}
