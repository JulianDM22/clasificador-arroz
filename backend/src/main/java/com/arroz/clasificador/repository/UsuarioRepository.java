/*
 * Nombre: UsuarioRepository.java
 * Descripción: Acceso a datos de usuarios.
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.arroz.clasificador.model.Usuario;

/**
 * Repositorio de {@link Usuario}.
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /**
     * Busca un usuario por su nombre.
     *
     * @param username nombre de usuario
     * @return el usuario, si existe
     */
    Optional<Usuario> findByUsername(String username);
}
