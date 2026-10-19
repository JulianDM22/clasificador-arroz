/*
 * Nombre: ProductoController.java
 * Descripción: Endpoints REST del CRUD de productos en JSON (HU-02 a HU-05).
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.arroz.clasificador.dto.PaginaResponse;
import com.arroz.clasificador.dto.ProductoRequest;
import com.arroz.clasificador.dto.ProductoResponse;
import com.arroz.clasificador.model.CategoriaArroz;
import com.arroz.clasificador.model.EstadoProducto;
import com.arroz.clasificador.service.ProductoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * API de productos: {@code /api/v1/productos}.
 */
@RestController
@RequestMapping("/api/v1/productos")
@RequiredArgsConstructor
@Tag(name = "Productos", description = "CRUD de lotes de arroz")
@SecurityRequirement(name = "bearerAuth")
public class ProductoController {

    private final ProductoService servicio;

    /**
     * Lista productos con filtros y paginación.
     *
     * @param categoria variedad (opcional)
     * @param estado    estado (opcional)
     * @param q         texto contenido en el nombre (opcional)
     * @param page      página desde 0
     * @param size      tamaño de página (máximo 100)
     * @return página de productos
     */
    @GetMapping
    @Operation(summary = "Listar productos", description = "Filtros opcionales por categoría, estado y texto del nombre.")
    @ApiResponse(responseCode = "200", description = "Página de productos")
    public PaginaResponse<ProductoResponse> listar(
            @RequestParam(required = false) CategoriaArroz categoria,
            @RequestParam(required = false) EstadoProducto estado,
            @Parameter(description = "Texto contenido en el nombre") @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return servicio.listar(categoria, estado, q, page, size);
    }

    /**
     * Obtiene un producto.
     *
     * @param id identificador
     * @return producto
     */
    @GetMapping("/{id}")
    @Operation(summary = "Consultar un producto")
    @ApiResponse(responseCode = "200", description = "Producto encontrado")
    @ApiResponse(responseCode = "404", description = "No existe")
    public ProductoResponse obtener(@PathVariable Long id) {
        return servicio.obtener(id);
    }

    /**
     * Registra un producto.
     *
     * @param req datos del producto
     * @return 201 con el producto y la cabecera Location
     */
    @PostMapping
    @Operation(summary = "Registrar un producto")
    @ApiResponse(responseCode = "201", description = "Creado")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @ApiResponse(responseCode = "409", description = "Nombre duplicado")
    public ResponseEntity<ProductoResponse> crear(@Valid @RequestBody ProductoRequest req) {
        ProductoResponse creado = servicio.crear(req);
        URI ubicacion = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(creado.id()).toUri();
        return ResponseEntity.created(ubicacion).body(creado);
    }

    /**
     * Actualiza un producto.
     *
     * @param id  identificador
     * @param req datos nuevos
     * @return producto actualizado
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un producto")
    @ApiResponse(responseCode = "200", description = "Actualizado")
    @ApiResponse(responseCode = "404", description = "No existe")
    @ApiResponse(responseCode = "409", description = "Nombre duplicado")
    public ProductoResponse actualizar(@PathVariable Long id, @Valid @RequestBody ProductoRequest req) {
        return servicio.actualizar(id, req);
    }

    /**
     * Elimina un producto (solo ADMIN).
     *
     * @param id identificador
     * @return 204 sin cuerpo
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un producto", description = "Requiere rol ADMIN.")
    @ApiResponse(responseCode = "204", description = "Eliminado")
    @ApiResponse(responseCode = "403", description = "El usuario no es ADMIN")
    @ApiResponse(responseCode = "404", description = "No existe")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
