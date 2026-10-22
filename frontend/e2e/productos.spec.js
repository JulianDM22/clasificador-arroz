/**
 * @file productos.spec.js
 * @description Pruebas de sistema del inventario de lotes por la interfaz (HU-02 a HU-05).
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-21
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { expect, test } from '@playwright/test';
import { buscar, crearProducto, entrar, unico } from './ayudas';

test.describe('HU-02 a HU-05 Lotes', () => {
  test('CA-02.1 / CA-03.2 registrar un lote (queda activo) y encontrarlo con el filtro', async ({ page }) => {
    await entrar(page);
    const nombre = unico('E2E Lote');
    await crearProducto(page, { nombre, categoria: 'Basmati', descripcion: 'Creado por Playwright' });
    await buscar(page, nombre);
    await expect(page.getByTestId('producto')).toHaveCount(1);
    await expect(page.getByTestId('producto').first()).toContainText('Basmati');
    await expect(page.getByTestId('producto').first()).toContainText('Activo');
  });

  test('CA-02.2 un nombre de 2 caracteres no se puede guardar', async ({ page }) => {
    await entrar(page);
    await page.getByTestId('boton-nuevo').click();
    await page.getByLabel('Nombre').fill('ab');
    await page.getByTestId('boton-guardar').click();
    await expect(page.getByText('El nombre debe tener al menos 3 caracteres')).toBeVisible();
    await expect(page).toHaveURL(/\/equipo\/lotes\/nuevo$/);
  });

  test('CA-02.5 un nombre repetido muestra el conflicto de la API', async ({ page }) => {
    await entrar(page);
    const nombre = unico('E2E Duplicado');
    await crearProducto(page, { nombre });
    await page.getByTestId('boton-nuevo').click();
    await page.getByLabel('Nombre').fill(nombre.toUpperCase());
    await page.getByTestId('select-categoria').click();
    await page.getByRole('option', { name: 'Arborio' }).click();
    await page.getByTestId('boton-guardar').click();
    await expect(page.getByTestId('error-formulario')).toContainText('Ya existe un producto');
  });

  test('CA-02.6 un nombre con HTML se muestra como texto y no se ejecuta', async ({ page }) => {
    let dialogos = 0;
    page.on('dialog', async (d) => { dialogos += 1; await d.dismiss(); });
    await entrar(page);
    const marca = unico('xss');
    const nombre = `<img src=x onerror=alert(1)> ${marca}`;
    await crearProducto(page, { nombre, descripcion: '<script>alert(2)</script>' });
    await buscar(page, marca);
    await expect(page.getByTestId('producto').first()).toContainText('<img src=x onerror=alert(1)>');
    expect(dialogos).toBe(0);
  });

  test('CA-04.1 editar un lote cambia sus datos', async ({ page }) => {
    await entrar(page);
    const nombre = unico('E2E Editar');
    await crearProducto(page, { nombre });
    await buscar(page, nombre);
    await page.getByTestId('producto').first().getByRole('button', { name: /^Editar/ }).click();
    await expect(page.getByLabel('Nombre')).toHaveValue(nombre);
    await page.getByLabel('Nombre').fill(`${nombre} editado`);
    await page.getByTestId('boton-guardar').click();
    await buscar(page, `${nombre} editado`);
  });

  test('CA-01.4 el operario no ve la opción de eliminar', async ({ page }) => {
    await entrar(page, 'operario');
    await expect(page.getByTestId('producto').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /^Eliminar/ })).toHaveCount(0);
  });

  test('CA-05.1 / CA-05.3 el administrador elimina tras confirmar', async ({ page }) => {
    await entrar(page, 'admin');
    const nombre = unico('E2E Eliminar');
    await crearProducto(page, { nombre });
    await buscar(page, nombre);
    await page.getByTestId('producto').first().getByRole('button', { name: /^Eliminar/ }).click();
    const dialogo = page.getByRole('dialog');
    await expect(dialogo).toContainText(nombre);
    await dialogo.getByTestId('confirmar-eliminar').click();
    await expect(page.getByText('Lote eliminado')).toBeVisible();
    await expect(page.getByTestId('sin-productos')).toBeVisible();
  });
});
