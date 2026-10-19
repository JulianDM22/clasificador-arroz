/**
 * @file pico.js
 * @description Prueba de pico: el tráfico salta de 10 a 250 usuarios en 10 segundos (como al
 *              abrir la jornada de una cooperativa) y vuelve a bajar. Verifica que el sistema
 *              no se caiga y que se recupere: la tasa de error debe quedar por debajo de 5 %.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { sleep } from 'k6';
import { iniciarSesion, usuarioTipico } from './comun.js';

export const options = {
  scenarios: {
    pico: {
      executor: 'ramping-vus',
      stages: [
        { duration: '20s', target: 10 },
        { duration: '10s', target: 250 },
        { duration: '30s', target: 250 },
        { duration: '10s', target: 10 },
        { duration: '30s', target: 10 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
  },
};

export const setup = iniciarSesion;

export default function (datos) {
  usuarioTipico(datos);
  sleep(0.5 + Math.random());
}
