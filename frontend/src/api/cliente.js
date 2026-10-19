/**
 * @file cliente.js
 * @description Cliente HTTP (axios) de la API REST. Agrega el token JWT y el idioma activo a
 *              cada petición, y avisa a la aplicación cuando el servidor responde 401 para cerrar
 *              la sesión.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import axios from 'axios';
import i18n from '../i18n';
import { leerSesion } from '../auth/sesion';

/** URL base de la API (variable de entorno de Vite). */
export const URL_API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/** Evento que se emite cuando el token deja de ser válido. */
export const EVENTO_SESION_VENCIDA = 'clasificador:sesion-vencida';

const cliente = axios.create({ baseURL: `${URL_API}/api/v1`, timeout: 90000 });

cliente.interceptors.request.use((config) => {
  const sesion = leerSesion();
  if (sesion?.token) config.headers.Authorization = `Bearer ${sesion.token}`;
  config.headers['Accept-Language'] = i18n.resolvedLanguage || 'es';
  return config;
});

cliente.interceptors.response.use(
  (r) => r,
  (error) => {
    const esLogin = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !esLogin) {
      window.dispatchEvent(new Event(EVENTO_SESION_VENCIDA));
    }
    return Promise.reject(error);
  },
);

/**
 * Extrae un mensaje legible de un error de la API (formato Problem Details).
 * @param {unknown} error error de axios
 * @param {function(string): string} t función de traducción
 * @returns {string} mensaje para mostrar
 */
export function mensajeError(error, t) {
  if (!error?.response) return t('errores.red');
  return error.response.data?.detail || t('errores.generico');
}

/**
 * Errores por campo devueltos por la API (propiedad "errores" del Problem Details).
 * @param {unknown} error error de axios
 * @returns {Record<string, string>} mapa campo → mensaje
 */
export function erroresDeCampo(error) {
  return error?.response?.data?.errores || {};
}

export default cliente;
