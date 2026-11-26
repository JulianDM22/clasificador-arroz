/**
 * @file esquemas.test.js
 * @description Pruebas de la validación de la foto en el navegador: tipos permitidos y valores
 *              límite del tamaño (5 MB y 5 MB + 1 byte), con mensajes en el idioma activo.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-11-26
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 2.0.0
 */
import { describe, expect, it } from 'vitest';
import i18n from '../i18n';
import { TAMANO_MAXIMO, validarFoto } from './esquemas';

const t = i18n.t.bind(i18n);
const foto = (tipo, bytes = 10) => new File([new Uint8Array(bytes)], 'g', { type: tipo });

describe('validarFoto', () => {
  it.each(['image/jpeg', 'image/png'])('acepta %s', (tipo) => {
    expect(validarFoto(foto(tipo), t)).toBeNull();
  });

  it.each(['image/gif', 'text/plain', ''])('rechaza el tipo "%s"', (tipo) => {
    expect(validarFoto(foto(tipo), t)).toBe('La foto debe ser JPEG o PNG');
  });

  it('rechaza la ausencia de archivo', () => {
    expect(validarFoto(undefined, t)).toBe('La foto debe ser JPEG o PNG');
  });

  it.each([[TAMANO_MAXIMO, null], [TAMANO_MAXIMO + 1, 'La foto no puede superar 5 MB']])(
    'valor límite: %i bytes', (bytes, esperado) => {
      expect(validarFoto(foto('image/jpeg', bytes), t)).toBe(esperado);
    },
  );

  it('los mensajes salen en el idioma activo', async () => {
    await i18n.changeLanguage('en');
    expect(validarFoto(foto('image/gif'), i18n.t.bind(i18n))).toBe('The photo must be JPEG or PNG');
    await i18n.changeLanguage('es');
  });
});
