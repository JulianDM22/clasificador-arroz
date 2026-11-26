/**
 * @file esquemas.js
 * @description Validaciones en el navegador: la foto antes de enviarla (tipo y tamaño) y el
 *              formulario de acceso del administrador. La API vuelve a validar, porque nunca se
 *              confía solo en el cliente.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-11-26
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 2.0.0
 */
import * as yup from 'yup';

/** Tamaño máximo de la foto: 5 MB, igual que el servicio de inferencia. */
export const TAMANO_MAXIMO = 5 * 1024 * 1024;
export const CATEGORIAS = ['ARBORIO', 'BASMATI', 'IPSALA', 'JASMINE', 'KARACADAG'];
export const TIPOS_IMAGEN = ['image/jpeg', 'image/png'];

/**
 * Esquema del formulario de acceso (no se envía con campos vacíos).
 * @param {function(string): string} t función de traducción
 * @returns {yup.ObjectSchema}
 */
export const esquemaLogin = (t) => yup.object({
  username: yup.string().trim().required(t('validacion.usuarioObligatorio')),
  password: yup.string().required(t('validacion.contrasenaObligatoria')),
});

/**
 * Valida una foto antes de enviarla.
 * @param {File} archivo
 * @param {function(string): string} t función de traducción
 * @returns {string|null} mensaje de error o null si es válida
 */
export function validarFoto(archivo, t) {
  if (!archivo || !TIPOS_IMAGEN.includes(archivo.type)) return t('validacion.archivoTipo');
  if (archivo.size > TAMANO_MAXIMO) return t('validacion.archivoTamano');
  return null;
}
