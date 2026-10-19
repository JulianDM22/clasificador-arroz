/**
 * @file servicios.js
 * @description Funciones de acceso a la API: autenticación, CRUD de productos y clasificación.
 *              Intercambian JSON, salvo la clasificación, que envía la foto como multipart.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import cliente from './cliente';

/**
 * @typedef {Object} Producto
 * @property {number} [id]
 * @property {string} nombre
 * @property {'ARBORIO'|'BASMATI'|'IPSALA'|'JASMINE'|'KARACADAG'} categoria
 * @property {string} [descripcion]
 * @property {'ACTIVO'|'INACTIVO'} estado
 */

/**
 * Inicia sesión.
 * @param {{username: string, password: string}} credenciales
 * @returns {Promise<{token: string, username: string, rol: string, expiraEnSegundos: number}>}
 */
export const iniciarSesion = (credenciales) => cliente.post('/auth/login', credenciales).then((r) => r.data);

/**
 * Lista productos con filtros y paginación.
 * @param {Object} filtros
 * @param {string} [filtros.categoria] variedad
 * @param {string} [filtros.estado] estado
 * @param {string} [filtros.q] texto contenido en el nombre
 * @param {number} [filtros.page] página desde 0
 * @param {number} [filtros.size] tamaño de página
 * @returns {Promise<{content: Producto[], totalElements: number, page: number, size: number}>}
 */
export const listarProductos = (filtros) => {
  const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== '' && v != null));
  return cliente.get('/productos', { params }).then((r) => r.data);
};

/** @param {number} id @returns {Promise<Producto>} */
export const obtenerProducto = (id) => cliente.get(`/productos/${id}`).then((r) => r.data);

/** @param {Producto} producto @returns {Promise<Producto>} */
export const crearProducto = (producto) => cliente.post('/productos', producto).then((r) => r.data);

/** @param {number} id @param {Producto} producto @returns {Promise<Producto>} */
export const actualizarProducto = (id, producto) => cliente.put(`/productos/${id}`, producto).then((r) => r.data);

/** @param {number} id @returns {Promise<void>} */
export const eliminarProducto = (id) => cliente.delete(`/productos/${id}`).then(() => undefined);

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
