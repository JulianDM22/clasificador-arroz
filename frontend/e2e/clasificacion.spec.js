/**
 * @file clasificacion.spec.js
 * @description Pruebas de sistema de la clasificación por foto (HU-06): la sugerencia del modelo
 *              se precarga en el formulario y el usuario puede cambiarla.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { expect, test } from '@playwright/test';
import { FOTO_PNG, buscar, entrar, unico } from './ayudas';

test.describe('HU-06 Clasificación por foto', () => {
  test('CA-06.1 / CA-06.5 la foto sugiere la categoría y se guarda con el producto', async ({ page }) => {
    await entrar(page);
    await page.getByTestId('boton-nuevo').click();
    await page.getByTestId('input-foto').setInputFiles({ name: 'grano.png', mimeType: 'image/png', buffer: FOTO_PNG });

    const resultado = page.getByTestId('resultado-clasificacion');
    await expect(resultado).toBeVisible();
    const sugerida = (await resultado.textContent()).match(/Sugerencia: (\w+)/)[1];
    await expect(page.getByTestId('select-categoria')).toContainText(sugerida);
    await expect(page.getByRole('img', { name: 'Vista previa de la foto seleccionada' })).toBeVisible();

    const nombre = unico('E2E Foto');
    await page.getByLabel('Nombre').fill(nombre);
    await page.getByTestId('boton-guardar').click();
    await buscar(page, nombre);
    await expect(page.getByTestId('producto').first()).toContainText(sugerida);
  });

  test('CA-06.5 el usuario puede cambiar la categoría sugerida', async ({ page }) => {
    await entrar(page);
    await page.getByTestId('boton-nuevo').click();
    await page.getByTestId('input-foto').setInputFiles({ name: 'grano.png', mimeType: 'image/png', buffer: FOTO_PNG });
    await expect(page.getByTestId('resultado-clasificacion')).toBeVisible();
    await page.getByTestId('select-categoria').click();
    await page.getByRole('option', { name: 'Karacadag' }).click();
    await expect(page.getByTestId('select-categoria')).toContainText('Karacadag');
  });

  test('CA-06.6 clasificar con el modelo que elige el usuario', async ({ page }) => {
    await entrar(page);
    await page.getByTestId('boton-nuevo').click();
    await expect(page.getByTestId('select-modelo')).toContainText('ResNet50V2');
    await page.getByTestId('select-modelo').click();
    await expect(page.getByRole('option')).toHaveCount(6); // 5 modelos + ensamble
    await page.getByRole('option', { name: /DeiT-S/ }).click();
    await page.getByTestId('input-foto').setInputFiles({ name: 'grano.png', mimeType: 'image/png', buffer: FOTO_PNG });
    await expect(page.getByTestId('resultado-clasificacion')).toContainText('Modelo: DeiT-S');
  });

  test('CA-06.7 comparar los 5 modelos y ver sus métricas', async ({ page }) => {
    await entrar(page);
    await page.getByTestId('boton-nuevo').click();
    await page.getByTestId('modo-comparar').click();
    await page.getByTestId('input-foto').setInputFiles({ name: 'grano.png', mimeType: 'image/png', buffer: FOTO_PNG });
    const tabla = page.getByTestId('tabla-comparacion');
    await expect(tabla.getByRole('row')).toHaveCount(7); // encabezado + 5 modelos + ensamble
    for (const id of ['cnn_propia', 'efficientnetb0', 'resnet50v2', 'vit_b16', 'deit_s']) {
      await expect(page.getByTestId(`fila-${id}`)).toBeVisible();
    }
    await expect(page.getByTestId('fila-ensamble')).toBeVisible();
    await expect(page.getByTestId('consenso')).toBeVisible();
    // La categoría se completa con el modelo de referencia (ResNet50V2).
    const sugerida = await page.getByTestId('fila-resnet50v2').getByRole('cell').nth(2).textContent();
    await expect(page.getByTestId('select-categoria')).toContainText(sugerida);

    await page.getByTestId('metricas-modelos').getByText('Métricas de los modelos').click();
    await expect(page.getByTestId('metricas-modelos').getByRole('row')).toHaveCount(6);
  });

  test('CA-06.2 un archivo que no es imagen se rechaza en la interfaz', async ({ page }) => {
    await entrar(page);
    await page.getByTestId('boton-nuevo').click();
    await page.getByTestId('input-foto').setInputFiles({ name: 'notas.txt', mimeType: 'text/plain', buffer: Buffer.from('hola') });
    await expect(page.getByTestId('error-clasificacion')).toHaveText('La foto debe ser JPEG o PNG');
  });
});
