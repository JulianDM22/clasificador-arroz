/**
 * @file PaginaProductos.jsx
 * @description Inventario de lotes con filtros (variedad, estado y texto), paginación y
 *              acciones. En pantallas angostas usa tarjetas en lugar de tabla para evitar el
 *              desplazamiento horizontal (CA-08.1). El operario registra y edita; solo ADMIN ve
 *              el interruptor para activar o desactivar un lote y el botón de eliminar (CA-10.2).
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-21
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 2.0.0
 */
import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, CardActions, CardContent, Chip, IconButton, LinearProgress, MenuItem, Paper,
  Snackbar, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField,
  Tooltip, Typography, useMediaQuery,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { cambiarEstadoProducto, eliminarProducto, listarProductos } from '../api/servicios';
import { mensajeError } from '../api/cliente';
import { useAuth } from '../auth/AuthContexto';
import { CATEGORIAS, ESTADOS } from '../validacion/esquemas';
import DialogoConfirmacion from '../componentes/DialogoConfirmacion';

/** Espera a que el usuario deje de escribir antes de buscar. */
function useRetrasado(valor, ms = 300) {
  const [v, setV] = useState(valor);
  useEffect(() => {
    const id = setTimeout(() => setV(valor), ms);
    return () => clearTimeout(id);
  }, [valor, ms]);
  return v;
}

