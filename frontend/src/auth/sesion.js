/**
 * @file sesion.js
 * @description Guarda la sesión (token JWT, usuario, rol y vencimiento) en sessionStorage: se
 *              borra al cerrar la pestaña, lo que reduce la exposición del token.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
const CLAVE = 'clasificador.sesion';

/**
 * @typedef {Object} Sesion
 * @property {string} token
 * @property {string} username
 * @property {'ADMIN'|'USUARIO'} rol
 * @property {number} expira marca de tiempo (ms) de vencimiento
 */

/** @returns {Sesion|null} sesión vigente o null */
export function leerSesion() {
  try {
    const s = JSON.parse(sessionStorage.getItem(CLAVE));
    if (s?.token && s.expira > Date.now()) return s;
  } catch {
    // Datos corruptos o almacenamiento bloqueado.
  }
  return null;
}

/** @param {Sesion} sesion */
export function guardarSesion(sesion) {
  try { sessionStorage.setItem(CLAVE, JSON.stringify(sesion)); } catch { /* solo en memoria */ }
}

export function borrarSesion() {
  try { sessionStorage.removeItem(CLAVE); } catch { /* nada que borrar */ }
}
