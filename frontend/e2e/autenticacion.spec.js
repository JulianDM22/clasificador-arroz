/**
 * @file autenticacion.spec.js
 * @description Pruebas de sistema del acceso del equipo (HU-01): inicio de sesión, error
 *              genérico, páginas protegidas, campos vacíos y cierre de sesión.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-21
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 2.0.0
 */
import { expect, test } from '@playwright/test';
import { entrar } from './ayudas';

test.describe('HU-01 Acceso del equipo', () => {
  test('CA-01.1 el administrador inicia sesión y ve su rol', async ({ page }) => {
    await entrar(page, 'admin');
    await expect(page.getByTestId('usuario-actual')).toContainText('admin · Administrador');
  });

  test('CA-01.2 una contraseña incorrecta muestra un error genérico', async ({ page }) => {
    await page.goto('/equipo/entrar');
    await page.getByLabel('Usuario').fill('admin');
    await page.getByLabel('Contraseña').fill('incorrecta');
    await page.getByTestId('boton-entrar').click();
    await expect(page.getByTestId('error-login')).toHaveText('Usuario o contraseña incorrectos');
  });

  test('CA-01.3 sin sesión, una página del equipo redirige al acceso del equipo', async ({ page }) => {
    await page.goto('/equipo/lotes/nuevo');
    await expect(page).toHaveURL(/\/equipo\/entrar$/);
    await page.goto('/equipo/panel');
    await expect(page).toHaveURL(/\/equipo\/entrar$/);
  });

  test('CA-01.5 con campos vacíos no se envía el formulario', async ({ page }) => {
    let peticiones = 0;
    page.on('request', (r) => { if (r.url().includes('/auth/login')) peticiones += 1; });
    await page.goto('/equipo/entrar');
    await page.getByTestId('boton-entrar').click();
    await expect(page.getByText('El usuario es obligatorio')).toBeVisible();
    await expect(page.getByText('La contraseña es obligatoria')).toBeVisible();
    expect(peticiones).toBe(0);
  });

  test('desde el acceso del equipo se puede volver a clasificar', async ({ page }) => {
    await page.goto('/equipo/entrar');
    await page.getByTestId('volver-inicio').click();
    await expect(page.getByRole('heading', { name: '¿Qué variedad de arroz es?' })).toBeVisible();
  });

  test('cerrar sesión borra la sesión y vuelve a la página pública', async ({ page }) => {
    await entrar(page);
    await page.getByTestId('boton-salir').click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId('nav-equipo')).toBeVisible();
    await page.goto('/equipo/lotes');
    await expect(page).toHaveURL(/\/equipo\/entrar$/);
  });
});
