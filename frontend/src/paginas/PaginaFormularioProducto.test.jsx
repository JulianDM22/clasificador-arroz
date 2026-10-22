/**
 * @file PaginaFormularioProducto.test.jsx
 * @description Pruebas del formulario de producto: validación en el cliente, errores por campo
 *              de la API y categoría precargada desde la foto (HU-02, HU-04, HU-06).
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-21
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderizar } from '../pruebas/utilidades';
import PaginaFormularioProducto from './PaginaFormularioProducto';
import * as servicios from '../api/servicios';

vi.mock('../api/servicios');

const nuevo = (estado) => renderizar(<PaginaFormularioProducto />, { ruta: '/formulario/nuevo', estado, patron: '/formulario/nuevo', rol: 'USUARIO' });

describe('PaginaFormularioProducto', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('CA-02.2 un nombre de 2 caracteres muestra el error y no envía', async () => {
    nuevo();
    await userEvent.type(screen.getByLabelText(/Nombre/), 'ab');
    await userEvent.click(screen.getByTestId('boton-guardar'));
    expect(await screen.findByText('El nombre debe tener al menos 3 caracteres')).toBeInTheDocument();
    expect(screen.getByText('Selecciona una variedad')).toBeInTheDocument();
    expect(servicios.crearProducto).not.toHaveBeenCalled();
  });

  it('CA-06.5 la variedad que sugirió la foto llega precargada y se envía con el lote (sin estado)', async () => {
    servicios.crearProducto.mockResolvedValue({ id: 1 });
    nuevo({ categoria: 'BASMATI', confianza: 0.97 });

    expect(screen.getByTestId('variedad-sugerida')).toHaveTextContent('Variedad sugerida por la foto: Basmati (97% de seguridad)');
    expect(screen.getByTestId('select-categoria')).toHaveTextContent('Basmati');
    expect(screen.queryByTestId('enlace-clasificar')).toBeNull();

    await userEvent.type(screen.getByLabelText(/Nombre/), '  Lote nuevo ');
    await userEvent.click(screen.getByTestId('boton-guardar'));
    await waitFor(() => expect(servicios.crearProducto).toHaveBeenCalledWith(
      { nombre: 'Lote nuevo', categoria: 'BASMATI', descripcion: null },
    ));
    expect(await screen.findByTestId('destino')).toHaveTextContent('pantalla-lotes');
  });

  it('CA-10.3 el formulario no pide estado: avisa que el lote queda activo y ofrece clasificar una foto', () => {
    nuevo();
    expect(screen.queryByLabelText(/Estado/)).toBeNull();
    expect(screen.getByText('El lote queda activo al guardarlo.')).toBeInTheDocument();
    expect(screen.getByTestId('enlace-clasificar')).toHaveAttribute('href', '/');
    expect(screen.queryByTestId('variedad-sugerida')).toBeNull();
  });

  it('CA-02.5 el error 409 de la API se muestra al usuario', async () => {
    servicios.crearProducto.mockRejectedValue({ response: { status: 409, data: { detail: "Ya existe un producto con el nombre 'Lote'" } } });
    nuevo();
    await userEvent.type(screen.getByLabelText(/Nombre/), 'Lote');
    await userEvent.click(screen.getByRole('combobox', { name: /Variedad/ }));
    await userEvent.click(await screen.findByRole('option', { name: 'Ipsala' }));
    await userEvent.click(screen.getByTestId('boton-guardar'));
    expect(await screen.findByTestId('error-formulario')).toHaveTextContent('Ya existe un producto');
  });

  it('CA-04.1 en modo edición carga el producto y envía la actualización', async () => {
    servicios.obtenerProducto.mockResolvedValue({ id: 7, nombre: 'Lote viejo', categoria: 'IPSALA', descripcion: null, estado: 'ACTIVO' });
    servicios.actualizarProducto.mockResolvedValue({ id: 7 });
    renderizar(<PaginaFormularioProducto />, { ruta: '/formulario/7/editar', patron: '/formulario/:id/editar', rol: 'USUARIO' });
    const nombre = screen.getByLabelText(/Nombre/);
    await waitFor(() => expect(nombre).toHaveValue('Lote viejo'));
    await userEvent.clear(nombre);
    await userEvent.type(nombre, 'Lote editado');
    await userEvent.click(screen.getByTestId('boton-guardar'));
    await waitFor(() => expect(servicios.actualizarProducto).toHaveBeenCalledWith('7', expect.objectContaining({ nombre: 'Lote editado', categoria: 'IPSALA' })));
  });
});
