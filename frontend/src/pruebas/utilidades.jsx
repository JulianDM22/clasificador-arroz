/**
 * @file utilidades.jsx
 * @description Ayudas para las pruebas de componentes: renderiza con todos los proveedores y,
 *              si se pide, con una sesión iniciada y con estado de navegación (por ejemplo, la
 *              variedad sugerida que llega desde la página de clasificación).
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-21
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.1.0
 */
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ProveedorTema } from '../tema/TemaContexto';
import { ProveedorAuth } from '../auth/AuthContexto';
import { guardarSesion } from '../auth/sesion';

/** Pantalla de destino que muestra el estado de navegación recibido. */
function Destino({ nombre }) {
  const { state } = useLocation();
  return <div data-testid="destino">{nombre}{state ? ` ${JSON.stringify(state)}` : ''}</div>;
}

/**
 * @param {React.ReactElement} ui componente a probar
 * @param {{ruta?: string, estado?: object, patron?: string, rol?: 'ADMIN'|'USUARIO'|null}} [opciones]
 */
export function renderizar(ui, { ruta = '/', estado, patron = '*', rol = null } = {}) {
  if (rol) guardarSesion({ token: 'token-de-prueba', username: rol === 'ADMIN' ? 'admin' : 'operario', rol, expira: Date.now() + 3600000 });
  return render(
    <ProveedorTema>
      <ProveedorAuth>
        <MemoryRouter initialEntries={[{ pathname: ruta, state: estado }]}>
          <Routes>
            <Route path={patron} element={ui} />
            <Route path="/equipo/lotes" element={<Destino nombre="pantalla-lotes" />} />
            <Route path="/equipo/lotes/nuevo" element={<Destino nombre="pantalla-nuevo-lote" />} />
            <Route path="/equipo/entrar" element={<Destino nombre="pantalla-entrar" />} />
          </Routes>
        </MemoryRouter>
      </ProveedorAuth>
    </ProveedorTema>,
  );
}
