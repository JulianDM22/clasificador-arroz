/*
 * Nombre: UsuarioDetailsServiceTest.java
 * Descripción: Pruebas unitarias de la carga de usuarios para Spring Security (rol, hash y
 *              usuarios desactivados).
 * Fecha de creación: 2026-10-17
 * Última actualización: 2026-10-17
 * Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * Versión: 1.0.0
 */
package com.arroz.clasificador.unit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.arroz.clasificador.model.Rol;
import com.arroz.clasificador.model.Usuario;
import com.arroz.clasificador.repository.UsuarioRepository;
import com.arroz.clasificador.service.UsuarioDetailsService;

@ExtendWith(MockitoExtension.class)
@DisplayName("UsuarioDetailsService (unitarias)")
class UsuarioDetailsServiceTest {

    @Mock
    private UsuarioRepository repositorio;

    @InjectMocks
    private UsuarioDetailsService servicio;

    @Test
    @DisplayName("CA-01.1 carga el usuario con su hash y su rol")
    void cargaUsuario() {
        when(repositorio.findByUsername("admin")).thenReturn(Optional.of(
                Usuario.builder().username("admin").passwordHash("$2a$hash").rol(Rol.ADMIN).activo(true).build()));

        UserDetails u = servicio.loadUserByUsername("admin");

        assertThat(u.getUsername()).isEqualTo("admin");
        assertThat(u.getPassword()).isEqualTo("$2a$hash");
        assertThat(u.getAuthorities()).extracting("authority").containsExactly("ROLE_ADMIN");
        assertThat(u.isEnabled()).isTrue();
    }

    @Test
    @DisplayName("un usuario desactivado queda deshabilitado")
    void desactivado() {
        when(repositorio.findByUsername("viejo")).thenReturn(Optional.of(
                Usuario.builder().username("viejo").passwordHash("x").rol(Rol.USUARIO).activo(false).build()));
        assertThat(servicio.loadUserByUsername("viejo").isEnabled()).isFalse();
    }

    @Test
    @DisplayName("CA-01.2 un usuario inexistente lanza UsernameNotFoundException")
    void inexistente() {
        when(repositorio.findByUsername("nadie")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> servicio.loadUserByUsername("nadie"))
                .isInstanceOf(UsernameNotFoundException.class);
    }
}
