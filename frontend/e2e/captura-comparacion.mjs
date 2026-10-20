/**
 * @file captura-comparacion.mjs
 * @description Toma una captura de pantalla del modo "Comparar los 5 modelos" para la
 *              documentación. Uso: node e2e/captura-comparacion.mjs <archivo.png> [foto.jpg]
 *              Sin foto usa la imagen sintética de las pruebas.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-20
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.1.0
 */
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { chromium } from '@playwright/test';
import { FOTO_PNG } from './ayudas.js';

const URL = process.env.E2E_URL || 'http://localhost:8081';
const salida = process.argv[2] || 'comparacion.png';
const foto = process.argv[3]
  ? { name: basename(process.argv[3]), mimeType: 'image/jpeg', buffer: readFileSync(process.argv[3]) }
  : { name: 'grano.png', mimeType: 'image/png', buffer: FOTO_PNG };

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1280, height: 1100 }, locale: 'es-CO' });
await pagina.goto(`${URL}/login`);
await pagina.getByLabel('Usuario').fill('operario');
await pagina.getByLabel('Contraseña').fill(process.env.E2E_USUARIO_PASSWORD || 'Operario123*');
await pagina.getByTestId('boton-entrar').click();
await pagina.getByTestId('boton-nuevo').click();
await pagina.getByTestId('modo-comparar').click();
await pagina.getByTestId('input-foto').setInputFiles(foto);
await pagina.getByTestId('tabla-comparacion').waitFor();
await pagina.getByTestId('metricas-modelos').getByText('Métricas de los modelos').click();
await pagina.waitForTimeout(500);
await pagina.locator('section[aria-labelledby="clasificador-titulo"]').screenshot({ path: salida });
await navegador.close();
console.log('Captura guardada en', salida);
