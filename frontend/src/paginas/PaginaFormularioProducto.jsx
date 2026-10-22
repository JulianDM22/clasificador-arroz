/**
 * @file PaginaFormularioProducto.jsx
 * @description Formulario para registrar o editar un lote con Formik y Yup (HU-02, HU-04).
 *              Muestra los errores por campo de la API y cuenta los caracteres. Si se llega desde
 *              la página de clasificación, la variedad viene sugerida por la foto (CA-06.5). El
 *              estado no se edita aquí: los lotes nuevos quedan activos y solo ADMIN lo cambia.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-21
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 2.0.0
 */
import { useEffect, useState } from 'react';
import { Alert, Box, Button, LinearProgress, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { actualizarProducto, crearProducto, obtenerProducto } from '../api/servicios';
import { erroresDeCampo, mensajeError } from '../api/cliente';
import { CATEGORIAS, LIMITES, esquemaProducto } from '../validacion/esquemas';
import { porcentaje } from '../componentes/Modelos';

const VACIO = { nombre: '', categoria: '', descripcion: '' };

export default function PaginaFormularioProducto() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navegar = useNavigate();
  const sugerencia = useLocation().state;
  const editando = Boolean(id);
  const [cargando, setCargando] = useState(editando);
  const [errorApi, setErrorApi] = useState('');

  const formik = useFormik({
    initialValues: { ...VACIO, categoria: (!id && sugerencia?.categoria) || '' },
    validationSchema: esquemaProducto(t),
    onSubmit: async (valores, { setErrors }) => {
      setErrorApi('');
      const cuerpo = { ...valores, nombre: valores.nombre.trim(), descripcion: valores.descripcion?.trim() || null };
      try {
        if (editando) await actualizarProducto(id, cuerpo);
        else await crearProducto(cuerpo);
        navegar('/equipo/lotes', { state: { aviso: t('productos.guardado') } });
      } catch (e) {
        setErrors(erroresDeCampo(e));
        setErrorApi(mensajeError(e, t));
      }
    },
  });

  useEffect(() => {
    if (!editando) return;
    obtenerProducto(id)
      .then((p) => formik.resetForm({ values: { nombre: p.nombre, categoria: p.categoria, descripcion: p.descripcion || '' } }))
      .catch((e) => setErrorApi(mensajeError(e, t)))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const campo = (nombre) => ({
    id: nombre,
    name: nombre,
    value: formik.values[nombre],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: formik.touched[nombre] && Boolean(formik.errors[nombre]),
    helperText: (formik.touched[nombre] && formik.errors[nombre]) || ' ',
  });

  return (
    <Stack spacing={2}>
      <Box>
        <Button component={RouterLink} to="/equipo/lotes" startIcon={<ArrowBackIcon />}>{t('formulario.volver')}</Button>
      </Box>
      <Typography variant="h1">{editando ? t('formulario.tituloEditar') : t('formulario.tituloNuevo')}</Typography>
      {cargando && <LinearProgress />}
      {errorApi && <Alert severity="error" role="alert" data-testid="error-formulario">{errorApi}</Alert>}

      {!editando && sugerencia?.categoria && (
        <Alert severity="info" data-testid="variedad-sugerida">
          {t('formulario.sugerida', { variedad: t(`categorias.${sugerencia.categoria}`), confianza: porcentaje(sugerencia.confianza, i18n.language) })}
        </Alert>
      )}

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Box component="form" noValidate onSubmit={formik.handleSubmit} aria-busy={formik.isSubmitting}>
          <Stack spacing={1}>
            <TextField label={t('campos.nombre')} required inputProps={{ maxLength: LIMITES.nombreMax + 1 }} {...campo('nombre')} />
            <TextField select label={t('campos.categoria')} required {...campo('categoria')} SelectProps={{ 'data-testid': 'select-categoria' }}>
              {CATEGORIAS.map((c) => <MenuItem key={c} value={c}>{t(`categorias.${c}`)}</MenuItem>)}
            </TextField>
            <TextField
              label={t('campos.descripcion')}
              multiline
              minRows={3}
              {...campo('descripcion')}
              helperText={(formik.touched.descripcion && formik.errors.descripcion)
                || t('formulario.caracteres', { n: formik.values.descripcion.length, max: LIMITES.descripcionMax })}
            />
            {!editando && <Typography variant="body2" color="text.secondary">{t('formulario.nuevoActivo')}</Typography>}
            {!editando && !sugerencia?.categoria && (
              <Box>
                <Button component={RouterLink} to="/" size="small" startIcon={<PhotoCameraIcon />} data-testid="enlace-clasificar">
                  {t('formulario.sinSaber')}
                </Button>
              </Box>
            )}
            <Box sx={{ pt: 1 }}>
              <Button type="submit" variant="contained" size="large" disabled={formik.isSubmitting || cargando} data-testid="boton-guardar">
                {t('formulario.guardar')}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Stack>
  );
}
