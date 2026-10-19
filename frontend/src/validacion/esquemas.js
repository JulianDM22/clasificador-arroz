/**
 * @file esquemas.js
 * @description Esquemas de validación con Yup. Repiten los límites de la API (CA-02.2 a
 *              CA-02.4) para avisar al usuario antes de enviar; la API vuelve a validar porque
 *              nunca se confía solo en el cliente.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import * as yup from 'yup';

/** Límites compartidos con la API. */
export const LIMITES = { nombreMin: 3, nombreMax: 100, descripcionMax: 500, archivoBytes: 5 * 1024 * 1024 };
export const CATEGORIAS = ['ARBORIO', 'BASMATI', 'IPSALA', 'JASMINE', 'KARACADAG'];
export const ESTADOS = ['ACTIVO', 'INACTIVO'];
export const TIPOS_IMAGEN = ['image/jpeg', 'image/png'];

/**
 * Esquema del formulario de producto.
 * @param {function(string, object=): string} t función de traducción
 * @returns {yup.ObjectSchema}
 */
export const esquemaProducto = (t) => yup.object({
  nombre: yup.string().trim()
    .required(t('validacion.nombreObligatorio'))
    .min(LIMITES.nombreMin, t('validacion.nombreMin', { min: LIMITES.nombreMin }))
    .max(LIMITES.nombreMax, t('validacion.nombreMax', { max: LIMITES.nombreMax })),
  categoria: yup.string().oneOf(CATEGORIAS, t('validacion.categoriaObligatoria')).required(t('validacion.categoriaObligatoria')),
  descripcion: yup.string().max(LIMITES.descripcionMax, t('validacion.descripcionMax', { max: LIMITES.descripcionMax })),
  estado: yup.string().oneOf(ESTADOS, t('validacion.estadoObligatorio')).required(t('validacion.estadoObligatorio')),
});

/**
 * Esquema del inicio de sesión (CA-01.5).
 * @param {function(string): string} t función de traducción
 * @returns {yup.ObjectSchema}
 */
export const esquemaLogin = (t) => yup.object({
  username: yup.string().trim().required(t('validacion.usuarioObligatorio')),
  password: yup.string().required(t('validacion.contrasenaObligatoria')),
});

/**
 * Valida una foto antes de enviarla (CA-06.2, CA-06.3).
 * @param {File} archivo
 * @param {function(string): string} t función de traducción
 * @returns {string|null} mensaje de error o null si es válida
 */
export function validarFoto(archivo, t) {
  if (!archivo || !TIPOS_IMAGEN.includes(archivo.type)) return t('validacion.archivoTipo');
  if (archivo.size > LIMITES.archivoBytes) return t('validacion.archivoTamano');
  return null;
}
