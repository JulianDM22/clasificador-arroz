/**
 * @file tema.js
 * @description Construye el tema de Material UI a partir de los tokens de diseño, para modo
 *              claro u oscuro.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { createTheme } from '@mui/material/styles';
import { tokensBase, tokensColor } from './tokens';

/**
 * Crea el tema de MUI.
 * @param {'claro'|'oscuro'} modo modo de color
 * @returns {Object} tema de Material UI listo para ThemeProvider
 */
export function crearTema(modo) {
  const c = tokensColor[modo];
  return createTheme({
    palette: {
      mode: modo === 'oscuro' ? 'dark' : 'light',
      primary: { main: c.primario, contrastText: c.primarioContraste },
      secondary: { main: c.secundario },
      error: { main: c.error },
      info: { main: c.info },
      success: { main: c.exito },
      background: { default: c.fondo, paper: c.superficie },
      text: { primary: c.texto, secondary: c.textoSecundario },
      divider: c.borde,
    },
    typography: { fontFamily: tokensBase.fuente, h1: { fontSize: '1.75rem', fontWeight: 700 }, h2: { fontSize: '1.35rem', fontWeight: 600 } },
    spacing: tokensBase.espaciadoBase,
    shape: { borderRadius: tokensBase.radio },
    components: {
      MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
      MuiTextField: { defaultProps: { fullWidth: true } },
      MuiToggleButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' } } },
    },
  });
}
