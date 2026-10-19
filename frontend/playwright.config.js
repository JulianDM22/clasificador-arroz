/**
 * @file playwright.config.js
 * @description Configuración de las pruebas de sistema con Playwright contra la aplicación
 *              desplegada (por defecto, la de docker compose en el puerto 8081). Se ejecutan en
 *              escritorio y en un celular de 375 px de ancho.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/playwright-junit.xml' }]],
  use: {
    baseURL: process.env.E2E_URL || 'http://localhost:8081',
    locale: 'es-CO',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'] } },
    { name: 'celular-375', use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }, grep: /@celular/ },
  ],
});
