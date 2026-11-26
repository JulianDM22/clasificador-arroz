/**
 * @file panel.spec.js
 * @description Pruebas de sistema del panel del administrador (HU-10): estadísticas de uso de los
 *              modelos; un usuario sin rol de administrador no lo ve.
 * @fecha_creacion 2026-10-21
 * @actualizacion 2026-11-26
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 2.0.0
 */
import { expect, test } from '@playwright/test';
import { entrar } from './ayudas';

const numero = async (page, id) => Number((await page.getByTestId(id).textContent()).replace(/\./g, ''));

test.describe('HU-10 Panel del administrador', () => {
  test('CA-10.1 el administrador ve las cifras y las gráficas de uso', async ({ page }) => {
    await entrar(page, 'admin');
    await expect(page.getByTestId('cifra-clasificaciones')).toHaveText(/^[\d.]+$/);
    await expect(page.getByTestId('cifra-7dias')).toHaveText(/^[\d.]+$/);
    await expect(page.getByTestId('grafica-dias')).toBeVisible();
    await expect(page.getByTestId('grafica-variedades').getByLabel(/^Arborio: \d+$/)).toBeVisible();
  });

  test('CA-10.1 una clasificación pública aparece en las estadísticas', async ({ page }) => {
    await entrar(page, 'admin');
    const antes = await numero(page, 'cifra-clasificaciones');
    await page.goto('/');
    await page.getByRole('button', { name: 'Probar con la foto de ejemplo de un grano Ipsala' }).click();
    await expect(page.getByTestId('variedad')).toHaveText('Ipsala', { timeout: 60_000 });
    await page.getByTestId('nav-panel').click();
    // Otras pruebas clasifican en paralelo: se exige al menos una clasificación más.
    await expect.poll(() => numero(page, 'cifra-clasificaciones')).toBeGreaterThanOrEqual(antes + 1);
  });

  test('CA-10.1 un usuario sin rol de administrador no ve el panel y la ruta lo devuelve al inicio', async ({ page }) => {
    await entrar(page, 'operario');
    await expect(page.getByTestId('nav-panel')).toHaveCount(0);
    await page.goto('/equipo/panel');
    await expect(page.getByRole('heading', { name: '¿Qué variedad de arroz es?' })).toBeVisible();
  });
});
