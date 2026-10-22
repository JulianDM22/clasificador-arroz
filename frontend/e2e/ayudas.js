/**
 * @file ayudas.js
 * @description Utilidades compartidas por las pruebas de sistema con Playwright: usuarios de
 *              prueba, foto sintética, nombres únicos, acceso del equipo y creación de lotes.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-21
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 2.0.0
 */
import { expect } from '@playwright/test';

export const USUARIOS = {
  admin: { usuario: 'admin', clave: process.env.E2E_ADMIN_PASSWORD || 'Admin123*' },
  operario: { usuario: 'operario', clave: process.env.E2E_USUARIO_PASSWORD || 'Operario123*' },
};

/** PNG válido de 2×2 píxeles (gris claro), suficiente para que el modelo lo procese. */
export const FOTO_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGP4//8/AxJgYGD4//8/AwMANuoH+X3eQ/cAAAAASUVORK5CYII=',
  'base64',
);

/** Nombre único para que las pruebas no choquen entre sí. */
export const unico = (base) => `${base} ${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

/**
 * Inicia sesión por el acceso del equipo y espera el inventario de lotes.
 * @param {import('@playwright/test').Page} page
 * @param {'admin'|'operario'} quien
 */
export async function entrar(page, quien = 'operario') {
  await page.goto('/equipo/entrar');
  await page.getByLabel('Usuario').fill(USUARIOS[quien].usuario);
  await page.getByLabel('Contraseña').fill(USUARIOS[quien].clave);
  await page.getByTestId('boton-entrar').click();
  await expect(page.getByRole('heading', { name: 'Lotes de arroz', level: 1 })).toBeVisible();
}

/**
 * Crea un lote desde el formulario.
 * @param {import('@playwright/test').Page} page
 * @param {{nombre: string, categoria?: string, descripcion?: string}} datos
 */
export async function crearProducto(page, { nombre, categoria = 'Ipsala', descripcion = '' }) {
  await page.getByTestId('boton-nuevo').click();
  await page.getByLabel('Nombre').fill(nombre);
  await page.getByTestId('select-categoria').click();
  await page.getByRole('option', { name: categoria }).click();
  if (descripcion) await page.getByLabel('Descripción').fill(descripcion);
  await page.getByTestId('boton-guardar').click();
  await expect(page.getByText('Lote guardado')).toBeVisible();
}

/**
 * Filtra el inventario por texto y espera a que aparezca el lote.
 * @param {import('@playwright/test').Page} page
 * @param {string} texto
 */
export async function buscar(page, texto) {
  await page.getByTestId('filtro-q').fill(texto);
  await expect(page.getByTestId('producto').first()).toContainText(texto);
}
