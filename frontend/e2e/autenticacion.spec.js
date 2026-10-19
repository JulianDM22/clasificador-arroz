/**
 * @file autenticacion.spec.js
 * @description Pruebas de sistema de la autenticación (HU-01) con Playwright.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { expect, test } from '@playwright/test';
import { entrar } from './ayudas';

test.describe('HU-01 Autenticación', () => {
  test('CA-01.1 el administrador inicia sesión y ve su rol', async ({ page }) => {
    await entrar(page, 'admin');
    await expect(page.getByTestId('usuario-actual')).toContainText('admin (ADMIN)');
  });

  test('CA-01.2 una contraseña incorrecta muestra un error genérico', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Usuario').fill('admin');
    await page.getByLabel('Contraseña').fill('incorrecta');
    await page.getByTestId('boton-entrar').click();
    await expect(page.getByTestId('error-login')).toHaveText('Usuario o contraseña incorrectos');
  });

  test('CA-01.3 sin sesión, una página protegida redirige al inicio de sesión', async ({ page }) => {
    await page.goto('/productos/nuevo');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('CA-01.5 con campos vacíos no se envía el formulario', async ({ page }) => {
    let peticiones = 0;
    page.on('request', (r) => { if (r.url().includes('/auth/login')) peticiones += 1; });
    await page.goto('/login');
    await page.getByTestId('boton-entrar').click();
    await expect(page.getByText('El usuario es obligatorio')).toBeVisible();
    await expect(page.getByText('La contraseña es obligatoria')).toBeVisible();
    expect(peticiones).toBe(0);
  });

  test('cerrar sesión borra la sesión y vuelve al inicio', async ({ page }) => {
    await entrar(page);
    await page.getByTestId('boton-salir').click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto('/productos');
    await expect(page).toHaveURL(/\/login$/);
  });
});
