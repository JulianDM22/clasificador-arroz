/*
 * Nombre: AuthController.java
 * Descripción: Endpoint de inicio de sesión que entrega el token JWT (HU-01).
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.arroz.clasificador.dto.LoginRequest;
import com.arroz.clasificador.dto.TokenResponse;
import com.arroz.clasificador.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * API de autenticación: {@code /api/v1/auth}.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación")
public class AuthController {

    private final AuthService servicio;

    /**
     * Inicia sesión.
     *
     * @param req usuario y contraseña
     * @return token JWT
     */
    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Devuelve un JWT válido por 60 minutos.")
    @ApiResponse(responseCode = "200", description = "Credenciales correctas")
    @ApiResponse(responseCode = "401", description = "Credenciales incorrectas")
    public TokenResponse login(@Valid @RequestBody LoginRequest req) {
        return servicio.login(req);
    }
}