export default function PaginaProductos() {
  const { t } = useTranslation();
  const { sesion, esAdmin } = useAuth();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const angosta = useMediaQuery((tema) => tema.breakpoints.down('md'));

  const [filtros, setFiltros] = useState({ categoria: '', estado: '', q: '' });
  const [pagina, setPagina] = useState(0);
  const [tamano, setTamano] = useState(10);
  const [datos, setDatos] = useState({ content: [], totalElements: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aEliminar, setAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [cambiando, setCambiando] = useState(null);
  const [aviso, setAviso] = useState(ubicacion.state?.aviso || '');
  const q = useRetrasado(filtros.q);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      setDatos(await listarProductos({ categoria: filtros.categoria, estado: filtros.estado, q, page: pagina, size: tamano }));
    } catch (e) {
      setError(mensajeError(e, t));
    } finally {
      setCargando(false);
    }
  }, [filtros.categoria, filtros.estado, q, pagina, tamano, t]);

  useEffect(() => { cargar(); }, [cargar]);

  const cambiarFiltro = (campo) => (e) => {
    setFiltros((f) => ({ ...f, [campo]: e.target.value }));
    setPagina(0);
  };

  const confirmarEliminar = async () => {
    setEliminando(true);
    try {
      await eliminarProducto(aEliminar.id);
      setAviso(t('productos.eliminado'));
      setAEliminar(null);
      await cargar();
    } catch (e) {
      setError(mensajeError(e, t));
      setAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  const cambiarEstado = async (p) => {
    const nuevo = p.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    setCambiando(p.id);
    try {
      const actualizado = await cambiarEstadoProducto(p.id, nuevo);
      setDatos((d) => ({ ...d, content: d.content.map((x) => (x.id === p.id ? actualizado : x)) }));
      setAviso(t(nuevo === 'ACTIVO' ? 'productos.activado' : 'productos.desactivado'));
    } catch (e) {
      setError(mensajeError(e, t));
    } finally {
      setCambiando(null);
    }
  };

  const acciones = (p) => (
    <>
      {esAdmin && (
        <Tooltip title={t(p.estado === 'ACTIVO' ? 'productos.desactivar' : 'productos.activar', { nombre: p.nombre })}>
          <Switch
            checked={p.estado === 'ACTIVO'}
            onChange={() => cambiarEstado(p)}
            disabled={cambiando === p.id}
            inputProps={{ 'aria-label': t('productos.cambiarEstado', { nombre: p.nombre }), 'data-testid': `estado-${p.id}` }}
          />
        </Tooltip>
      )}
      <Tooltip title={t('productos.editar', { nombre: p.nombre })}>
        <IconButton aria-label={t('productos.editar', { nombre: p.nombre })} onClick={() => navegar(`/equipo/lotes/${p.id}/editar`)} data-testid={`editar-${p.id}`}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      {esAdmin && (
        <Tooltip title={t('productos.eliminar', { nombre: p.nombre })}>
          <IconButton color="error" aria-label={t('productos.eliminar', { nombre: p.nombre })} onClick={() => setAEliminar(p)} data-testid={`eliminar-${p.id}`}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      )}
    </>
  );

  const chipEstado = (estado) => (
    <Chip size="small" label={t(`estados.${estado}`)} color={estado === 'ACTIVO' ? 'success' : 'default'} variant={estado === 'ACTIVO' ? 'filled' : 'outlined'} />
  );

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
        <Box>
          <Typography variant="h1">{t('productos.titulo')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }} data-testid="explicacion-rol">{t(`productos.rol${sesion.rol}`)}</Typography>
        </Box>
        <Button component={RouterLink} to="/equipo/lotes/nuevo" variant="contained" startIcon={<AddIcon />} data-testid="boton-nuevo" sx={{ flexShrink: 0 }}>
          {t('productos.nuevo')}
        </Button>
      </Stack>

      <Paper sx={{ p: 2 }} component="section" aria-label={t('productos.buscar')}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField label={t('productos.buscar')} value={filtros.q} onChange={cambiarFiltro('q')} inputProps={{ 'data-testid': 'filtro-q' }} />
          <TextField select label={t('campos.categoria')} value={filtros.categoria} onChange={cambiarFiltro('categoria')} sx={{ minWidth: 180 }} SelectProps={{ 'data-testid': 'filtro-categoria' }}>
            <MenuItem value="">{t('productos.todas')}</MenuItem>
            {CATEGORIAS.map((c) => <MenuItem key={c} value={c}>{t(`categorias.${c}`)}</MenuItem>)}
          </TextField>
          <TextField select label={t('campos.estado')} value={filtros.estado} onChange={cambiarFiltro('estado')} sx={{ minWidth: 160 }}>
            <MenuItem value="">{t('productos.todos')}</MenuItem>
            {ESTADOS.map((e) => <MenuItem key={e} value={e}>{t(`estados.${e}`)}</MenuItem>)}
          </TextField>
        </Stack>
      </Paper>

      {error && <Alert severity="error" role="alert">{error}</Alert>}
      {cargando && <LinearProgress aria-label={t('productos.cargando')} />}

      {!cargando && datos.content.length === 0 && !error && (
        <Alert severity="info" data-testid="sin-productos">{t('productos.vacio')}</Alert>
      )}

      {angosta ? (
        <Stack spacing={1.5} data-testid="lista-tarjetas">
          {datos.content.map((p) => (
            <Card key={p.id} variant="outlined" data-testid="producto">
              <CardContent sx={{ pb: 0 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>{p.nombre}</Typography>
                <Stack direction="row" spacing={1} sx={{ my: 1 }}>
                  <Chip size="small" label={t(`categorias.${p.categoria}`)} />
                  {chipEstado(p.estado)}
                </Stack>
                {p.descripcion && <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{p.descripcion}</Typography>}
              </CardContent>
              <CardActions>{acciones(p)}</CardActions>
            </Card>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label={t('productos.titulo')}>
            <TableHead>
              <TableRow>
                <TableCell>{t('campos.id')}</TableCell>
                <TableCell>{t('campos.nombre')}</TableCell>
                <TableCell>{t('campos.categoria')}</TableCell>
                <TableCell>{t('campos.descripcion')}</TableCell>
                <TableCell>{t('campos.estado')}</TableCell>
                <TableCell align="right">{t('campos.acciones')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {datos.content.map((p) => (
                <TableRow key={p.id} hover data-testid="producto">
                  <TableCell>{p.id}</TableCell>
                  <TableCell sx={{ maxWidth: 260, overflowWrap: 'anywhere' }}>{p.nombre}</TableCell>
                  <TableCell>{t(`categorias.${p.categoria}`)}</TableCell>
                  <TableCell sx={{ maxWidth: 320, overflowWrap: 'anywhere' }}>{p.descripcion}</TableCell>
                  <TableCell>{chipEstado(p.estado)}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{acciones(p)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box>
        <TablePagination
          component="div"
          count={datos.totalElements}
          page={pagina}
          onPageChange={(_, p) => setPagina(p)}
          rowsPerPage={tamano}
          onRowsPerPageChange={(e) => { setTamano(parseInt(e.target.value, 10)); setPagina(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage={t('productos.filasPorPagina')}
          labelDisplayedRows={({ from, to, count }) => t('productos.rango', { desde: from, hasta: to, total: count })}
        />
      </Box>

      <DialogoConfirmacion
        abierto={Boolean(aEliminar)}
        titulo={t('productos.confirmarTitulo')}
        texto={t('productos.confirmarTexto', { nombre: aEliminar?.nombre })}
        textoConfirmar={t('productos.confirmarEliminar')}
        textoCancelar={t('productos.cancelar')}
        alConfirmar={confirmarEliminar}
        alCancelar={() => setAEliminar(null)}
        ocupado={eliminando}
      />
      <Snackbar open={Boolean(aviso)} autoHideDuration={4000} onClose={() => setAviso('')} message={aviso} />
    </Stack>
  );
}
