/*
 * Nombre: SecurityConfig.java
 * Descripción: Seguridad de la API: autenticación sin estado con JWT (HMAC-SHA256), permisos por
 *              rol, CORS restringido al front-end, contraseñas con BCrypt y respuestas 401/403 en
 *              JSON (HU-01). La clasificación es pública (HU-06); el inventario es del equipo y
 *              solo ADMIN cambia el estado, elimina y ve las estadísticas (HU-10).
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-21
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.config;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.LocaleResolver;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jose.jwk.source.ImmutableSecret;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * Configuración de Spring Security.
 */
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final AppProperties propiedades;
    private final MessageSource mensajes;
    private final ObjectMapper objectMapper;
    private final LocaleResolver localeResolver;

    /**
     * Reglas de acceso.
     *
     * <ul>
     *   <li>Públicos: login, clasificar fotos y ver los modelos (con límite por IP), documentación
     *       OpenAPI y salud/métricas.</li>
     *   <li>USUARIO y ADMIN: consultar, crear y actualizar lotes.</li>
     *   <li>Solo ADMIN: activar o desactivar y eliminar lotes (CA-01.4, CA-10.2) y ver las
     *       estadísticas (CA-10.1).</li>
     * </ul>
     *
     * @param http configurador
     * @return cadena de filtros
     * @throws Exception si la configuración falla
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Sin cookies de sesión: el token viaja en la cabecera Authorization, así que CSRF no aplica.
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(a -> a
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/actuator/health/**", "/actuator/info", "/actuator/prometheus").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/clasificaciones", "/api/v1/clasificaciones/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/modelos").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/productos/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/productos/*/estado").hasRole("ADMIN")
                        .requestMatchers("/api/v1/estadisticas/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/productos/**").hasAnyRole("USUARIO", "ADMIN")
                        .anyRequest().authenticated())
                .oauth2ResourceServer(o -> o
                        .jwt(j -> j.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                        .authenticationEntryPoint(entradaNoAutenticada()))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(entradaNoAutenticada())
                        .accessDeniedHandler(accesoDenegado()));
        return http.build();
    }

    /**
     * @return codificador BCrypt para las contraseñas
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * @param configuracion configuración de autenticación de Spring
     * @return gestor que valida usuario y contraseña contra la base de datos
     * @throws Exception si no se puede construir
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuracion) throws Exception {
        return configuracion.getAuthenticationManager();
    }

    /**
     * @return firmador de tokens
     */
    @Bean
    public JwtEncoder jwtEncoder() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(claveJwt()));
    }

    /**
     * @return verificador de tokens (firma, emisión y vencimiento)
     */
    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withSecretKey(claveJwt()).macAlgorithm(MacAlgorithm.HS256).build();
    }

    /**
     * @return orígenes, métodos y cabeceras permitidos para el front-end
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(propiedades.cors().origenes());
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept-Language"));
        cors.setExposedHeaders(List.of("Location", "Retry-After"));
        cors.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource fuente = new UrlBasedCorsConfigurationSource();
        fuente.registerCorsConfiguration("/**", cors);
        return fuente;
    }

    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter roles = new JwtGrantedAuthoritiesConverter();
        roles.setAuthoritiesClaimName("roles");
        roles.setAuthorityPrefix("ROLE_");
        JwtAuthenticationConverter conversor = new JwtAuthenticationConverter();
        conversor.setJwtGrantedAuthoritiesConverter(roles);
        return conversor;
    }

    private SecretKey claveJwt() {
        byte[] secreto = propiedades.jwt().secreto().getBytes(StandardCharsets.UTF_8);
        if (secreto.length < 32) {
            throw new IllegalStateException("app.jwt.secreto debe tener al menos 32 caracteres");
        }
        return new SecretKeySpec(secreto, "HmacSHA256");
    }

    private AuthenticationEntryPoint entradaNoAutenticada() {
        return (req, res, ex) -> escribir(req, res, HttpStatus.UNAUTHORIZED, "error.no.autenticado");
    }

    private AccessDeniedHandler accesoDenegado() {
        return (req, res, ex) -> escribir(req, res, HttpStatus.FORBIDDEN, "error.acceso.denegado");
    }

    /**
     * Escribe un Problem Details en JSON. Estos errores ocurren en los filtros, antes del
     * controlador, así que el idioma se resuelve aquí con el mismo resolvedor de la API (sin
     * cabecera Accept-Language → español).
     */
    private void escribir(HttpServletRequest req, HttpServletResponse res, HttpStatus estado, String clave)
            throws java.io.IOException {
        Locale locale = localeResolver.resolveLocale(req);
        ProblemDetail p = ProblemDetail.forStatusAndDetail(estado, mensajes.getMessage(clave, null, locale));
        p.setTitle(mensajes.getMessage("titulo." + estado.value(), null, estado.getReasonPhrase(), locale));
        res.setStatus(estado.value());
        res.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        res.setCharacterEncoding(StandardCharsets.UTF_8.name());
        if (estado == HttpStatus.UNAUTHORIZED) {
            res.setHeader("WWW-Authenticate", "Bearer");
        }
        objectMapper.writeValue(res.getOutputStream(), p);
    }
}
