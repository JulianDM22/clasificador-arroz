/**
 * @file App.jsx
 * @description Rutas de la aplicación: inicio de sesión (pública) y páginas de productos
 *              (protegidas por sesión).
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { Navigate, Route, Routes } from 'react-router-dom';
import RutaProtegida from './auth/RutaProtegida';
import Encabezado from './componentes/Encabezado';
import PaginaLogin from './paginas/PaginaLogin';
import PaginaProductos from './paginas/PaginaProductos';
import PaginaFormularioProducto from './paginas/PaginaFormularioProducto';
import PaginaNoEncontrada from './paginas/PaginaNoEncontrada';

/** Envuelve una página protegida con la estructura común. */
const protegida = (pagina) => <RutaProtegida><Encabezado>{pagina}</Encabezado></RutaProtegida>;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PaginaLogin />} />
      <Route path="/productos" element={protegida(<PaginaProductos />)} />
      <Route path="/productos/nuevo" element={protegida(<PaginaFormularioProducto />)} />
      <Route path="/productos/:id/editar" element={protegida(<PaginaFormularioProducto />)} />
      <Route path="/" element={<Navigate to="/productos" replace />} />
      <Route path="*" element={<PaginaNoEncontrada />} />
    </Routes>
  );
}
