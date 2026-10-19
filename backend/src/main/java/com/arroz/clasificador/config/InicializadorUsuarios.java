/*
 * Nombre: InicializadorUsuarios.java
 * Descripción: Crea al arrancar los usuarios "admin" (ADMIN) y "operario" (USUARIO) si no
 *              existen. Las contraseñas vienen de variables de entorno, así ningún hash queda
 *              escrito en el repositorio.
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.arroz.clasificador.model.Rol;
import com.arroz.clasificador.model.Usuario;
import com.arroz.clasificador.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Siembra de usuarios iniciales.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InicializadorUsuarios implements ApplicationRunner {

    private final UsuarioRepository repositorio;
    private final PasswordEncoder encoder;
    private final AppProperties propiedades;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        crearSiNoExiste("admin", propiedades.seguridad().adminPassword(), Rol.ADMIN);
        crearSiNoExiste("operario", propiedades.seguridad().usuarioPassword(), Rol.USUARIO);
    }

    private void crearSiNoExiste(String username, String password, Rol rol) {
        if (repositorio.findByUsername(username).isPresent()) {
            return;
        }
        repositorio.save(Usuario.builder()
                .username(username)
                .passwordHash(encoder.encode(password))
                .rol(rol)
                .activo(true)
                .build());
        log.info("Usuario inicial creado: {} ({})", username, rol);
    }
}
