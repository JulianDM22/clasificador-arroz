/**
 * @file App.test.jsx
 * @description Pruebas de la estructura de la página: secciones, navegación, ruta inexistente,
 *              idioma y tema que se recuerdan.
 * @fecha_creacion 2026-10-21
 * @actualizacion 2026-11-26
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 2.0.0
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import i18n from './i18n';
import { ProveedorTema } from './tema/TemaContexto';
import { ProveedorAuth } from './auth/AuthContexto';
import { guardarSesion } from './auth/sesion';
import * as servicios from './api/servicios';

vi.mock('./api/servicios');

function abrir(ruta = '/', rol = null) {
  if (rol) guardarSesion({ token: 't', username: rol === 'ADMIN' ? 'admin' : 'operario', rol, expira: Date.now() + 3600000 });
  return render(
    <ProveedorTema>
      <ProveedorAuth>
        <MemoryRouter initialEntries={[ruta]}><App /></MemoryRouter>
      </ProveedorAuth>
    </ProveedorTema>,
  );
}

describe('App', () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    servicios.listarModelos.mockResolvedValue({ modelo_por_defecto: 'resnet50v2', modelos: [] });
    servicios.obtenerEstadisticas.mockResolvedValue({
      clasificaciones: { total: 0, ultimos7Dias: 0, porVariedad: {}, porModelo: {}, porDia: [] },
    });
    sessionStorage.clear();
    await i18n.changeLanguage('es');
  });

  it('la página principal explica qué hace y tiene las secciones Clasificar y Cómo se construyó', async () => {
    abrir();
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('¿Qué variedad de arroz es?');
    expect(screen.getByTestId('nav-clasificar')).toHaveAttribute('href', '/#clasificar');
    expect(screen.getByTestId('nav-proyecto')).toHaveAttribute('href', '/#proyecto');
    expect(screen.getByRole('heading', { name: 'Cómo se construyó' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver el código en GitHub' })).toHaveAttribute('href', 'https://github.com/JulianDM22/clasificador-arroz');
  });

  it('los 6 temas de IA aparecen con su resultado principal', () => {
    abrir();
    for (let n = 1; n <= 6; n += 1) expect(screen.getByTestId(`tema-${n}`)).toHaveTextContent(`Tema ${n}`);
    expect(screen.getByTestId('tema-1')).toHaveTextContent('74.703 fotos');
    expect(screen.getByTestId('tema-4')).toHaveTextContent('99,91 %');
    expect(screen.getByTestId('tema-5')).toHaveTextContent('McNemar');
    expect(screen.getByTestId('tema-6')).toHaveTextContent('1,66×');
  });

  it('CA-06.8 un visitante no ve el panel; el acceso del administrador está en la barra', () => {
    abrir();
    expect(screen.getByTestId('nav-equipo')).toHaveAttribute('href', '/equipo/entrar');
    expect(screen.queryByTestId('nav-panel')).toBeNull();
  });

  it('CA-01.3 sin sesión, el panel lleva al acceso del administrador', async () => {
    abrir('/equipo/panel');
    expect(await screen.findByRole('heading', { name: 'Acceso del administrador' })).toBeInTheDocument();
  });

  it('CA-10.1 el administrador ve "Panel" y lo abre; las rutas viejas del inventario llevan al panel', async () => {
    abrir('/equipo/lotes', 'ADMIN');
    expect(await screen.findByRole('heading', { name: 'Panel del administrador' })).toBeInTheDocument();
    expect(screen.getByTestId('nav-panel')).toBeInTheDocument();
  });

  it('CA-10.1 un usuario que no es administrador vuelve a la página principal', async () => {
    abrir('/equipo/panel', 'USUARIO');
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('¿Qué variedad de arroz es?');
  });

  it('cerrar sesión vuelve a la página pública', async () => {
    abrir('/equipo/panel', 'ADMIN');
    await userEvent.click(await screen.findByTestId('boton-salir'));
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('¿Qué variedad de arroz es?');
    expect(screen.getByTestId('nav-equipo')).toBeInTheDocument();
  });

  it('una ruta inexistente muestra "Página no encontrada"', async () => {
    abrir('/no-existe');
    expect(await screen.findByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument();
  });

  it('cambiar el idioma traduce la página y se recuerda', async () => {
    abrir();
    await userEvent.click(screen.getByTestId('boton-idioma'));
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Which rice variety is it?');
    expect(screen.getByTestId('tema-4')).toHaveTextContent('99.91%');
    expect(localStorage.getItem('clasificador.idioma')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    await userEvent.click(screen.getByTestId('boton-idioma'));
  });

  it('el tema elegido se recuerda', async () => {
    abrir();
    const antes = localStorage.getItem('clasificador.tema');
    await userEvent.click(screen.getByTestId('boton-tema'));
    expect(localStorage.getItem('clasificador.tema')).not.toBe(antes);
  });
});
