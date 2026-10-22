/**
 * @file panel.spec.js
 * @description Pruebas de sistema de lo que solo hace el administrador (HU-10): ver el panel de
 *              estadísticas y activar o desactivar lotes; el operario no puede.
 * @fecha_creacion 2026-10-21
 * @actualizacion 2026-10-21
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { expect, test } from '@playwright/test';
import { buscar, crearProducto, entrar, unico } from './ayudas';

test.describe('HU-10 Administración', () => {
  test('CA-10.1 el administrador ve el panel con las cifras y las gráficas', async ({ page }) => {
    await entrar(page, 'admin');
    await page.getByTestId('nav-panel').click();
    await expect(page.getByRole('heading', { name: 'Panel del administrador' })).toBeVisible();
    await expect(page.getByTestId('cifra-lotes')).toHaveText(/^[\d.]+$/);
    await expect(page.getByTestId('cifra-clasificaciones')).toHaveText(/^[\d.]+$/);
    await expect(page.getByTestId('grafica-dias')).toBeVisible();
    await expect(page.getByTestId('grafica-lotes').getByLabel(/^Arborio: \d+$/)).toBeVisible();
  });

  test('CA-10.1 una clasificación pública aparece en las estadísticas', async ({ page }) => {
    await entrar(page, 'admin');
    await page.getByTestId('nav-panel').click();
    const antes = Number((await page.getByTestId('cifra-clasificaciones').textContent()).replace(/\./g, ''));
    await page.getByTestId('nav-clasificar').click();
    await page.getByRole('button', { name: 'Probar con la foto de ejemplo de un grano Ipsala' }).click();
    await expect(page.getByTestId('variedad')).toHaveText('Ipsala', { timeout: 60_000 });
    await page.getByTestId('nav-panel').click();
    // Otras pruebas clasifican en paralelo: se exige al menos una clasificación más.
    await expect.poll(async () => Number((await page.getByTestId('cifra-clasificaciones').textContent()).replace(/\./g, '')))
      .toBeGreaterThanOrEqual(antes + 1);
  });

  test('CA-10.1 el operario no tiene panel: el enlace no aparece y la ruta lo devuelve a los lotes', async ({ page }) => {
    await entrar(page, 'operario');
    await expect(page.getByTestId('nav-panel')).toHaveCount(0);
    await page.goto('/equipo/panel');
    await expect(page).toHaveURL(/\/equipo\/lotes$/);
  });

  test('CA-10.2 el administrador desactiva y vuelve a activar un lote', async ({ page }) => {
    await entrar(page, 'admin');
    const nombre = unico('E2E Estado');
    await crearProducto(page, { nombre });
    await buscar(page, nombre);
    const fila = page.getByTestId('producto').first();
    const interruptor = fila.getByRole('checkbox', { name: `Lote ${nombre} activo` });
    await expect(interruptor).toBeChecked();
    await interruptor.click();
    await expect(page.getByText('Lote desactivado')).toBeVisible();
    await expect(fila).toContainText('Inactivo');
    await interruptor.click();
    await expect(page.getByText('Lote activado')).toBeVisible();
    await expect(interruptor).toBeChecked();
  });

  test('CA-10.2 el operario no ve el interruptor de estado', async ({ page }) => {
    await entrar(page, 'operario');
    await expect(page.getByTestId('producto').first()).toBeVisible();
    await expect(page.getByRole('checkbox')).toHaveCount(0);
    await expect(page.getByTestId('explicacion-rol')).toContainText('Como operario');
  });
});
