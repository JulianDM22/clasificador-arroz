/*
 * Nombre: AuthService.java
 * Descripción: Autentica credenciales y emite tokens JWT firmados con HMAC-SHA256 que incluyen
 *              el rol del usuario (HU-01).
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.arroz.clasificador.config.AppProperties;
import com.arroz.clasificador.dto.LoginRequest;
import com.arroz.clasificador.dto.TokenResponse;
import com.arroz.clasificador.model.Rol;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Servicio de inicio de sesión.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtEncoder jwtEncoder;
    private final AppProperties propiedades;

    /**
     * Valida las credenciales y emite un token.
     *
     * @param req usuario y contraseña
     * @return token JWT con el rol
     * @throws org.springframework.security.core.AuthenticationException si las credenciales fallan
     */
    public TokenResponse login(LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.username(), req.password()));
        Rol rol = auth.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .map(Rol::valueOf)
                .findFirst()
                .orElse(Rol.USUARIO);
        Duration vigencia = Duration.ofMinutes(propiedades.jwt().expiracionMinutos());
        Instant ahora = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("clasificador-arroz")
                .subject(auth.getName())
                .issuedAt(ahora)
                .expiresAt(ahora.plus(vigencia))
                .claim("roles", List.of(rol.name()))
                .build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        log.info("Inicio de sesión de {}", auth.getName());
        return new TokenResponse(token, "Bearer", vigencia.toSeconds(), auth.getName(), rol);
    }
}
