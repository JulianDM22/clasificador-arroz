/**
 * @file App.jsx
 * @description Rutas de la aplicación. Públicas: la página de clasificación ("/") y el acceso
 *              del equipo. Del equipo (con sesión): el inventario de lotes. Solo ADMIN: el panel
 *              de estadísticas. Las rutas antiguas (/login, /productos) redirigen a las nuevas.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-21
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 2.0.0
 */
import { Navigate, Route, Routes } from 'react-router-dom';
import RutaProtegida from './auth/RutaProtegida';
import Encabezado from './componentes/Encabezado';
import PaginaInicio from './paginas/PaginaInicio';
import PaginaLogin from './paginas/PaginaLogin';
import PaginaProductos from './paginas/PaginaProductos';
import PaginaFormularioProducto from './paginas/PaginaFormularioProducto';
import PaginaPanel from './paginas/PaginaPanel';
import PaginaNoEncontrada from './paginas/PaginaNoEncontrada';

/** Página con la estructura común. */
const conEncabezado = (pagina) => <Encabezado>{pagina}</Encabezado>;
/** Página del equipo: exige sesión (y rol ADMIN si se indica). */
const delEquipo = (pagina, soloAdmin = false) => <RutaProtegida soloAdmin={soloAdmin}>{conEncabezado(pagina)}</RutaProtegida>;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={conEncabezado(<PaginaInicio />)} />
      <Route path="/equipo/entrar" element={<PaginaLogin />} />
      <Route path="/equipo" element={<Navigate to="/equipo/lotes" replace />} />
      <Route path="/equipo/lotes" element={delEquipo(<PaginaProductos />)} />
      <Route path="/equipo/lotes/nuevo" element={delEquipo(<PaginaFormularioProducto />)} />
      <Route path="/equipo/lotes/:id/editar" element={delEquipo(<PaginaFormularioProducto />)} />
      <Route path="/equipo/panel" element={delEquipo(<PaginaPanel />, true)} />
      <Route path="/login" element={<Navigate to="/equipo/entrar" replace />} />
      <Route path="/productos/*" element={<Navigate to="/equipo/lotes" replace />} />
      <Route path="*" element={conEncabezado(<PaginaNoEncontrada />)} />
    </Routes>
  );
}
