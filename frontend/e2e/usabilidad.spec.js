/**
 * @file usabilidad.spec.js
 * @description Pruebas de sistema de idioma, tema, diseño responsive, teclado y accesibilidad
 *              con axe-core (HU-07, HU-08). Las marcadas @celular también corren a 375 px.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { entrar } from './ayudas';

/** Violaciones de axe de impacto serio o crítico (CA-08.2). */
async function violacionesGraves(page) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  return r.violations.filter((v) => ['serious', 'critical'].includes(v.impact))
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

async function sinDesplazamientoHorizontal(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
}

test.describe('HU-07 Idioma', () => {
  test('CA-07.2 cambiar a inglés traduce la interfaz y se recuerda al recargar', async ({ page }) => {
    await entrar(page);
    await page.getByTestId('boton-idioma').click();
    await expect(page.getByRole('heading', { name: 'Products', level: 1 })).toBeVisible();
    await expect(page.getByTestId('boton-nuevo')).toHaveText('New product');
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Products', level: 1 })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.getByTestId('boton-idioma').click();
    await expect(page.getByRole('heading', { name: 'Productos', level: 1 })).toBeVisible();
  });
});

test.describe('HU-08 Interfaz usable y accesible', () => {
  test('CA-08.3 el tema oscuro cambia el fondo y se recuerda al recargar', async ({ page }) => {
    await entrar(page);
    const fondo = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const claro = await fondo();
    await page.getByTestId('boton-tema').click();
    const oscuro = await fondo();
    expect(oscuro).not.toBe(claro);
    await page.reload();
    expect(await fondo()).toBe(oscuro);
    await page.getByTestId('boton-tema').click();
  });

  test('CA-08.2 inicio de sesión sin violaciones graves de accesibilidad @celular', async ({ page }) => {
    await page.goto('/login');
    expect(await violacionesGraves(page)).toEqual([]);
  });

  test('CA-08.2 listado y formulario sin violaciones graves de accesibilidad @celular', async ({ page }) => {
    await entrar(page);
    expect(await violacionesGraves(page)).toEqual([]);
    await page.getByTestId('boton-nuevo').click();
    await expect(page.getByLabel('Nombre')).toBeVisible();
    expect(await violacionesGraves(page)).toEqual([]);
  });

  test('CA-08.1 sin desplazamiento horizontal y con acciones disponibles @celular', async ({ page }) => {
    await entrar(page);
    expect(await sinDesplazamientoHorizontal(page)).toBe(true);
    await expect(page.getByTestId('boton-nuevo')).toBeVisible();
    await page.getByTestId('boton-nuevo').click();
    await expect(page.getByTestId('boton-guardar')).toBeVisible();
    expect(await sinDesplazamientoHorizontal(page)).toBe(true);
  });

  test('CA-08.4 el inicio de sesión se completa solo con teclado', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Usuario').focus();
    await page.keyboard.type('operario');
    await page.keyboard.press('Tab');
    await page.keyboard.type('Operario123*');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Productos', level: 1 })).toBeVisible();
  });

  test('CA-08.4 el enlace "Saltar al contenido" lleva al contenido principal', async ({ page }) => {
    await entrar(page);
    await page.keyboard.press('Tab');
    const enlace = page.getByRole('link', { name: 'Saltar al contenido principal' });
    await expect(enlace).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main#contenido')).toBeFocused();
  });
});
