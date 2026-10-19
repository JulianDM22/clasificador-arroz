/**
 * @file AuthContexto.jsx
 * @description Estado de autenticación de la aplicación: iniciar y cerrar sesión, rol del
 *              usuario y cierre automático cuando el token vence (HU-01).
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { iniciarSesion } from '../api/servicios';
import { EVENTO_SESION_VENCIDA } from '../api/cliente';
import { borrarSesion, guardarSesion, leerSesion } from './sesion';

const AuthCtx = createContext(null);

/**
 * Proveedor de autenticación.
 * @param {{children: React.ReactNode}} props
 */
export function ProveedorAuth({ children }) {
  const [sesion, setSesion] = useState(leerSesion);
  const [vencida, setVencida] = useState(false);

  const cerrar = useCallback(() => {
    borrarSesion();
    setSesion(null);
  }, []);

  useEffect(() => {
    const alVencer = () => { setVencida(true); cerrar(); };
    window.addEventListener(EVENTO_SESION_VENCIDA, alVencer);
    return () => window.removeEventListener(EVENTO_SESION_VENCIDA, alVencer);
  }, [cerrar]);

  const entrar = useCallback(async (credenciales) => {
    const r = await iniciarSesion(credenciales);
    const nueva = { token: r.token, username: r.username, rol: r.rol, expira: Date.now() + r.expiraEnSegundos * 1000 };
    guardarSesion(nueva);
    setVencida(false);
    setSesion(nueva);
    return nueva;
  }, []);

  const valor = useMemo(() => ({
    sesion,
    vencida,
    esAdmin: sesion?.rol === 'ADMIN',
    entrar,
    cerrar,
  }), [sesion, vencida, entrar, cerrar]);

  return <AuthCtx.Provider value={valor}>{children}</AuthCtx.Provider>;
}

/** @returns {{sesion: object|null, vencida: boolean, esAdmin: boolean, entrar: Function, cerrar: Function}} */
export const useAuth = () => useContext(AuthCtx);
