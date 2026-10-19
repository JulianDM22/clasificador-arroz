/**
 * @file PaginaFormularioProducto.test.jsx
 * @description Pruebas del formulario de producto: validación en el cliente, errores por campo
 *              de la API y categoría precargada desde la foto (HU-02, HU-04, HU-06).
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
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

const nuevo = () => renderizar(<PaginaFormularioProducto />, { ruta: '/productos/nuevo', patron: '/productos/nuevo', rol: 'USUARIO' });

describe('PaginaFormularioProducto', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:vista');
    globalThis.URL.revokeObjectURL = vi.fn();
    servicios.listarModelos.mockResolvedValue({
      modelo_por_defecto: 'resnet50v2', ensamble_disponible: true, es_prueba: false,
      modelos: [{ id: 'resnet50v2', nombre: 'ResNet50V2', tipo: 'CNN', accuracy_test: 0.9991 }],
    });
  });

  it('CA-02.2 un nombre de 2 caracteres muestra el error y no envía', async () => {
    nuevo();
    await userEvent.type(screen.getByLabelText(/Nombre/), 'ab');
    await userEvent.click(screen.getByTestId('boton-guardar'));
    expect(await screen.findByText('El nombre debe tener al menos 3 caracteres')).toBeInTheDocument();
    expect(screen.getByText('Selecciona una categoría')).toBeInTheDocument();
    expect(servicios.crearProducto).not.toHaveBeenCalled();
  });

  it('CA-06.5 la foto clasificada precarga la categoría y se envía con el producto', async () => {
    servicios.clasificarFoto.mockResolvedValue({
      modelo: 'resnet50v2', nombre: 'ResNet50V2', ms: 40, categoria: 'BASMATI', confianza: 0.97,
      probabilidades: { ARBORIO: 0.01, BASMATI: 0.97, IPSALA: 0, JASMINE: 0.02, KARACADAG: 0 },
    });
    servicios.crearProducto.mockResolvedValue({ id: 1 });
    nuevo();

    const foto = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'grano.jpg', { type: 'image/jpeg' });
    await userEvent.upload(screen.getByTestId('input-foto'), foto);

    expect(await screen.findByTestId('resultado-clasificacion')).toHaveTextContent('Basmati');
    expect(screen.getByTestId('select-categoria')).toHaveTextContent('Basmati');

    await userEvent.type(screen.getByLabelText(/Nombre/), '  Lote nuevo ');
    await userEvent.click(screen.getByTestId('boton-guardar'));
    await waitFor(() => expect(servicios.crearProducto).toHaveBeenCalledWith(
      { nombre: 'Lote nuevo', categoria: 'BASMATI', descripcion: null, estado: 'ACTIVO' },
    ));
  });

  it('CA-06.2 una foto que no es JPEG/PNG se rechaza sin llamar a la API', async () => {
    nuevo();
    const gif = new File(['GIF89a'], 'grano.gif', { type: 'image/gif' });
    await userEvent.upload(screen.getByTestId('input-foto'), gif, { applyAccept: false });
    expect(await screen.findByTestId('error-clasificacion')).toHaveTextContent('La foto debe ser JPEG o PNG');
    expect(servicios.clasificarFoto).not.toHaveBeenCalled();
  });

  it('CA-06.4 si el servicio de clasificación no está disponible se muestra su mensaje', async () => {
    servicios.clasificarFoto.mockRejectedValue({ response: { status: 503, data: { detail: 'El servicio de clasificación no está disponible' } } });
    nuevo();
    await userEvent.upload(screen.getByTestId('input-foto'), new File(['x'], 'g.png', { type: 'image/png' }));
    expect(await screen.findByTestId('error-clasificacion')).toHaveTextContent('no está disponible');
  });

  it('CA-02.5 el error 409 de la API se muestra al usuario', async () => {
    servicios.crearProducto.mockRejectedValue({ response: { status: 409, data: { detail: "Ya existe un producto con el nombre 'Lote'" } } });
    nuevo();
    await userEvent.type(screen.getByLabelText(/Nombre/), 'Lote');
    await userEvent.click(screen.getByRole('combobox', { name: /Categoría/ }));
    await userEvent.click(await screen.findByRole('option', { name: 'Ipsala' }));
    await userEvent.click(screen.getByTestId('boton-guardar'));
    expect(await screen.findByTestId('error-formulario')).toHaveTextContent('Ya existe un producto');
  });

  it('CA-04.1 en modo edición carga el producto y envía la actualización', async () => {
    servicios.obtenerProducto.mockResolvedValue({ id: 7, nombre: 'Lote viejo', categoria: 'IPSALA', descripcion: null, estado: 'ACTIVO' });
    servicios.actualizarProducto.mockResolvedValue({ id: 7 });
    renderizar(<PaginaFormularioProducto />, { ruta: '/productos/7/editar', patron: '/productos/:id/editar', rol: 'USUARIO' });
    const nombre = screen.getByLabelText(/Nombre/);
    await waitFor(() => expect(nombre).toHaveValue('Lote viejo'));
    await userEvent.clear(nombre);
    await userEvent.type(nombre, 'Lote editado');
    await userEvent.click(screen.getByTestId('boton-guardar'));
    await waitFor(() => expect(servicios.actualizarProducto).toHaveBeenCalledWith('7', expect.objectContaining({ nombre: 'Lote editado', categoria: 'IPSALA' })));
  });
});
