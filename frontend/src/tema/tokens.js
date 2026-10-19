/**
 * @file tokens.js
 * @description Tokens de diseño: colores, tipografía, espaciado y radios. Todos los colores de
 *              la interfaz salen de aquí (criterio CA-08.3). Los pares de color cumplen contraste
 *              AA de WCAG sobre su fondo.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */

/** Paleta base (nombres semánticos, no de uso). */
export const paleta = {
  verdeArroz: { 50: '#eef7ee', 100: '#d3ead4', 300: '#7fc283', 500: '#2e7d32', 700: '#1b5e20', 900: '#0d3311' },
  trigo: { 100: '#fff4dc', 300: '#f6cf7a', 500: '#c98a10', 700: '#8a5a00' },
  gris: { 0: '#ffffff', 50: '#f6f7f6', 100: '#eceeec', 300: '#c4c9c4', 500: '#6b726b', 700: '#3a3f3a', 800: '#242824', 900: '#151815' },
  rojo: { 300: '#f28b82', 600: '#c62828' },
  azul: { 300: '#8ab4f8', 600: '#1565c0' },
};

/**
 * Tokens semánticos por modo de color.
 * @type {{claro: object, oscuro: object}}
 */
export const tokensColor = {
  claro: {
    primario: paleta.verdeArroz[700],
    primarioContraste: paleta.gris[0],
    secundario: paleta.trigo[700],
    fondo: paleta.gris[50],
    superficie: paleta.gris[0],
    texto: paleta.gris[900],
    textoSecundario: paleta.gris[700],
    borde: paleta.gris[300],
    error: paleta.rojo[600],
    info: paleta.azul[600],
    exito: paleta.verdeArroz[500],
  },
  oscuro: {
    primario: paleta.verdeArroz[300],
    primarioContraste: paleta.gris[900],
    secundario: paleta.trigo[300],
    fondo: paleta.gris[900],
    superficie: paleta.gris[800],
    texto: paleta.gris[50],
    textoSecundario: paleta.gris[300],
    borde: paleta.gris[700],
    error: paleta.rojo[300],
    info: paleta.azul[300],
    exito: paleta.verdeArroz[300],
  },
};

/** Tipografía, espaciado (múltiplos de 8 px) y radios. */
export const tokensBase = {
  fuente: '"Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  espaciadoBase: 8,
  radio: 10,
  anchoMaximoContenido: 1100,
};
