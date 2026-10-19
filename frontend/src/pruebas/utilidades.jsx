/**
 * @file utilidades.jsx
 * @description Ayudas para las pruebas de componentes: renderiza con todos los proveedores y,
 *              si se pide, con una sesión iniciada.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProveedorTema } from '../tema/TemaContexto';
import { ProveedorAuth } from '../auth/AuthContexto';
import { guardarSesion } from '../auth/sesion';

/**
 * @param {React.ReactElement} ui componente a probar
 * @param {{ruta?: string, patron?: string, rol?: 'ADMIN'|'USUARIO'|null}} [opciones]
 */
export function renderizar(ui, { ruta = '/', patron = '*', rol = null } = {}) {
  if (rol) guardarSesion({ token: 'token-de-prueba', username: rol === 'ADMIN' ? 'admin' : 'operario', rol, expira: Date.now() + 3600000 });
  return render(
    <ProveedorTema>
      <ProveedorAuth>
        <MemoryRouter initialEntries={[ruta]}>
          <Routes>
            <Route path={patron} element={ui} />
            <Route path="/productos" element={<div>pantalla-productos</div>} />
          </Routes>
        </MemoryRouter>
      </ProveedorAuth>
    </ProveedorTema>,
  );
}
