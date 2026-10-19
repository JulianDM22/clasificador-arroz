/**
 * @file main.jsx
 * @description Punto de entrada de React: monta la aplicación con sus proveedores (tema,
 *              autenticación, idioma y enrutador).
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './i18n';
import App from './App';
import { ProveedorTema } from './tema/TemaContexto';
import { ProveedorAuth } from './auth/AuthContexto';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProveedorTema>
      <ProveedorAuth>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ProveedorAuth>
    </ProveedorTema>
  </StrictMode>,
);
