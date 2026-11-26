/**
 * @file ayudas.js
 * @description Utilidades compartidas por las pruebas de sistema con Playwright: usuarios de
 *              prueba, foto sintética y acceso del administrador.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-11-26
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 3.0.0
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

/**
 * Inicia sesión por el acceso del administrador.
 * @param {import('@playwright/test').Page} page
 * @param {'admin'|'operario'} quien el administrador llega al panel; un usuario sin ese rol, a la página principal
 */
export async function entrar(page, quien = 'admin') {
  await page.goto('/equipo/entrar');
  await page.getByLabel('Usuario').fill(USUARIOS[quien].usuario);
  await page.getByLabel('Contraseña').fill(USUARIOS[quien].clave);
  await page.getByTestId('boton-entrar').click();
  const destino = quien === 'admin' ? 'Panel del administrador' : '¿Qué variedad de arroz es?';
  await expect(page.getByRole('heading', { name: destino, level: 1 })).toBeVisible();
}
