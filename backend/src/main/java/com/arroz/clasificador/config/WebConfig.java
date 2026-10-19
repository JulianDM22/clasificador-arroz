/*
 * Nombre: WebConfig.java
 * Descripción: Internacionalización (español por defecto, inglés según Accept-Language) para
 *              mensajes de error y de validación (HU-07), y cliente HTTP hacia el servicio de
 *              inferencia con tiempos de espera.
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.config;

import java.time.Duration;
import java.util.List;
import java.util.Locale;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.web.client.RestClient;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

/**
 * Beans de la capa web.
 */
@Configuration
public class WebConfig {

    /** Idioma por defecto de la API. */
    public static final Locale ESPANOL = Locale.forLanguageTag("es");

    /**
     * @return resolvedor que lee Accept-Language y solo admite español e inglés
     */
    @Bean
    public LocaleResolver localeResolver() {
        AcceptHeaderLocaleResolver resolvedor = new AcceptHeaderLocaleResolver();
        resolvedor.setSupportedLocales(List.of(ESPANOL, Locale.ENGLISH));
        resolvedor.setDefaultLocale(ESPANOL);
        return resolvedor;
    }

    /**
     * Hace que las anotaciones de validación busquen sus mensajes ({@code {clave}}) en
     * messages*.properties, en el idioma de la petición.
     *
     * @param mensajes fuente de mensajes de la aplicación
     * @return validador
     */
    @Bean
    public LocalValidatorFactoryBean validator(MessageSource mensajes) {
        LocalValidatorFactoryBean validador = new LocalValidatorFactoryBean();
        validador.setValidationMessageSource(mensajes);
        return validador;
    }

    /**
     * @param propiedades configuración de la aplicación
     * @return cliente HTTP del servicio de inferencia
     */
    @Bean
    public RestClient inferenciaRestClient(AppProperties propiedades) {
        SimpleClientHttpRequestFactory fabrica = new SimpleClientHttpRequestFactory();
        Duration espera = Duration.ofSeconds(propiedades.inferencia().timeoutSegundos());
        fabrica.setConnectTimeout(espera);
        fabrica.setReadTimeout(espera);
        RestClient.Builder builder = RestClient.builder()
                .baseUrl(propiedades.inferencia().url())
                .requestFactory(fabrica);
        String clave = propiedades.inferencia().apiKey();
        if (clave != null && !clave.isBlank()) {
            // Solo el back-end conoce la clave: el servicio de inferencia rechaza llamadas directas.
            builder.defaultHeader("X-API-Key", clave);
        }
        return builder.build();
    }
}
