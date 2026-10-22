/**
 * @file captura-comparacion.mjs
 * @description Toma capturas de pantalla para la documentación: la página pública con el
 *              resultado de una foto de ejemplo y la comparación de los 5 modelos.
 *              Uso: node e2e/captura-comparacion.mjs <carpeta_destino> [variedad]
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-21
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 2.0.0
 */
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const URL = process.env.E2E_URL || 'http://localhost:8081';
const destino = process.argv[2] || '.';
const variedad = process.argv[3] || 'Jasmine';

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1280, height: 900 }, locale: 'es-CO', colorScheme: 'light' });
await pagina.addInitScript(() => localStorage.setItem('clasificador.idioma', 'es'));
await pagina.goto(URL);
await pagina.screenshot({ path: join(destino, 'pagina_publica.png') });

await pagina.getByRole('button', { name: `Probar con la foto de ejemplo de un grano ${variedad}` }).click();
await pagina.getByTestId('variedad').waitFor({ timeout: 60_000 });
await pagina.getByTestId('resultado-clasificacion').screenshot({ path: join(destino, 'resultado_clasificacion.png') });

await pagina.getByText(/Opciones avanzadas/).click();
await pagina.getByTestId('boton-comparar').click();
await pagina.getByTestId('tabla-comparacion').waitFor({ timeout: 60_000 });
await pagina.waitForTimeout(300);
await pagina.getByTestId('opciones-avanzadas').screenshot({ path: join(destino, 'comparacion_modelos.png') });
await navegador.close();
console.log('Capturas guardadas en', destino);
