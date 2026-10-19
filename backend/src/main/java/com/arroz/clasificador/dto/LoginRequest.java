/*
 * Nombre: LoginRequest.java
 * Descripción: Credenciales para iniciar sesión (criterio CA-01.1).
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Cuerpo de {@code POST /api/v1/auth/login}.
 *
 * @param username nombre de usuario
 * @param password contraseña en texto plano (viaja cifrada por HTTPS)
 */
public record LoginRequest(
        @NotBlank(message = "{login.username.obligatorio}") @Size(max = 50) String username,
        @NotBlank(message = "{login.password.obligatorio}") @Size(max = 100) String password) {
}
