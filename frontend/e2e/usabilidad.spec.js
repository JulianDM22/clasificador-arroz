/**
 * @file usabilidad.spec.js
 * @description Pruebas de sistema de idioma, tema, diseño responsive, teclado y accesibilidad
 *              con axe-core (HU-07, HU-08) en la página pública, el acceso y el panel del
 *              administrador. Las marcadas @celular también corren a 375 px.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-11-26
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 2.0.0
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
  test('CA-07.2 cambiar a inglés traduce la página pública y se recuerda al recargar', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('boton-idioma').click();
    await expect(page.getByRole('heading', { name: 'Which rice variety is it?', level: 1 })).toBeVisible();
    await expect(page.getByTestId('nav-equipo')).toHaveText('Admin access');
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Which rice variety is it?', level: 1 })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.getByTestId('boton-idioma').click();
    await expect(page.getByRole('heading', { name: '¿Qué variedad de arroz es?', level: 1 })).toBeVisible();
  });

  test('CA-07.2 el panel también se traduce', async ({ page }) => {
    await entrar(page);
    await page.getByTestId('boton-idioma').click();
    await expect(page.getByRole('heading', { name: 'Administrator dashboard', level: 1 })).toBeVisible();
    await page.getByTestId('boton-idioma').click();
  });
});

test.describe('HU-08 Interfaz usable y accesible', () => {
  test('CA-08.3 el tema oscuro cambia el fondo y se recuerda al recargar', async ({ page }) => {
    await page.goto('/');
    const fondo = () => page.evaluate(() => getComputedStyle(document.querySelector('#contenido').parentElement).backgroundColor);
    const inicial = await fondo();
    await page.getByTestId('boton-tema').click();
    const cambiado = await fondo();
    expect(cambiado).not.toBe(inicial);
    await page.reload();
    expect(await fondo()).toBe(cambiado);
    await page.getByTestId('boton-tema').click();
  });

  test('CA-08.2 página pública sin violaciones graves de accesibilidad, también con resultado @celular', async ({ page }) => {
    await page.goto('/');
    expect(await violacionesGraves(page)).toEqual([]);
    await page.getByRole('button', { name: 'Probar con la foto de ejemplo de un grano Basmati' }).click();
    await expect(page.getByTestId('variedad')).toBeVisible({ timeout: 60_000 });
    expect(await violacionesGraves(page)).toEqual([]);
  });

  test('CA-08.2 acceso del administrador sin violaciones graves de accesibilidad @celular', async ({ page }) => {
    await page.goto('/equipo/entrar');
    expect(await violacionesGraves(page)).toEqual([]);
  });

  test('CA-08.2 panel sin violaciones graves de accesibilidad @celular', async ({ page }) => {
    await entrar(page, 'admin');
    await expect(page.getByTestId('cifra-clasificaciones')).toBeVisible();
    // Un tooltip que se está abriendo tiene opacidad parcial y axe lo mide como bajo contraste.
    await page.mouse.move(0, 0);
    await expect(page.locator('.MuiTooltip-tooltip')).toHaveCount(0);
    expect(await violacionesGraves(page)).toEqual([]);
  });

  test('CA-08.1 sin desplazamiento horizontal en la página pública y el panel @celular', async ({ page }) => {
    await page.goto('/');
    expect(await sinDesplazamientoHorizontal(page)).toBe(true);
    await entrar(page);
    await expect(page.getByTestId('cifra-clasificaciones')).toBeVisible();
    expect(await sinDesplazamientoHorizontal(page)).toBe(true);
  });

  test('CA-08.4 el acceso del administrador se completa solo con teclado', async ({ page }) => {
    await page.goto('/equipo/entrar');
    await page.getByLabel('Usuario').focus();
    await page.keyboard.type('admin');
    await page.keyboard.press('Tab');
    await page.keyboard.type(process.env.E2E_ADMIN_PASSWORD || 'Admin123*');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Panel del administrador', level: 1 })).toBeVisible();
  });

  test('CA-08.4 una foto de ejemplo se clasifica solo con teclado', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Probar con la foto de ejemplo de un grano Ipsala' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('variedad')).toHaveText('Ipsala', { timeout: 60_000 });
  });

  test('CA-08.4 el enlace "Saltar al contenido" lleva al contenido principal', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const enlace = page.getByRole('link', { name: 'Saltar al contenido principal' });
    await expect(enlace).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main#contenido')).toBeFocused();
  });
});
