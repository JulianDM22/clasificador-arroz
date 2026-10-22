/*
 * Nombre: LimiteClasificacionesFilter.java
 * Descripción: Limita cuántas clasificaciones puede pedir cada dirección IP por minuto. La
 *              clasificación es pública (HU-06), así que sin este límite cualquiera podría saturar
 *              el servicio de inferencia (CA-06.9). Al superarlo responde 429 con Retry-After.
 * Fecha de creación: 2026-10-21
 * Última actualización: 2026-10-21
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.LocaleResolver;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Ventana fija de 1 minuto por dirección IP para {@code POST /api/v1/clasificaciones/**}.
 */
@Component
public class LimiteClasificacionesFilter extends OncePerRequestFilter {

    private static final long VENTANA_MS = 60_000;
    /** A partir de este tamaño se descartan las ventanas vencidas, para que la memoria no crezca sin fin. */
    private static final int LIMPIAR_DESDE = 10_000;

    private final int limite;
    private final Clock reloj;
    private final MessageSource mensajes;
    private final LocaleResolver localeResolver;
    private final ObjectMapper objectMapper;
    private final Map<String, Ventana> ventanas = new ConcurrentHashMap<>();

    /**
     * @param propiedades    configuración ({@code app.seguridad.limite-clasificaciones-por-minuto})
     * @param reloj          reloj del sistema (se reemplaza en las pruebas)
     * @param mensajes       textos traducidos
     * @param localeResolver idioma de la petición
     * @param objectMapper   serializador JSON
     */
    public LimiteClasificacionesFilter(AppProperties propiedades, Clock reloj, MessageSource mensajes,
                                       LocaleResolver localeResolver, ObjectMapper objectMapper) {
        this.limite = propiedades.seguridad().limiteClasificacionesPorMinuto();
        this.reloj = reloj;
        this.mensajes = mensajes;
        this.localeResolver = localeResolver;
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest req) {
        return limite <= 0 || !"POST".equals(req.getMethod())
                || !req.getRequestURI().startsWith("/api/v1/clasificaciones");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain cadena)
            throws ServletException, IOException {
        long ahora = reloj.millis();
        if (ventanas.size() > LIMPIAR_DESDE) {
            ventanas.values().removeIf(v -> ahora - v.inicio >= VENTANA_MS);
        }
        // getRemoteAddr ya es la IP del visitante: Tomcat la toma de X-Forwarded-For solo cuando
        // la petición viene del proxy de Render (server.forward-headers-strategy: native).
        Ventana v = ventanas.compute(req.getRemoteAddr(),
                (ip, actual) -> actual == null || ahora - actual.inicio >= VENTANA_MS
                        ? new Ventana(ahora, 1) : new Ventana(actual.inicio, actual.usadas + 1));
        if (v.usadas > limite) {
            long segundos = Math.max(1, (v.inicio + VENTANA_MS - ahora + 999) / 1000);
            rechazar(req, res, segundos);
            return;
        }
        cadena.doFilter(req, res);
    }

    private void rechazar(HttpServletRequest req, HttpServletResponse res, long segundos) throws IOException {
        Locale locale = localeResolver.resolveLocale(req);
        ProblemDetail p = ProblemDetail.forStatusAndDetail(HttpStatus.TOO_MANY_REQUESTS,
                mensajes.getMessage("error.limite.clasificaciones", new Object[] {limite, segundos}, locale));
        p.setTitle(mensajes.getMessage("titulo.429", null, locale));
        res.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        res.setHeader("Retry-After", String.valueOf(segundos));
        res.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        res.setCharacterEncoding(StandardCharsets.UTF_8.name());
        objectMapper.writeValue(res.getOutputStream(), p);
    }

    /** Inicio de la ventana actual y peticiones hechas en ella. */
    private record Ventana(long inicio, int usadas) {
    }
}
