/**
 * @file App.jsx
 * @description Rutas de la aplicación. Pública: la página para clasificar y conocer el proyecto.
 *              Del administrador: el acceso y el panel con las estadísticas de uso de los modelos.
 *              Las rutas antiguas redirigen a las nuevas.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-11-26
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 3.0.0
 */
import { Navigate, Route, Routes } from 'react-router-dom';
import RutaProtegida from './auth/RutaProtegida';
import Encabezado from './componentes/Encabezado';
import PaginaInicio from './paginas/PaginaInicio';
import PaginaLogin from './paginas/PaginaLogin';
import PaginaPanel from './paginas/PaginaPanel';
import PaginaNoEncontrada from './paginas/PaginaNoEncontrada';

/** Página con la estructura común. */
const conEncabezado = (pagina) => <Encabezado>{pagina}</Encabezado>;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={conEncabezado(<PaginaInicio />)} />
      <Route path="/equipo/entrar" element={<PaginaLogin />} />
      <Route path="/equipo/panel" element={<RutaProtegida soloAdmin>{conEncabezado(<PaginaPanel />)}</RutaProtegida>} />
      <Route path="/equipo/*" element={<Navigate to="/equipo/panel" replace />} />
      <Route path="/login" element={<Navigate to="/equipo/entrar" replace />} />
      <Route path="*" element={conEncabezado(<PaginaNoEncontrada />)} />
    </Routes>
  );
}
