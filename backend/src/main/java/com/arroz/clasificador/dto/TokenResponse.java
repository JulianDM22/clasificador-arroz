/*
 * Nombre: TokenResponse.java
 * Descripción: Respuesta del inicio de sesión con el token JWT.
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.dto;

import com.arroz.clasificador.model.Rol;

/**
 * Token emitido al iniciar sesión.
 *
 * @param token          JWT firmado
 * @param tipo           siempre "Bearer"
 * @param expiraEnSegundos vigencia restante
 * @param username       usuario autenticado
 * @param rol            rol del usuario
 */
public record TokenResponse(String token, String tipo, long expiraEnSegundos, String username, Rol rol) {
}
