/*
 * Nombre: UsuarioDetailsService.java
 * Descripción: Carga los usuarios de la base de datos para que Spring Security valide las
 *              credenciales con BCrypt.
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.service;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.arroz.clasificador.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

/**
 * Adaptador entre {@link com.arroz.clasificador.model.Usuario} y Spring Security.
 */
@Service
@RequiredArgsConstructor
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioRepository repositorio;

    @Override
    public UserDetails loadUserByUsername(String username) {
        return repositorio.findByUsername(username)
                .map(u -> User.withUsername(u.getUsername())
                        .password(u.getPasswordHash())
                        .roles(u.getRol().name())
                        .disabled(!u.isActivo())
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException(username));
    }
}
