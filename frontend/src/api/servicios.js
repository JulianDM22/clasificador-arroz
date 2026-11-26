/**
 * @file servicios.js
 * @description Funciones de acceso a la API: clasificación pública (una foto con un modelo, o
 *              los 5 modelos a la vez), catálogo de modelos, inicio de sesión del administrador y
 *              estadísticas de uso. La foto viaja como multipart; lo demás, como JSON.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-11-26
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 2.0.0
 */
import cliente from './cliente';

/**
 * Inicia sesión.
 * @param {{username: string, password: string}} credenciales
 * @returns {Promise<{token: string, username: string, rol: string, expiraEnSegundos: number}>}
 */
export const iniciarSesion = (credenciales) => cliente.post('/auth/login', credenciales).then((r) => r.data);

/**
 * Estadísticas del panel (solo ADMIN).
 * @returns {Promise<{clasificaciones: {total: number, ultimos7Dias: number, porVariedad: Object<string, number>,
 *   porModelo: Object<string, number>, porDia: {fecha: string, cantidad: number}[]}}>}
 */
export const obtenerEstadisticas = () => cliente.get('/estadisticas').then((r) => r.data);

/**
 * @typedef {Object} Prediccion
 * @property {string} modelo id del modelo ("resnet50v2", ..., o "ensamble")
 * @property {string} nombre nombre legible
 * @property {string} categoria variedad sugerida
 * @property {number} confianza probabilidad de la variedad sugerida (0 a 1)
 * @property {Object<string, number>} probabilidades probabilidad de cada variedad
 * @property {number} ms tiempo de inferencia
 */

const formulario = (archivo) => {
  const datos = new FormData();
  datos.append('archivo', archivo);
  return datos;
};

/**
 * Clasifica la foto de un grano con un modelo.
 * @param {File} archivo imagen JPEG o PNG
 * @param {string} [modelo] id del modelo o "ensamble"; si se omite, el modelo por defecto
 * @returns {Promise<Prediccion>}
 */
export const clasificarFoto = (archivo, modelo) => cliente
  .post('/clasificaciones', formulario(archivo), { params: modelo ? { modelo } : {} })
  .then((r) => r.data);

/**
 * Clasifica la foto con los 5 modelos y con el ensamble.
 * @param {File} archivo imagen JPEG o PNG
 * @returns {Promise<{modelos: Prediccion[], ensamble: Prediccion, consenso: boolean}>}
 */
export const compararModelos = (archivo) => cliente
  .post('/clasificaciones/comparacion', formulario(archivo))
  .then((r) => r.data);

/**
 * Catálogo de modelos con sus métricas de test.
 * @returns {Promise<{modelo_por_defecto: string, ensamble_disponible: boolean, es_prueba: boolean, modelos: Object[]}>}
 */
export const listarModelos = () => cliente.get('/modelos').then((r) => r.data);
