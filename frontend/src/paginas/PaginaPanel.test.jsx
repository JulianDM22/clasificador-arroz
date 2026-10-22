/**
 * @file PaginaPanel.test.jsx
 * @description Pruebas unitarias del panel del administrador (HU-10): cifras, gráficas con sus
 *              tablas de datos, estado vacío, error y actualización.
 * @fecha_creacion 2026-10-21
 * @actualizacion 2026-10-21
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderizar } from '../pruebas/utilidades';
import PaginaPanel from './PaginaPanel';
import * as servicios from '../api/servicios';

vi.mock('../api/servicios');

const variedades = (valores) => Object.fromEntries(['ARBORIO', 'BASMATI', 'IPSALA', 'JASMINE', 'KARACADAG'].map((c, i) => [c, valores[i]]));
const dias = Array.from({ length: 14 }, (_, i) => ({ fecha: `2026-10-${String(8 + i).padStart(2, '0')}`, cantidad: i === 13 ? 7 : 0 }));
const ESTADISTICAS = {
  lotes: { total: 1040, activos: 1039, inactivos: 1, porVariedad: variedades([207, 187, 214, 202, 230]) },
  clasificaciones: {
    total: 12, ultimos7Dias: 7, porVariedad: variedades([0, 5, 0, 7, 0]),
    porModelo: { resnet50v2: 9, ensamble: 2, deit_s: 1 }, porDia: dias,
  },
};
const panel = () => renderizar(<PaginaPanel />, { rol: 'ADMIN' });

describe('PaginaPanel', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    servicios.obtenerEstadisticas.mockResolvedValue(ESTADISTICAS);
  });

  it('CA-10.1 muestra las cifras del inventario y del uso, con formato colombiano', async () => {
    panel();
    expect(await screen.findByTestId('cifra-lotes')).toHaveTextContent('1.040');
    expect(screen.getByTestId('cifra-activos')).toHaveTextContent('1.039');
    expect(screen.getByTestId('cifra-inactivos')).toHaveTextContent('1');
    expect(screen.getByTestId('cifra-clasificaciones')).toHaveTextContent('12');
    expect(screen.getByTestId('cifra-7dias')).toHaveTextContent('7');
  });

  it('CA-10.1 las gráficas tienen el detalle de cada barra y sus datos en tabla', async () => {
    panel();
    const lotes = await screen.findByTestId('grafica-lotes');
    expect(within(lotes).getByLabelText('Karacadag: 230')).toBeInTheDocument();
    await userEvent.click(within(lotes).getByText('Ver los datos en tabla'));
    expect(within(lotes).getByRole('row', { name: 'Ipsala 214' })).toBeInTheDocument();

    const modelos = screen.getByTestId('grafica-modelos');
    expect(within(modelos).getByLabelText('ResNet50V2: 9')).toBeInTheDocument();
    expect(within(modelos).getByLabelText(/Los 5 juntos .*: 2/)).toBeInTheDocument();

    const porDia = screen.getByTestId('grafica-dias');
    expect(within(porDia).getAllByLabelText(/: \d+$/)).toHaveLength(14);
    expect(within(porDia).getByLabelText('21 de oct: 7')).toBeInTheDocument();
  });

  it('sin clasificaciones muestra un mensaje en lugar de la gráfica de modelos', async () => {
    servicios.obtenerEstadisticas.mockResolvedValue({
      ...ESTADISTICAS, clasificaciones: { ...ESTADISTICAS.clasificaciones, total: 0, porModelo: {} },
    });
    panel();
    expect(await screen.findByTestId('sin-clasificaciones')).toHaveTextContent('Todavía no hay clasificaciones.');
    expect(screen.queryByTestId('grafica-modelos')).toBeNull();
  });

  it('un error se muestra y "Actualizar" vuelve a consultar', async () => {
    servicios.obtenerEstadisticas.mockRejectedValueOnce(new Error('sin red'));
    panel();
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar');
    await userEvent.click(screen.getByTestId('boton-actualizar'));
    await waitFor(() => expect(servicios.obtenerEstadisticas).toHaveBeenCalledTimes(2));
    expect(await screen.findByTestId('cifra-lotes')).toBeInTheDocument();
  });
});
