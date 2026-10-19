/**
 * @file ClasificadorFoto.test.jsx
 * @description Pruebas del clasificador por foto: elegir el modelo (o el ensamble), comparar los
 *              5 modelos, métricas de cada uno y categoría sugerida (CA-06.5 a CA-06.7).
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClasificadorFoto from './ClasificadorFoto';
import * as servicios from '../api/servicios';

vi.mock('../api/servicios');

const MODELOS = [
  { id: 'cnn_propia', nombre: 'CNN propia', tipo: 'CNN', accuracy_test: 0.99081, f1_test: 0.99085, params_M: 0.39, mb: 0.8, peso_ensamble: 0.04 },
  { id: 'efficientnetb0', nombre: 'EfficientNetB0', tipo: 'CNN', accuracy_test: 0.99866, f1_test: 0.99867, params_M: 4.06, mb: 8, peso_ensamble: 0.23 },
  { id: 'resnet50v2', nombre: 'ResNet50V2', tipo: 'CNN', accuracy_test: 0.99911, f1_test: 0.99911, params_M: 23.58, mb: 47, peso_ensamble: 0.33 },
  { id: 'vit_b16', nombre: 'ViT-B/16', tipo: 'Transformer', accuracy_test: 0.99804, f1_test: 0.99805, params_M: 85.8, mb: 86, peso_ensamble: 0.31 },
  { id: 'deit_s', nombre: 'DeiT-S', tipo: 'Transformer', accuracy_test: 0.99563, f1_test: 0.99563, params_M: 21.67, mb: 43, peso_ensamble: 0.09 },
];
const CATALOGO = { modelo_por_defecto: 'resnet50v2', ensamble_disponible: true, es_prueba: false, modelos: MODELOS };

const pred = (modelo, nombre, categoria, confianza = 0.9) => ({
  modelo, nombre, categoria, confianza, ms: 12.3, probabilidades: { ARBORIO: 0.02, BASMATI: 0.02, IPSALA: 0.02, JASMINE: 0.02, KARACADAG: 0.02, [categoria]: confianza },
});
const COMPARACION = {
  modelos: [
    pred('cnn_propia', 'CNN propia', 'JASMINE', 0.6),
    pred('efficientnetb0', 'EfficientNetB0', 'ARBORIO'),
    pred('resnet50v2', 'ResNet50V2', 'ARBORIO', 0.99),
    pred('vit_b16', 'ViT-B/16', 'ARBORIO'),
    pred('deit_s', 'DeiT-S', 'ARBORIO'),
  ],
  ensamble: pred('ensamble', 'Ensamble (5 modelos)', 'ARBORIO', 0.95),
  consenso: false,
};
const foto = () => new File([new Uint8Array([0xff, 0xd8, 0xff])], 'grano.jpg', { type: 'image/jpeg' });

async function preparar() {
  const alSugerir = vi.fn();
  render(<ClasificadorFoto alSugerir={alSugerir} />);
  await waitFor(() => expect(screen.getByTestId('select-modelo')).toHaveTextContent('ResNet50V2'));
  return alSugerir;
}

describe('ClasificadorFoto', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:vista');
    globalThis.URL.revokeObjectURL = vi.fn();
    servicios.listarModelos.mockResolvedValue(CATALOGO);
  });

  it('CA-06.6 por defecto usa el modelo recomendado (ResNet50V2)', async () => {
    servicios.clasificarFoto.mockResolvedValue(pred('resnet50v2', 'ResNet50V2', 'BASMATI'));
    const alSugerir = await preparar();
    await userEvent.upload(screen.getByTestId('input-foto'), foto());
    expect(await screen.findByTestId('resultado-clasificacion')).toHaveTextContent('Modelo: ResNet50V2');
    expect(servicios.clasificarFoto).toHaveBeenCalledWith(expect.any(File), 'resnet50v2');
    expect(alSugerir).toHaveBeenCalledWith('BASMATI');
  });

  it('CA-06.6 el selector ofrece los 5 modelos con su exactitud y el ensamble', async () => {
    await preparar();
    await userEvent.click(screen.getByRole('combobox', { name: 'Modelo' }));
    const opciones = await screen.findAllByRole('option');
    expect(opciones.map((o) => o.textContent)).toEqual([
      'CNN propia · 99.08 %', 'EfficientNetB0 · 99.87 %', 'ResNet50V2 · 99.91 %', 'ViT-B/16 · 99.80 %', 'DeiT-S · 99.56 %',
      'Ensamble (voto ponderado de los 5)',
    ]);
  });

  it('CA-06.6 elegir otro modelo vuelve a clasificar la misma foto con ese modelo', async () => {
    servicios.clasificarFoto
      .mockResolvedValueOnce(pred('resnet50v2', 'ResNet50V2', 'BASMATI'))
      .mockResolvedValueOnce(pred('vit_b16', 'ViT-B/16', 'JASMINE'));
    const alSugerir = await preparar();
    await userEvent.upload(screen.getByTestId('input-foto'), foto());
    await screen.findByTestId('resultado-clasificacion');

    await userEvent.click(screen.getByRole('combobox', { name: 'Modelo' }));
    await userEvent.click(await screen.findByRole('option', { name: /ViT-B\/16/ }));

    await waitFor(() => expect(servicios.clasificarFoto).toHaveBeenLastCalledWith(expect.any(File), 'vit_b16'));
    expect(await screen.findByTestId('resultado-clasificacion')).toHaveTextContent('Modelo: ViT-B/16');
    expect(alSugerir).toHaveBeenLastCalledWith('JASMINE');
  });

  it('CA-06.6 se puede clasificar con el ensamble', async () => {
    servicios.clasificarFoto.mockResolvedValue(pred('ensamble', 'Ensamble (5 modelos)', 'IPSALA'));
    await preparar();
    await userEvent.click(screen.getByRole('combobox', { name: 'Modelo' }));
    await userEvent.click(await screen.findByRole('option', { name: /Ensamble/ }));
    await userEvent.upload(screen.getByTestId('input-foto'), foto());
    await waitFor(() => expect(servicios.clasificarFoto).toHaveBeenCalledWith(expect.any(File), 'ensamble'));
  });

  it('CA-06.7 comparar muestra la predicción de los 5 modelos, el ensamble y si hay consenso', async () => {
    servicios.compararModelos.mockResolvedValue(COMPARACION);
    const alSugerir = await preparar();
    await userEvent.click(screen.getByTestId('modo-comparar'));
    await userEvent.upload(screen.getByTestId('input-foto'), foto());

    const tabla = await screen.findByTestId('tabla-comparacion');
    expect(within(tabla).getAllByRole('row')).toHaveLength(7); // encabezado + 5 modelos + ensamble
    expect(within(screen.getByTestId('fila-cnn_propia')).getByText('Jasmine')).toBeInTheDocument();
    expect(within(screen.getByTestId('fila-resnet50v2')).getByText('99.00 %')).toBeInTheDocument();
    expect(screen.getByTestId('fila-ensamble')).toHaveTextContent('Ensamble (5 modelos)');
    expect(screen.getByTestId('consenso')).toHaveTextContent('Los modelos no coinciden');
    // La categoría se toma del modelo de referencia (ResNet50V2 por defecto).
    expect(alSugerir).toHaveBeenCalledWith('ARBORIO');
    expect(servicios.clasificarFoto).not.toHaveBeenCalled();
  });

  it('CA-06.7 cambiar de modo vuelve a procesar la foto ya elegida', async () => {
    servicios.clasificarFoto.mockResolvedValue(pred('resnet50v2', 'ResNet50V2', 'BASMATI'));
    servicios.compararModelos.mockResolvedValue(COMPARACION);
    await preparar();
    await userEvent.upload(screen.getByTestId('input-foto'), foto());
    await screen.findByTestId('resultado-clasificacion');
    await userEvent.click(screen.getByTestId('modo-comparar'));
    expect(await screen.findByTestId('tabla-comparacion')).toBeInTheDocument();
    expect(servicios.compararModelos).toHaveBeenCalledTimes(1);
  });

  it('CA-06.7 las métricas de test de los 5 modelos están disponibles', async () => {
    await preparar();
    const metricas = screen.getByTestId('metricas-modelos');
    await userEvent.click(within(metricas).getByText('Métricas de los modelos'));
    const filas = within(metricas).getAllByRole('row');
    expect(filas).toHaveLength(6);
    const resnet = within(metricas).getByText('ResNet50V2 · recomendado').closest('tr');
    expect(resnet).toHaveTextContent('99.91 %');
    expect(resnet).toHaveTextContent('23.58 M');
    expect(resnet).toHaveTextContent('33.00 %');
  });

  it('avisa cuando los modelos cargados son de prueba', async () => {
    servicios.listarModelos.mockResolvedValue({ ...CATALOGO, es_prueba: true });
    await preparar();
    expect(screen.getByTestId('aviso-prueba')).toBeInTheDocument();
  });

  it('si el catálogo no responde, igual se puede clasificar con el modelo por defecto del servidor', async () => {
    servicios.listarModelos.mockRejectedValue({ response: { status: 503, data: { detail: 'Servicio no disponible' } } });
    servicios.clasificarFoto.mockResolvedValue(pred('resnet50v2', 'ResNet50V2', 'BASMATI'));
    render(<ClasificadorFoto alSugerir={vi.fn()} />);
    expect(await screen.findByText('Servicio no disponible')).toBeInTheDocument();
    await userEvent.upload(screen.getByTestId('input-foto'), foto());
    await waitFor(() => expect(servicios.clasificarFoto).toHaveBeenCalledWith(expect.any(File), undefined));
  });
});
