/*
 * Nombre: ClasificadorApplication.java
 * Descripción: Punto de entrada de la API REST del sistema clasificador de variedades de arroz.
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * Arranca la aplicación Spring Boot.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class ClasificadorApplication {

    /**
     * Método principal.
     *
     * @param args argumentos de línea de comandos
     */
    public static void main(String[] args) {
        SpringApplication.run(ClasificadorApplication.class, args);
    }
}
