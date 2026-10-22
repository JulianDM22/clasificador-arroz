/**
 * @file PaginaLogin.jsx
 * @description Acceso del equipo con Formik y Yup (HU-01). No envía la petición si hay campos
 *              vacíos (CA-01.5) y muestra el mensaje de la API si las credenciales fallan. Explica
 *              que para clasificar no hace falta cuenta y permite volver a la página pública.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-21
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.1.0
 */
import { useState } from 'react';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Navigate, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContexto';
import { mensajeError } from '../api/cliente';
import { esquemaLogin } from '../validacion/esquemas';
import { BotonIdioma, BotonTema } from '../componentes/Encabezado';

export default function PaginaLogin() {
  const { t } = useTranslation();
  const { sesion, entrar, vencida } = useAuth();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [errorApi, setErrorApi] = useState('');

  const formik = useFormik({
    initialValues: { username: '', password: '' },
    validationSchema: esquemaLogin(t),
    onSubmit: async (valores) => {
      setErrorApi('');
      try {
        await entrar({ username: valores.username.trim(), password: valores.password });
        navegar(ubicacion.state?.desde || '/equipo/lotes', { replace: true });
      } catch (e) {
        setErrorApi(mensajeError(e, t));
      }
    },
  });

  if (sesion) return <Navigate to="/equipo/lotes" replace />;

  const campo = (nombre) => ({
    id: nombre,
    name: nombre,
    value: formik.values[nombre],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: formik.touched[nombre] && Boolean(formik.errors[nombre]),
    helperText: formik.touched[nombre] && formik.errors[nombre],
  });

  return (
    <Box component="main" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, bgcolor: 'background.default' }}>
      <Paper sx={{ p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 420 }} elevation={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />} size="small" data-testid="volver-inicio">{t('login.volver')}</Button>
          <Stack direction="row"><BotonIdioma /><BotonTema /></Stack>
        </Stack>
        <Typography variant="overline" color="text.secondary" component="p" sx={{ mt: 2 }}>{t('app.titulo')}</Typography>
        <Typography variant="h1" sx={{ mb: 1 }}>{t('login.titulo')}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t('login.explicacion')}</Typography>
        {vencida && <Alert severity="warning" sx={{ mb: 2 }}>{t('errores.sesionVencida')}</Alert>}
        {errorApi && <Alert severity="error" sx={{ mb: 2 }} role="alert" data-testid="error-login">{errorApi}</Alert>}
        <Box component="form" noValidate onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <TextField label={t('login.usuario')} autoComplete="username" autoFocus {...campo('username')} />
            <TextField label={t('login.contrasena')} type="password" autoComplete="current-password" {...campo('password')} />
            <Button type="submit" variant="contained" size="large" disabled={formik.isSubmitting} data-testid="boton-entrar">
              {t('login.entrar')}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
