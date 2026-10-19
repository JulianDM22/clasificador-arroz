/**
 * @file esquemas.test.js
 * @description Pruebas unitarias y de valores límite de los esquemas Yup (CA-02.2 a CA-02.4,
 *              CA-06.2, CA-06.3).
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { describe, expect, it } from 'vitest';
import i18n from '../i18n';
import { LIMITES, esquemaLogin, esquemaProducto, validarFoto } from './esquemas';

const t = i18n.t.bind(i18n);
const valido = { nombre: 'Lote', categoria: 'BASMATI', descripcion: '', estado: 'ACTIVO' };
const esValido = (datos) => esquemaProducto(t).isValid({ ...valido, ...datos });

describe('esquemaProducto', () => {
  it.each([
    [2, false], [3, true], [100, true], [101, false],
  ])('CA-02.2 nombre de %i caracteres → válido=%s', async (n, esperado) => {
    expect(await esValido({ nombre: 'a'.repeat(n) })).toBe(esperado);
  });

  it('CA-02.2 un nombre solo con espacios no es válido', async () => {
    expect(await esValido({ nombre: '     ' })).toBe(false);
  });

  it.each([[500, true], [501, false]])('CA-02.3 descripción de %i caracteres → válido=%s', async (n, esperado) => {
    expect(await esValido({ descripcion: 'd'.repeat(n) })).toBe(esperado);
  });

  it('CA-02.4 categoría y estado deben ser valores permitidos', async () => {
    expect(await esValido({ categoria: '' })).toBe(false);
    expect(await esValido({ categoria: 'INTEGRAL' })).toBe(false);
    expect(await esValido({ estado: 'BORRADO' })).toBe(false);
  });

  it('CA-07.2 los mensajes salen en el idioma activo', async () => {
    await i18n.changeLanguage('en');
    await expect(esquemaProducto(i18n.t.bind(i18n)).validateAt('nombre', { nombre: '' }))
      .rejects.toThrow('Name is required');
    await i18n.changeLanguage('es');
  });
});

describe('esquemaLogin', () => {
  it('CA-01.5 usuario y contraseña son obligatorios', async () => {
    await expect(esquemaLogin(t).validate({ username: ' ', password: '' }, { abortEarly: false }))
      .rejects.toMatchObject({ errors: ['El usuario es obligatorio', 'La contraseña es obligatoria'] });
  });
});

describe('validarFoto', () => {
  const archivo = (tipo, bytes) => ({ type: tipo, size: bytes });

  it('CA-06.2 acepta JPEG y PNG y rechaza otros tipos', () => {
    expect(validarFoto(archivo('image/jpeg', 100), t)).toBeNull();
    expect(validarFoto(archivo('image/png', 100), t)).toBeNull();
    expect(validarFoto(archivo('image/gif', 100), t)).toBe('La foto debe ser JPEG o PNG');
    expect(validarFoto(undefined, t)).toBe('La foto debe ser JPEG o PNG');
  });

  it('CA-06.3 límite de 5 MB: exacto se acepta, un byte más no', () => {
    expect(validarFoto(archivo('image/jpeg', LIMITES.archivoBytes), t)).toBeNull();
    expect(validarFoto(archivo('image/jpeg', LIMITES.archivoBytes + 1), t)).toBe('La foto no puede superar 5 MB');
  });
});
