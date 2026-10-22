/*
 * Nombre: EstadisticasController.java
 * Descripción: Endpoint del panel del administrador (HU-10): GET /api/v1/estadisticas.
 * Fecha de creación: 2026-10-21
 * Última actualización: 2026-10-21
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.arroz.clasificador.dto.EstadisticasResponse;
import com.arroz.clasificador.service.EstadisticasService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * API de estadísticas: {@code /api/v1/estadisticas}.
 */
@RestController
@RequestMapping("/api/v1/estadisticas")
@RequiredArgsConstructor
@Tag(name = "Estadísticas", description = "Panel del administrador")
@SecurityRequirement(name = "bearerAuth")
public class EstadisticasController {

    private final EstadisticasService servicio;

    /**
     * @return lotes por estado y variedad, y uso del clasificador
     */
    @GetMapping
    @Operation(summary = "Estadísticas del panel", description = "Requiere rol ADMIN.")
    @ApiResponse(responseCode = "200", description = "Estadísticas")
    @ApiResponse(responseCode = "403", description = "El usuario no es ADMIN")
    public EstadisticasResponse obtener() {
        return servicio.calcular();
    }
}
