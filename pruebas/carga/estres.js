/**
 * @file estres.js
 * @description Prueba de estrés: sube por escalones de 50 a 300 usuarios simultáneos para
 *              encontrar el punto en que el sistema deja de cumplir el objetivo de rendimiento
 *              (p95 < 500 ms). Los umbrales no detienen la prueba: el objetivo es observar
 *              hasta dónde llega, no aprobar o reprobar.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { sleep } from 'k6';
import { iniciarSesion, usuarioTipico } from './comun.js';

export const options = {
  scenarios: {
    estres: {
      executor: 'ramping-vus',
      stages: [
        { duration: '30s', target: 50 },
        { duration: '45s', target: 50 },
        { duration: '30s', target: 100 },
        { duration: '45s', target: 100 },
        { duration: '30s', target: 200 },
        { duration: '45s', target: 200 },
        { duration: '30s', target: 300 },
        { duration: '45s', target: 300 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    'http_req_duration': [{ threshold: 'p(95)<500', abortOnFail: false }],
    'http_req_failed': [{ threshold: 'rate<0.05', abortOnFail: false }],
  },
};

export const setup = iniciarSesion;

export default function (datos) {
  usuarioTipico(datos);
  sleep(0.5 + Math.random());
}
