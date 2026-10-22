/**
 * @file PaginaInicio.test.jsx
 * @description Pruebas unitarias de la página pública de clasificación (HU-06): subir una foto o
 *              usar una de ejemplo, resultado con seguridad y descripción, validación de la foto,
 *              errores de la API, elegir modelo, comparar los 5 y registrar como lote (equipo).
 * @fecha_creacion 2026-10-21
 * @actualizacion 2026-10-21
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderizar } from '../pruebas/utilidades';
import PaginaInicio, { REINTENTO, conReintentos, esTemporal, nivelConfianza } from './PaginaInicio';
import * as servicios from '../api/servicios';

vi.mock('../api/servicios');

const CATALOGO = {
  modelo_por_defecto: 'resnet50v2', ensamble_disponible: true, es_prueba: false,
  modelos: [
    { id: 'resnet50v2', nombre: 'ResNet50V2', tipo: 'CNN', accuracy_test: 0.99911, params_M: 23.58, mb: 24.1, peso_ensamble: 0.33 },
    { id: 'deit_s', nombre: 'DeiT-S', tipo: 'Transformer', accuracy_test: 0.99563, params_M: 21.67, mb: 22.8, peso_ensamble: 0.09 },
  ],
};
const prediccion = (categoria, confianza, modelo = 'resnet50v2', nombre = 'ResNet50V2') => ({
  modelo, nombre, categoria, confianza, ms: 140,
  probabilidades: { ARBORIO: 0, BASMATI: 0, IPSALA: 0, JASMINE: 0, KARACADAG: 0, [categoria]: confianza },
});
const jpeg = () => new File([new Uint8Array([0xff, 0xd8, 0xff])], 'grano.jpg', { type: 'image/jpeg' });
const inicio = (rol = null) => renderizar(<PaginaInicio />, { rol });

describe('PaginaInicio', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:vista');
    globalThis.URL.revokeObjectURL = vi.fn();
    servicios.listarModelos.mockResolvedValue(CATALOGO);
    REINTENTO.esperaMs = 1;
  });

  afterEach(() => vi.unstubAllGlobals());

  it('explica para qué es la página y los 3 pasos', () => {
    inicio();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('¿Qué variedad de arroz es?');
    const pasos = within(screen.getByRole('list', { name: 'Cómo usarlo' })).getAllByRole('listitem');
    expect(pasos).toHaveLength(3);
    expect(pasos[0]).toHaveTextContent('Elige una foto');
  });

  it('CA-06.1 / CA-06.8 un visitante sin sesión sube una foto y ve la variedad, la seguridad y la descripción', async () => {
    servicios.clasificarFoto.mockResolvedValue(prediccion('BASMATI', 0.987));
    inicio();
    await waitFor(() => expect(servicios.listarModelos).toHaveBeenCalled());
    await userEvent.upload(screen.getByTestId('input-foto'), jpeg());

    expect(await screen.findByTestId('variedad')).toHaveTextContent('Basmati');
    expect(servicios.clasificarFoto).toHaveBeenCalledWith(expect.any(File), 'resnet50v2');
    expect(screen.getByTestId('seguridad')).toHaveTextContent('98,7% de seguridad');
    expect(screen.getByTestId('nivel-alto')).toHaveTextContent('El modelo está muy seguro.');
    expect(screen.getByTestId('resultado-clasificacion')).toHaveTextContent('India y Pakistán');
    expect(screen.getByRole('img', { name: 'Tu foto' })).toHaveAttribute('src', 'blob:vista');
    expect(screen.queryByTestId('boton-registrar')).toBeNull();
  });

  it('con una foto de ejemplo clasifica sin que el visitante tenga que subir nada', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ blob: () => Promise.resolve(new Blob(['x'], { type: 'image/jpeg' })) })));
    servicios.clasificarFoto.mockResolvedValue(prediccion('JASMINE', 0.99));
    inicio();
    await userEvent.click(screen.getByRole('button', { name: 'Probar con la foto de ejemplo de un grano Jasmine' }));

    expect(await screen.findByTestId('variedad')).toHaveTextContent('Jasmine');
    expect(fetch).toHaveBeenCalledWith('/muestras/jasmine.jpg');
    expect(servicios.clasificarFoto.mock.calls[0][0].name).toBe('jasmine.jpg');
  });

  it('con poca seguridad recomienda probar con otra foto', async () => {
    servicios.clasificarFoto.mockResolvedValue(prediccion('IPSALA', 0.45));
    inicio();
    await userEvent.upload(screen.getByTestId('input-foto'), jpeg());
    expect(await screen.findByTestId('nivel-bajo')).toHaveTextContent('Prueba con otra foto');
  });

  it('nivelConfianza: alto desde 90 %, medio desde 60 %, bajo por debajo', () => {
    expect(nivelConfianza(0.9)).toBe('alto');
    expect(nivelConfianza(0.8999)).toBe('medio');
    expect(nivelConfianza(0.6)).toBe('medio');
    expect(nivelConfianza(0.5999)).toBe('bajo');
  });

  it('CA-06.2 una foto que no es JPEG/PNG se rechaza sin llamar a la API', async () => {
    inicio();
    const gif = new File(['GIF89a'], 'grano.gif', { type: 'image/gif' });
    await userEvent.upload(screen.getByTestId('input-foto'), gif, { applyAccept: false });
    expect(await screen.findByTestId('error-clasificacion')).toHaveTextContent('La foto debe ser JPEG o PNG');
    expect(servicios.clasificarFoto).not.toHaveBeenCalled();
  });

  it('CA-06.3 una foto de más de 5 MB se rechaza sin llamar a la API', async () => {
    inicio();
    const grande = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'g.jpg', { type: 'image/jpeg' });
    await userEvent.upload(screen.getByTestId('input-foto'), grande);
    expect(await screen.findByTestId('error-clasificacion')).toHaveTextContent('La foto no puede superar 5 MB');
    expect(servicios.clasificarFoto).not.toHaveBeenCalled();
  });

  it('CA-06.4 si el servicio no está disponible muestra su mensaje y deja intentar de nuevo', async () => {
    servicios.clasificarFoto.mockRejectedValue({ response: { status: 503, data: { detail: 'El servicio de clasificación no está disponible' } } });
    inicio();
    await userEvent.upload(screen.getByTestId('input-foto'), jpeg());
    expect(await screen.findByTestId('error-clasificacion')).toHaveTextContent('no está disponible');
    expect(screen.getByTestId('input-foto')).toBeInTheDocument();
  });

  it('CA-06.9 al superar el límite de clasificaciones se muestra el mensaje de la API', async () => {
    servicios.clasificarFoto.mockRejectedValue({ response: { status: 429, data: { detail: 'Superó el límite de 20 clasificaciones por minuto' } } });
    inicio();
    await userEvent.upload(screen.getByTestId('input-foto'), jpeg());
    expect(await screen.findByTestId('error-clasificacion')).toHaveTextContent('Superó el límite');
  });

  it('si el servicio está dormido (503) reintenta solo y muestra el resultado cuando despierta', async () => {
    servicios.clasificarFoto
      .mockRejectedValueOnce({ response: { status: 503, data: {} } })
      .mockRejectedValueOnce({ response: { status: 502, data: {} } })
      .mockResolvedValueOnce(prediccion('IPSALA', 0.99));
    inicio();
    await userEvent.upload(screen.getByTestId('input-foto'), jpeg());
    expect(await screen.findByTestId('variedad')).toHaveTextContent('Ipsala');
    expect(servicios.clasificarFoto).toHaveBeenCalledTimes(3);
    expect(screen.queryByTestId('error-clasificacion')).toBeNull();
  });

  it('la lista de modelos se vuelve a pedir hasta que el servicio despierta, avisando que se está activando', async () => {
    let responder;
    servicios.listarModelos
      .mockRejectedValueOnce({ response: { status: 503, data: {} } })
      .mockReturnValueOnce(new Promise((r) => { responder = r; }));
    inicio();
    expect(await screen.findByTestId('activando')).toHaveTextContent('Activando el servicio de clasificación');
    responder(CATALOGO);
    await waitFor(() => expect(screen.queryByTestId('activando')).toBeNull());
    await userEvent.click(screen.getByText(/Opciones avanzadas/));
    expect(screen.getByTestId('select-modelo')).toHaveTextContent('ResNet50V2');
  });

  it('conReintentos no repite errores definitivos (400) y se rinde tras el máximo de intentos', async () => {
    const definitivo = vi.fn().mockRejectedValue({ response: { status: 400 } });
    await expect(conReintentos(definitivo)).rejects.toEqual({ response: { status: 400 } });
    expect(definitivo).toHaveBeenCalledTimes(1);

    const siempreCaido = vi.fn().mockRejectedValue({ response: { status: 503 } });
    const avisos = vi.fn();
    await expect(conReintentos(siempreCaido, avisos)).rejects.toEqual({ response: { status: 503 } });
    expect(siempreCaido).toHaveBeenCalledTimes(REINTENTO.intentos);
    expect(avisos).toHaveBeenCalledTimes(REINTENTO.intentos - 1);
  });

  it('esTemporal: sin respuesta, 502, 503 y 504 sí; 400, 413 y 429 no', () => {
    expect(esTemporal(new Error('sin red'))).toBe(true);
    for (const s of [502, 503, 504]) expect(esTemporal({ response: { status: s } })).toBe(true);
    for (const s of [400, 413, 429, 500]) expect(esTemporal({ response: { status: s } })).toBe(false);
  });

  it('"Clasificar otra foto" vuelve a mostrar la zona para subir', async () => {
    servicios.clasificarFoto.mockResolvedValue(prediccion('BASMATI', 0.99));
    inicio();
    await userEvent.upload(screen.getByTestId('input-foto'), jpeg());
    await userEvent.click(await screen.findByTestId('boton-otra'));
    expect(screen.queryByTestId('resultado-clasificacion')).toBeNull();
    expect(screen.getByTestId('zona-foto')).toBeInTheDocument();
  });

  it('CA-06.6 en opciones avanzadas se elige otro modelo y la misma foto se vuelve a clasificar', async () => {
    servicios.clasificarFoto
      .mockResolvedValueOnce(prediccion('BASMATI', 0.99))
      .mockResolvedValueOnce(prediccion('BASMATI', 0.97, 'deit_s', 'DeiT-S'));
    inicio();
    await userEvent.upload(screen.getByTestId('input-foto'), jpeg());
    await screen.findByTestId('variedad');

    await userEvent.click(screen.getByText(/Opciones avanzadas/));
    await userEvent.click(screen.getByRole('combobox', { name: /Modelo/ }));
    const opciones = await screen.findAllByRole('option');
    expect(opciones.map((o) => o.textContent)).toEqual([
      'ResNet50V2 · 99,91% (recomendado)', 'DeiT-S · 99,56%', 'Los 5 juntos (voto ponderado)',
    ]);
    await userEvent.click(opciones[1]);

    await waitFor(() => expect(servicios.clasificarFoto).toHaveBeenLastCalledWith(expect.any(File), 'deit_s'));
    expect(await screen.findByText(/Analizado con DeiT-S/)).toBeInTheDocument();
  });

  it('CA-06.7 comparar los 5 modelos muestra cada predicción, el ensamble y las métricas', async () => {
    servicios.clasificarFoto.mockResolvedValue(prediccion('BASMATI', 0.99));
    servicios.compararModelos.mockResolvedValue({
      modelos: [prediccion('BASMATI', 0.99), prediccion('JASMINE', 0.6, 'deit_s', 'DeiT-S')],
      ensamble: prediccion('BASMATI', 0.8, 'ensamble', 'Ensamble (5 modelos)'),
      consenso: false,
    });
    inicio();
    await userEvent.click(screen.getByText(/Opciones avanzadas/));
    expect(screen.getByTestId('boton-comparar')).toBeDisabled();
    expect(screen.getByTestId('metricas-modelos')).toHaveTextContent('ResNet50V2 · recomendado');

    await userEvent.upload(screen.getByTestId('input-foto'), jpeg());
    await screen.findByTestId('variedad');
    await userEvent.click(screen.getByTestId('boton-comparar'));

    const tabla = await screen.findByTestId('tabla-comparacion');
    expect(within(tabla).getAllByRole('row')).toHaveLength(4);
    expect(screen.getByTestId('fila-deit_s')).toHaveTextContent('Jasmine');
    expect(screen.getByTestId('fila-ensamble')).toHaveTextContent('Voto ponderado');
    expect(screen.getByTestId('consenso')).toHaveTextContent('Los modelos no coinciden');
  });

  it('si la comparación falla se muestra el error', async () => {
    servicios.clasificarFoto.mockResolvedValue(prediccion('BASMATI', 0.99));
    servicios.compararModelos.mockRejectedValue(new Error('sin red'));
    inicio();
    await userEvent.upload(screen.getByTestId('input-foto'), jpeg());
    await screen.findByTestId('variedad');
    await userEvent.click(screen.getByText(/Opciones avanzadas/));
    await userEvent.click(screen.getByTestId('boton-comparar'));
    expect(await screen.findByTestId('error-clasificacion')).toHaveTextContent('No se pudo conectar');
  });

  it('sin catálogo igual se puede clasificar con el modelo por defecto', async () => {
    servicios.listarModelos.mockRejectedValue(new Error('caído'));
    servicios.clasificarFoto.mockResolvedValue(prediccion('ARBORIO', 0.95));
    inicio();
    await userEvent.upload(screen.getByTestId('input-foto'), jpeg());
    expect(await screen.findByTestId('variedad')).toHaveTextContent('Arborio');
    expect(servicios.clasificarFoto).toHaveBeenCalledWith(expect.any(File), undefined);
  });

  it('avisa cuando los modelos cargados son de prueba', async () => {
    servicios.listarModelos.mockResolvedValue({ ...CATALOGO, es_prueba: true });
    inicio();
    expect(await screen.findByTestId('aviso-prueba')).toBeInTheDocument();
  });

  it('CA-06.5 con sesión del equipo, "Registrar como lote" abre el formulario con la variedad sugerida', async () => {
    servicios.clasificarFoto.mockResolvedValue(prediccion('KARACADAG', 0.93));
    inicio('USUARIO');
    await userEvent.upload(screen.getByTestId('input-foto'), jpeg());
    await userEvent.click(await screen.findByTestId('boton-registrar'));
    const destino = await screen.findByTestId('destino');
    expect(destino).toHaveTextContent('pantalla-nuevo-lote');
    expect(destino).toHaveTextContent('"categoria":"KARACADAG"');
    expect(destino).toHaveTextContent('"confianza":0.93');
  });
});
