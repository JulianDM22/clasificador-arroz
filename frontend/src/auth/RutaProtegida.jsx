/**
 * @file RutaProtegida.jsx
 * @description Redirige al inicio de sesión si no hay una sesión vigente (CA-01.3).
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContexto';

/**
 * @param {{children: React.ReactNode}} props
 */
export default function RutaProtegida({ children }) {
  const { sesion } = useAuth();
  const ubicacion = useLocation();
  if (!sesion) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  return children;
}
