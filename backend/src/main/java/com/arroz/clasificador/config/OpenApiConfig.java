/*
 * Nombre: OpenApiConfig.java
 * Descripción: Metadatos de la documentación OpenAPI 3 (Swagger UI en /swagger-ui.html) y
 *              esquema de seguridad Bearer JWT para probar los endpoints protegidos.
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.config;

import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;

/**
 * Configuración de springdoc-openapi.
 */
@Configuration
@OpenAPIDefinition(info = @Info(
        title = "API Clasificador de Arroz",
        version = "1.0.0",
        description = "CRUD de productos (lotes de arroz) y clasificación de la variedad a partir de "
                + "una foto con el modelo ResNet50V2. Los errores siguen el formato Problem Details "
                + "(RFC 9457) y se traducen según Accept-Language (es, en).",
        contact = @Contact(name = "Julian Delgado y Cesar Camilo Hoyos Diaz")))
@SecurityScheme(name = "bearerAuth", type = SecuritySchemeType.HTTP, scheme = "bearer", bearerFormat = "JWT")
public class OpenApiConfig {
}
