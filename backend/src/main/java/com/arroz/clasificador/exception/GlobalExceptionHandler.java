/*
 * Nombre: GlobalExceptionHandler.java
 * Descripción: Traduce las excepciones a respuestas JSON con formato Problem Details (RFC 9457)
 *              y mensajes en el idioma de la cabecera Accept-Language (criterio CA-07.1).
 *              Nunca expone detalles internos en errores 500.
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.exception;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Manejador central de errores de la API.
 */
@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final MessageSource mensajes;

    /**
     * Errores de validación de campos (400).
     *
     * @param ex excepción de Bean Validation
     * @return problema con el mapa campo → mensaje
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail validacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> errores.putIfAbsent(e.getField(), e.getDefaultMessage()));
        ProblemDetail p = problema(HttpStatus.BAD_REQUEST, "error.validacion");
        p.setProperty("errores", errores);
        return p;
    }

    /**
     * JSON mal formado o valores de enumeración no permitidos (400).
     *
     * @param ex excepción de lectura del cuerpo
     * @return problema
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ProblemDetail cuerpoInvalido(HttpMessageNotReadableException ex) {
        return problema(HttpStatus.BAD_REQUEST, "error.cuerpo.invalido");
    }

    /**
     * Parámetro de URL con tipo incorrecto, por ejemplo un id no numérico (400).
     *
     * @param ex excepción de conversión
     * @return problema
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ProblemDetail parametroInvalido(MethodArgumentTypeMismatchException ex) {
        return problema(HttpStatus.BAD_REQUEST, "error.parametro.invalido", ex.getName());
    }

    /**
     * Producto inexistente (404).
     *
     * @param ex excepción
     * @return problema
     */
    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ProblemDetail noEncontrado(RecursoNoEncontradoException ex) {
        return problema(HttpStatus.NOT_FOUND, "error.producto.no.encontrado", ex.getId());
    }

    /**
     * Nombre repetido (409).
     *
     * @param ex excepción
     * @return problema
     */
    @ExceptionHandler(NombreDuplicadoException.class)
    public ProblemDetail duplicado(NombreDuplicadoException ex) {
        return problema(HttpStatus.CONFLICT, "error.producto.duplicado", ex.getNombre());
    }

    /**
     * Archivo de imagen inválido (400).
     *
     * @param ex excepción
     * @return problema
     */
    @ExceptionHandler(ArchivoInvalidoException.class)
    public ProblemDetail archivoInvalido(ArchivoInvalidoException ex) {
        return problema(HttpStatus.BAD_REQUEST, ex.getClaveMensaje());
    }

    /**
     * Modelo de clasificación inexistente (400, CA-06.6).
     *
     * @param ex excepción
     * @return problema
     */
    @ExceptionHandler(ModeloDesconocidoException.class)
    public ProblemDetail modeloDesconocido(ModeloDesconocidoException ex) {
        return problema(HttpStatus.BAD_REQUEST, "error.modelo.desconocido", ex.getModelo());
    }

    /**
     * Falta la parte "archivo" en la petición multipart (400).
     *
     * @param ex excepción
     * @return problema
     */
    @ExceptionHandler(MissingServletRequestPartException.class)
    public ProblemDetail sinArchivo(MissingServletRequestPartException ex) {
        return problema(HttpStatus.BAD_REQUEST, "error.archivo.vacio");
    }

    /**
     * Archivo mayor al límite configurado (413, criterio CA-06.3).
     *
     * @param ex excepción
     * @return problema
     */
    @ExceptionHandler({MaxUploadSizeExceededException.class, ArchivoGrandeException.class})
    public ProblemDetail archivoGrande(RuntimeException ex) {
        return problema(HttpStatus.PAYLOAD_TOO_LARGE, "error.archivo.grande");
    }

    /**
     * Servicio de inferencia caído (503).
     *
     * @param ex excepción
     * @return problema
     */
    @ExceptionHandler(ServicioClasificacionException.class)
    public ProblemDetail inferenciaCaida(ServicioClasificacionException ex) {
        log.warn("Servicio de inferencia no disponible: {}", ex.getCause() == null ? "" : ex.getCause().getMessage());
        return problema(HttpStatus.SERVICE_UNAVAILABLE, "error.inferencia.no.disponible");
    }

    /**
     * Credenciales incorrectas o usuario desactivado (401). El mensaje es el mismo en ambos
     * casos para no revelar qué dato falló (criterio CA-01.2).
     *
     * @param ex excepción de autenticación
     * @return problema
     */
    @ExceptionHandler({BadCredentialsException.class, DisabledException.class})
    public ProblemDetail credenciales(RuntimeException ex) {
        return problema(HttpStatus.UNAUTHORIZED, "error.credenciales");
    }

    /**
     * Cualquier otro error (500), sin detalles internos.
     *
     * @param ex excepción
     * @return problema genérico
     */
    @ExceptionHandler(Exception.class)
    public ProblemDetail inesperado(Exception ex) {
        // Errores HTTP propios de Spring (ruta inexistente, método no permitido...) conservan su estado.
        if (ex instanceof ErrorResponse respuesta) {
            HttpStatus estado = HttpStatus.valueOf(respuesta.getStatusCode().value());
            return problema(estado, "error.http", estado.value());
        }
        log.error("Error no controlado", ex);
        return problema(HttpStatus.INTERNAL_SERVER_ERROR, "error.interno");
    }

    private ProblemDetail problema(HttpStatus estado, String clave, Object... args) {
        Locale locale = LocaleContextHolder.getLocale();
        ProblemDetail p = ProblemDetail.forStatusAndDetail(estado, mensajes.getMessage(clave, args, locale));
        p.setTitle(mensajes.getMessage("titulo." + estado.value(), null, estado.getReasonPhrase(), locale));
        return p;
    }
}
