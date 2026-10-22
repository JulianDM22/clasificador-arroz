/**
 * @file App.test.jsx
 * @description Pruebas de navegación y permisos por rol (HU-01, HU-10): qué ve un visitante, un
 *              operario y un administrador, y a dónde se redirige quien no tiene permiso.
 * @fecha_creacion 2026-10-21
 * @actualizacion 2026-10-21
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { ProveedorTema } from './tema/TemaContexto';
import { ProveedorAuth } from './auth/AuthContexto';
import { guardarSesion } from './auth/sesion';
import * as servicios from './api/servicios';

vi.mock('./api/servicios');

function abrir(ruta, rol = null) {
  if (rol) guardarSesion({ token: 't', username: rol === 'ADMIN' ? 'admin' : 'operario', rol, expira: Date.now() + 3600000 });
  return render(
    <ProveedorTema>
      <ProveedorAuth>
        <MemoryRouter initialEntries={[ruta]}><App /></MemoryRouter>
      </ProveedorAuth>
    </ProveedorTema>,
  );
}

describe('App: navegación por rol', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    servicios.listarModelos.mockResolvedValue({ modelo_por_defecto: 'resnet50v2', modelos: [] });
    servicios.listarProductos.mockResolvedValue({ content: [], totalElements: 0 });
    servicios.obtenerEstadisticas.mockResolvedValue({
      lotes: { total: 0, activos: 0, inactivos: 0, porVariedad: {} },
      clasificaciones: { total: 0, ultimos7Dias: 0, porVariedad: {}, porModelo: {}, porDia: [] },
    });
  });

  it('CA-06.8 un visitante entra directo a clasificar; solo ve "Clasificar" y el acceso del equipo', async () => {
    abrir('/');
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('¿Qué variedad de arroz es?');
    expect(screen.getByTestId('nav-clasificar')).toBeInTheDocument();
    expect(screen.getByTestId('nav-equipo')).toHaveAttribute('href', '/equipo/entrar');
    expect(screen.queryByTestId('nav-lotes')).toBeNull();
    expect(screen.queryByTestId('nav-panel')).toBeNull();
  });

  it('CA-01.3 sin sesión, el inventario lleva al acceso del equipo', async () => {
    abrir('/equipo/lotes');
    expect(await screen.findByRole('heading', { name: 'Acceso del equipo' })).toBeInTheDocument();
    expect(screen.getByText(/Para clasificar fotos no necesitas cuenta/)).toBeInTheDocument();
  });

  it('las rutas antiguas redirigen a las nuevas', async () => {
    abrir('/login');
    expect(await screen.findByRole('heading', { name: 'Acceso del equipo' })).toBeInTheDocument();
  });

  it('CA-10.1 el operario ve "Lotes" pero no "Panel", y si abre el panel vuelve a los lotes', async () => {
    abrir('/equipo/panel', 'USUARIO');
    expect(await screen.findByRole('heading', { name: 'Lotes de arroz' })).toBeInTheDocument();
    expect(screen.getByTestId('nav-lotes')).toBeInTheDocument();
    expect(screen.queryByTestId('nav-panel')).toBeNull();
    expect(screen.getByTestId('usuario-actual')).toHaveTextContent('operario · Operario');
  });

  it('CA-10.1 el administrador ve "Panel" y lo abre', async () => {
    abrir('/equipo/panel', 'ADMIN');
    expect(await screen.findByRole('heading', { name: 'Panel del administrador' })).toBeInTheDocument();
    expect(screen.getByTestId('nav-panel')).toBeInTheDocument();
  });

  it('cerrar sesión vuelve a la página pública', async () => {
    abrir('/equipo/lotes', 'ADMIN');
    await userEvent.click(await screen.findByTestId('boton-salir'));
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('¿Qué variedad de arroz es?');
    expect(screen.getByTestId('nav-equipo')).toBeInTheDocument();
  });

  it('una ruta inexistente muestra "Página no encontrada"', async () => {
    abrir('/no-existe');
    expect(await screen.findByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument();
  });
});
