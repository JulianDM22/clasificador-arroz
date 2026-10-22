/**
 * @file clasificacion.spec.js
 * @description Pruebas de sistema de la página pública de clasificación (HU-06) con los modelos
 *              reales: un visitante sin cuenta clasifica una foto de ejemplo o propia, elige el
 *              modelo, compara los 5, y un integrante del equipo registra el resultado como lote.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-21
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 2.0.0
 */
import { expect, test } from '@playwright/test';
import { FOTO_PNG, buscar, entrar, unico } from './ayudas';

test.describe('HU-06 Clasificación pública', () => {
  test('CA-06.8 / CA-06.1 un visitante sin cuenta clasifica una foto de ejemplo y ve la variedad', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('nav-equipo')).toBeVisible();
    await page.getByRole('button', { name: 'Probar con la foto de ejemplo de un grano Basmati' }).click();
    await expect(page.getByTestId('variedad')).toHaveText('Basmati', { timeout: 60_000 });
    await expect(page.getByTestId('seguridad')).toContainText('de seguridad');
    await expect(page.getByTestId('resultado-clasificacion')).toContainText('India y Pakistán');
    await expect(page.getByTestId('boton-registrar')).toHaveCount(0);
  });

  test('CA-06.1 subir una foto propia muestra un resultado y se puede clasificar otra', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('input-foto').setInputFiles({ name: 'grano.png', mimeType: 'image/png', buffer: FOTO_PNG });
    await expect(page.getByTestId('resultado-clasificacion')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole('img', { name: 'Tu foto' })).toBeVisible();
    await page.getByTestId('boton-otra').click();
    await expect(page.getByTestId('zona-foto')).toBeVisible();
  });

  test('CA-06.2 un archivo que no es imagen se rechaza en la interfaz', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('input-foto').setInputFiles({ name: 'notas.txt', mimeType: 'text/plain', buffer: Buffer.from('hola') });
    await expect(page.getByTestId('error-clasificacion')).toHaveText('La foto debe ser JPEG o PNG');
  });

  test('CA-06.6 clasificar con el modelo que elige el visitante', async ({ page }) => {
    await page.goto('/');
    await page.getByText(/Opciones avanzadas/).click();
    await expect(page.getByTestId('select-modelo')).toContainText('ResNet50V2');
    await page.getByTestId('select-modelo').click();
    await expect(page.getByRole('option')).toHaveCount(6); // 5 modelos + los 5 juntos
    await page.getByRole('option', { name: /DeiT-S/ }).click();
    await page.getByRole('button', { name: 'Probar con la foto de ejemplo de un grano Arborio' }).click();
    await expect(page.getByTestId('variedad')).toHaveText('Arborio', { timeout: 60_000 });
    await expect(page.getByTestId('resultado-clasificacion')).toContainText('Analizado con DeiT-S');
  });

  test('CA-06.7 comparar los 5 modelos con la misma foto y ver sus métricas', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Probar con la foto de ejemplo de un grano Jasmine' }).click();
    await expect(page.getByTestId('variedad')).toHaveText('Jasmine', { timeout: 60_000 });
    await page.getByText(/Opciones avanzadas/).click();
    await page.getByTestId('boton-comparar').click();
    const tabla = page.getByTestId('tabla-comparacion');
    await expect(tabla.getByRole('row')).toHaveCount(7, { timeout: 60_000 }); // encabezado + 5 modelos + ensamble
    for (const id of ['cnn_propia', 'efficientnetb0', 'resnet50v2', 'vit_b16', 'deit_s']) {
      await expect(page.getByTestId(`fila-${id}`)).toContainText('Jasmine');
    }
    await expect(page.getByTestId('consenso')).toHaveText('Todos los modelos coinciden');
    await expect(page.getByTestId('metricas-modelos').getByRole('row')).toHaveCount(6);
  });

  test('CA-06.5 un operario clasifica y registra el resultado como lote con la variedad sugerida', async ({ page }) => {
    await entrar(page);
    await page.getByTestId('nav-clasificar').click();
    await page.getByRole('button', { name: 'Probar con la foto de ejemplo de un grano Karacadag' }).click();
    await expect(page.getByTestId('variedad')).toHaveText('Karacadag', { timeout: 60_000 });
    await page.getByTestId('boton-registrar').click();

    await expect(page.getByTestId('variedad-sugerida')).toContainText('Variedad sugerida por la foto: Karacadag');
    await expect(page.getByTestId('select-categoria')).toContainText('Karacadag');
    const nombre = unico('E2E Foto');
    await page.getByLabel('Nombre').fill(nombre);
    await page.getByTestId('boton-guardar').click();
    await buscar(page, nombre);
    await expect(page.getByTestId('producto').first()).toContainText('Karacadag');
    await expect(page.getByTestId('producto').first()).toContainText('Activo');
  });
});
