/*
 * Nombre: AppProperties.java
 * Descripción: Propiedades propias de la aplicación (JWT, CORS, servicio de inferencia y
 *              seguridad), leídas del prefijo "app" de application.yml.
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-21
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuración tipada del prefijo {@code app}.
 *
 * @param jwt         firma y vigencia de los tokens
 * @param cors        orígenes autorizados para el front-end
 * @param inferencia  ubicación del servicio de clasificación
 * @param seguridad   contraseñas de los usuarios que se crean al arrancar
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(Jwt jwt, Cors cors, Inferencia inferencia, Seguridad seguridad) {

    /**
     * @param secreto           clave HMAC de al menos 32 caracteres
     * @param expiracionMinutos vigencia del token
     */
    public record Jwt(String secreto, long expiracionMinutos) {
    }

    /**
     * @param origenes URLs del front-end autorizadas
     */
    public record Cors(List<String> origenes) {
    }

    /**
     * @param url              URL base del servicio de inferencia
     * @param timeoutSegundos  tiempo máximo de espera de la respuesta
     * @param apiKey           clave compartida que se envía en X-API-Key (vacía = sin clave)
     */
    public record Inferencia(String url, int timeoutSegundos, String apiKey) {
    }

    /**
     * @param adminPassword                  contraseña inicial del usuario "admin"
     * @param usuarioPassword                contraseña inicial del usuario "operario"
     * @param limiteClasificacionesPorMinuto clasificaciones permitidas por IP y minuto (0 = sin límite)
     */
    public record Seguridad(String adminPassword, String usuarioPassword, int limiteClasificacionesPorMinuto) {
    }
}
