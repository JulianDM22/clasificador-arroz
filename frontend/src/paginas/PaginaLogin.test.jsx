/**
 * @file PaginaLogin.test.jsx
 * @description Pruebas del inicio de sesión (HU-01): validación sin enviar, error de la API,
 *              ingreso correcto, cambio de idioma y de tema con persistencia.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-21
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderizar } from '../pruebas/utilidades';
import PaginaLogin from './PaginaLogin';
import * as servicios from '../api/servicios';

vi.mock('../api/servicios');

describe('PaginaLogin', () => {
  beforeEach(() => vi.resetAllMocks());

  it('CA-01.5 con campos vacíos muestra errores y no llama a la API', async () => {
    renderizar(<PaginaLogin />, { ruta: '/login' });
    await userEvent.click(screen.getByTestId('boton-entrar'));
    expect(await screen.findByText('El usuario es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('La contraseña es obligatoria')).toBeInTheDocument();
    expect(servicios.iniciarSesion).not.toHaveBeenCalled();
  });

  it('CA-01.2 muestra el mensaje de la API si las credenciales fallan', async () => {
    servicios.iniciarSesion.mockRejectedValue({ response: { status: 401, data: { detail: 'Usuario o contraseña incorrectos' } } });
    renderizar(<PaginaLogin />, { ruta: '/login' });
    await userEvent.type(screen.getByLabelText(/Usuario/), 'admin');
    await userEvent.type(screen.getByLabelText(/Contraseña/), 'mala');
    await userEvent.click(screen.getByTestId('boton-entrar'));
    expect(await screen.findByTestId('error-login')).toHaveTextContent('Usuario o contraseña incorrectos');
  });

  it('CA-01.1 con credenciales correctas guarda la sesión y entra', async () => {
    servicios.iniciarSesion.mockResolvedValue({ token: 'abc', username: 'admin', rol: 'ADMIN', expiraEnSegundos: 3600 });
    renderizar(<PaginaLogin />, { ruta: '/login' });
    await userEvent.type(screen.getByLabelText(/Usuario/), '  admin ');
    await userEvent.type(screen.getByLabelText(/Contraseña/), 'Admin123*');
    await userEvent.click(screen.getByTestId('boton-entrar'));
    await waitFor(() => expect(screen.getByTestId('destino')).toHaveTextContent('pantalla-lotes'));
    expect(servicios.iniciarSesion).toHaveBeenCalledWith({ username: 'admin', password: 'Admin123*' });
    expect(JSON.parse(sessionStorage.getItem('clasificador.sesion')).rol).toBe('ADMIN');
  });

  it('CA-07.2 cambiar el idioma traduce la pantalla y se recuerda', async () => {
    renderizar(<PaginaLogin />, { ruta: '/login' });
    expect(screen.getByRole('heading', { name: 'Acceso del equipo' })).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('boton-idioma'));
    expect(await screen.findByRole('heading', { name: 'Team access' })).toBeInTheDocument();
    expect(localStorage.getItem('clasificador.idioma')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('CA-08.3 el tema elegido se recuerda', async () => {
    renderizar(<PaginaLogin />, { ruta: '/login' });
    await userEvent.click(screen.getByTestId('boton-tema'));
    expect(localStorage.getItem('clasificador.tema')).toBe('oscuro');
  });
});
