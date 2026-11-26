/**
 * @file RutaProtegida.jsx
 * @description Redirige al acceso si no hay una sesión vigente (CA-01.3) y a la página
 *              principal si la página es solo para ADMIN y el usuario no lo es (CA-10.1).
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-11-26
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.1.0
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContexto';

/**
 * @param {{children: React.ReactNode, soloAdmin?: boolean}} props
 */
export default function RutaProtegida({ children, soloAdmin = false }) {
  const { sesion, esAdmin } = useAuth();
  const ubicacion = useLocation();
  if (!sesion) return <Navigate to="/equipo/entrar" replace state={{ desde: ubicacion.pathname }} />;
  if (soloAdmin && !esAdmin) return <Navigate to="/" replace />;
  return children;
}
