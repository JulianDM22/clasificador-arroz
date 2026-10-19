/**
 * @file TemaContexto.jsx
 * @description Proveedor del tema claro/oscuro. Arranca con la preferencia del sistema y
 *              recuerda la elección del usuario en localStorage (criterio CA-08.3).
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { createContext, useContext, useMemo, useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { crearTema } from './tema';

const CLAVE = 'clasificador.tema';
const TemaCtx = createContext({ modo: 'claro', alternar: () => {} });

function modoInicial() {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado === 'claro' || guardado === 'oscuro') return guardado;
  } catch {
    // Almacenamiento bloqueado: se usa la preferencia del sistema.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
}

/**
 * Envuelve la aplicación con el tema activo.
 * @param {{children: React.ReactNode}} props
 */
export function ProveedorTema({ children }) {
  const [modo, setModo] = useState(modoInicial);
  const valor = useMemo(() => ({
    modo,
    alternar: () => setModo((m) => {
      const nuevo = m === 'claro' ? 'oscuro' : 'claro';
      try { localStorage.setItem(CLAVE, nuevo); } catch { /* sin persistencia */ }
      return nuevo;
    }),
  }), [modo]);
  const tema = useMemo(() => crearTema(modo), [modo]);
  return (
    <TemaCtx.Provider value={valor}>
      <ThemeProvider theme={tema}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </TemaCtx.Provider>
  );
}

/** @returns {{modo: 'claro'|'oscuro', alternar: function(): void}} */
export const useTema = () => useContext(TemaCtx);
