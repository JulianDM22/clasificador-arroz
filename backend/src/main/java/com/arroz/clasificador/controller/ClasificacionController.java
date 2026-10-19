/*
 * Nombre: ClasificacionController.java
 * Descripción: Endpoints de clasificación: con el modelo elegido o el ensamble, comparación de los
 *              5 modelos y catálogo de modelos con sus métricas (HU-06).
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-18
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.1.0
 */
package com.arroz.clasificador.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.arroz.clasificador.dto.CatalogoModelosResponse;
import com.arroz.clasificador.dto.ClasificacionResponse;
import com.arroz.clasificador.dto.ComparacionResponse;
import com.arroz.clasificador.service.ClasificacionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * API de clasificación: {@code /api/v1/clasificaciones} y {@code /api/v1/modelos}.
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Clasificación", description = "Variedad de arroz a partir de una foto con 5 modelos")
@SecurityRequirement(name = "bearerAuth")
public class ClasificacionController {

    private final ClasificacionService servicio;

    /**
     * Clasifica la foto de un grano.
     *
     * @param archivo imagen JPEG o PNG de hasta 5 MB (parte "archivo")
     * @param modelo  id del modelo, "ensamble" u omitido para el modelo por defecto
     * @return variedad sugerida y probabilidades
     */
    @PostMapping(path = "/clasificaciones", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Clasificar una foto con un modelo",
            description = "Imagen JPEG o PNG de hasta 5 MB en la parte 'archivo'. Parámetro opcional 'modelo': "
                    + "cnn_propia, efficientnetb0, resnet50v2, vit_b16, deit_s o ensamble.")
    @ApiResponse(responseCode = "200", description = "Variedad sugerida")
    @ApiResponse(responseCode = "400", description = "Archivo inválido o modelo inexistente")
    @ApiResponse(responseCode = "413", description = "Archivo mayor a 5 MB")
    @ApiResponse(responseCode = "503", description = "Servicio de inferencia no disponible")
    public ClasificacionResponse clasificar(
            @RequestPart("archivo") MultipartFile archivo,
            @Parameter(description = "Modelo a usar") @RequestParam(required = false) String modelo) {
        return servicio.clasificar(archivo, modelo);
    }

    /**
     * Compara los 5 modelos y el ensamble sobre la misma foto.
     *
     * @param archivo imagen JPEG o PNG de hasta 5 MB
     * @return predicción de cada modelo y del ensamble
     */
    @PostMapping(path = "/clasificaciones/comparacion", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Comparar los 5 modelos", description = "Clasifica la misma foto con todos los modelos y con el ensamble.")
    @ApiResponse(responseCode = "200", description = "Predicción de cada modelo")
    public ComparacionResponse comparar(@RequestPart("archivo") MultipartFile archivo) {
        return servicio.comparar(archivo);
    }

    /**
     * Catálogo de modelos con sus métricas de test.
     *
     * @return modelos disponibles
     */
    @GetMapping("/modelos")
    @Operation(summary = "Modelos disponibles y sus métricas")
    @ApiResponse(responseCode = "200", description = "Catálogo")
    public CatalogoModelosResponse modelos() {
        return servicio.catalogo();
    }
}
