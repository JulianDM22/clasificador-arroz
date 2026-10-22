/**
 * @file RutaProtegida.jsx
 * @description Redirige al acceso del equipo si no hay una sesión vigente (CA-01.3) y a los
 *              lotes si la página es solo para ADMIN y el usuario es operario (CA-10.1).
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-21
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
  if (soloAdmin && !esAdmin) return <Navigate to="/equipo/lotes" replace />;
  return children;
}
