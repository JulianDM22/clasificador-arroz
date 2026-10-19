/**
 * @file carga.js
 * @description Prueba de carga (criterio CA-09.1): 50 usuarios simultáneos durante 2 minutos.
 *              Aprueba si el percentil 95 del tiempo de respuesta es menor a 500 ms y la tasa de
 *              error menor a 1 %.
 *              Uso: docker run --rm -i -e BASE_URL=http://host.docker.internal:8080 -v %cd%/pruebas/carga:/scripts grafana/k6 run /scripts/carga.js
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { sleep } from 'k6';
import { iniciarSesion, usuarioTipico } from './comun.js';

export const options = {
  scenarios: {
    carga: {
      executor: 'ramping-vus',
      stages: [
        { duration: '20s', target: 50 },
        { duration: '1m30s', target: 50 },
        { duration: '10s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
};

export const setup = iniciarSesion;

export default function (datos) {
  usuarioTipico(datos);
  sleep(0.5 + Math.random()); // tiempo de lectura de un usuario real
}
