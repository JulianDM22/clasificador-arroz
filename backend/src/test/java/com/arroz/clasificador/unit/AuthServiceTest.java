/*
 * Nombre: AuthServiceTest.java
 * Descripción: Pruebas unitarias de la emisión de tokens JWT (el gestor de autenticación se
 *              simula con Mockito y el token se verifica con el decodificador real).
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.unit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;

import javax.crypto.spec.SecretKeySpec;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import com.arroz.clasificador.config.AppProperties;
import com.arroz.clasificador.dto.LoginRequest;
import com.arroz.clasificador.dto.TokenResponse;
import com.arroz.clasificador.model.Rol;
import com.arroz.clasificador.service.AuthService;
import com.nimbusds.jose.jwk.source.ImmutableSecret;

@DisplayName("AuthService (unitarias)")
class AuthServiceTest {

    static final String SECRETO = "clave-de-pruebas-unitarias-de-32-caracteres-o-mas";

    private AuthenticationManager gestor;
    private AuthService servicio;
    private JwtDecoder decoder;

    @BeforeEach
    void preparar() {
        SecretKeySpec clave = new SecretKeySpec(SECRETO.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        gestor = mock(AuthenticationManager.class);
        AppProperties props = new AppProperties(new AppProperties.Jwt(SECRETO, 60), null, null, null);
        servicio = new AuthService(gestor, new NimbusJwtEncoder(new ImmutableSecret<>(clave)), props);
        decoder = NimbusJwtDecoder.withSecretKey(clave).macAlgorithm(MacAlgorithm.HS256).build();
    }

    @Test
    @DisplayName("CA-01.1 emite un JWT con el usuario, el rol y vigencia de 60 minutos")
    void emiteToken() {
        when(gestor.authenticate(any())).thenReturn(new UsernamePasswordAuthenticationToken(
                "admin", null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));

        TokenResponse r = servicio.login(new LoginRequest("admin", "x"));
        Jwt jwt = decoder.decode(r.token());

        assertThat(r.tipo()).isEqualTo("Bearer");
        assertThat(r.rol()).isEqualTo(Rol.ADMIN);
        assertThat(r.username()).isEqualTo("admin");
        assertThat(r.expiraEnSegundos()).isEqualTo(3600);
        assertThat(jwt.getSubject()).isEqualTo("admin");
        assertThat(jwt.getClaimAsStringList("roles")).containsExactly("ADMIN");
        assertThat(Duration.between(jwt.getIssuedAt(), jwt.getExpiresAt())).isEqualTo(Duration.ofMinutes(60));
    }

    @Test
    @DisplayName("CA-01.1 el rol USUARIO queda en el token")
    void rolUsuario() {
        when(gestor.authenticate(any())).thenReturn(new UsernamePasswordAuthenticationToken(
                "operario", null, List.of(new SimpleGrantedAuthority("ROLE_USUARIO"))));
        TokenResponse r = servicio.login(new LoginRequest("operario", "x"));
        assertThat(r.rol()).isEqualTo(Rol.USUARIO);
        assertThat(decoder.decode(r.token()).getClaimAsStringList("roles")).containsExactly("USUARIO");
    }

    @Test
    @DisplayName("CA-01.2 propaga el error de credenciales sin emitir token")
    void credencialesIncorrectas() {
        when(gestor.authenticate(any())).thenThrow(new BadCredentialsException("x"));
        assertThatThrownBy(() -> servicio.login(new LoginRequest("admin", "mala")))
                .isInstanceOf(BadCredentialsException.class);
    }
}
