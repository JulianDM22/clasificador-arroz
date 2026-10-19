/**
 * @file comun.js
 * @description Funciones compartidas por las pruebas de rendimiento con k6: inicio de sesión,
 *              mezcla de operaciones de un usuario real (consultar, filtrar, ver detalle y
 *              registrar) y verificaciones de cada respuesta.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import http from 'k6/http';
import { check, fail } from 'k6';

export const BASE = __ENV.BASE_URL || 'http://localhost:8080';
const CATEGORIAS = ['ARBORIO', 'BASMATI', 'IPSALA', 'JASMINE', 'KARACADAG'];

/** Inicia sesión una sola vez (en setup) para no medir BCrypt en cada iteración. */
export function iniciarSesion() {
  const r = http.post(`${BASE}/api/v1/auth/login`,
    JSON.stringify({ username: 'operario', password: __ENV.USUARIO_PASSWORD || 'Operario123*' }),
    { headers: { 'Content-Type': 'application/json' } });
  if (r.status !== 200) fail(`No se pudo iniciar sesión: ${r.status}`);
  return { token: r.json('token') };
}

/**
 * Una iteración de usuario: 60 % listar con filtros, 20 % ver detalle, 20 % registrar.
 * @param {{token: string}} datos datos de setup()
 */
export function usuarioTipico(datos) {
  const cab = { headers: { Authorization: `Bearer ${datos.token}`, 'Content-Type': 'application/json' } };
  const azar = Math.random();
  if (azar < 0.6) {
    const cat = CATEGORIAS[Math.floor(Math.random() * CATEGORIAS.length)];
    const r = http.get(`${BASE}/api/v1/productos?categoria=${cat}&size=20`, { ...cab, tags: { operacion: 'listar' } });
    check(r, { 'listar 200': (x) => x.status === 200 });
  } else if (azar < 0.8) {
    const r = http.get(`${BASE}/api/v1/productos/${1 + Math.floor(Math.random() * 5)}`, { ...cab, tags: { operacion: 'detalle' } });
    check(r, { 'detalle 200': (x) => x.status === 200 });
  } else {
    const cuerpo = {
      nombre: `k6 ${__VU}-${__ITER}-${Date.now()}`,
      categoria: CATEGORIAS[__ITER % CATEGORIAS.length],
      descripcion: 'Creado en prueba de rendimiento',
      estado: 'ACTIVO',
    };
    const r = http.post(`${BASE}/api/v1/productos`, JSON.stringify(cuerpo), { ...cab, tags: { operacion: 'crear' } });
    check(r, { 'crear 201': (x) => x.status === 201 });
  }
}
