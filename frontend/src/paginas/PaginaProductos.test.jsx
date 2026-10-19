/**
 * @file PaginaProductos.test.jsx
 * @description Pruebas del listado: datos de la API, permisos por rol, confirmación al
 *              eliminar y texto potencialmente malicioso mostrado como texto (HU-03, HU-05).
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderizar } from '../pruebas/utilidades';
import PaginaProductos from './PaginaProductos';
import * as servicios from '../api/servicios';

vi.mock('../api/servicios');

const productos = [
  { id: 1, nombre: 'Lote Basmati', categoria: 'BASMATI', descripcion: 'Grano largo', estado: 'ACTIVO' },
  { id: 2, nombre: '<img src=x onerror=alert(1)>', categoria: 'IPSALA', descripcion: '<script>alert(1)</script>', estado: 'INACTIVO' },
];

const pagina = { content: productos, totalElements: 2, page: 0, size: 10, totalPages: 1 };
const listado = (rol) => renderizar(<PaginaProductos />, { ruta: '/lista', patron: '/lista', rol });

describe('PaginaProductos', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    servicios.listarProductos.mockResolvedValue(pagina);
  });

  it('CA-03.1 muestra los productos que devuelve la API', async () => {
    listado('USUARIO');
    expect(await screen.findByText('Lote Basmati')).toBeInTheDocument();
    expect(screen.getAllByTestId('producto')).toHaveLength(2);
    expect(servicios.listarProductos).toHaveBeenCalledWith({ categoria: '', estado: '', q: '', page: 0, size: 10 });
  });

  it('CA-02.6 el texto con etiquetas HTML se muestra literal, sin ejecutarse', async () => {
    listado('USUARIO');
    expect(await screen.findByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
    expect(screen.getByText('<script>alert(1)</script>')).toBeInTheDocument();
    expect(document.querySelector('img[src="x"]')).toBeNull();
  });

  it('CA-01.4 el USUARIO no ve el botón de eliminar', async () => {
    listado('USUARIO');
    await screen.findByText('Lote Basmati');
    expect(screen.queryByTestId('eliminar-1')).toBeNull();
    expect(screen.getByTestId('editar-1')).toBeInTheDocument();
  });

  it('CA-05.3 el ADMIN debe confirmar antes de eliminar', async () => {
    servicios.eliminarProducto.mockResolvedValue();
    listado('ADMIN');
    await userEvent.click(await screen.findByTestId('eliminar-1'));
    const dialogo = await screen.findByRole('dialog');
    expect(within(dialogo).getByText(/Se eliminará «Lote Basmati»/)).toBeInTheDocument();
    expect(servicios.eliminarProducto).not.toHaveBeenCalled();

    await userEvent.click(within(dialogo).getByTestId('confirmar-eliminar'));
    await waitFor(() => expect(servicios.eliminarProducto).toHaveBeenCalledWith(1));
    expect(await screen.findByText('Producto eliminado')).toBeInTheDocument();
  });

  it('CA-05.3 cancelar no elimina', async () => {
    listado('ADMIN');
    await userEvent.click(await screen.findByTestId('eliminar-1'));
    await userEvent.click(within(await screen.findByRole('dialog')).getByText('Cancelar'));
    expect(servicios.eliminarProducto).not.toHaveBeenCalled();
  });

  it('CA-03.2 el filtro de texto consulta la API después de escribir', async () => {
    listado('USUARIO');
    await screen.findByText('Lote Basmati');
    await userEvent.type(screen.getByTestId('filtro-q'), 'basm');
    await waitFor(() => expect(servicios.listarProductos).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'basm', page: 0 })));
  });

  it('sin resultados muestra un mensaje', async () => {
    servicios.listarProductos.mockResolvedValue({ content: [], totalElements: 0 });
    listado('USUARIO');
    expect(await screen.findByTestId('sin-productos')).toBeInTheDocument();
  });

  it('un error de red se muestra al usuario', async () => {
    servicios.listarProductos.mockRejectedValue(new Error('sin red'));
    listado('USUARIO');
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con el servidor');
  });
});
