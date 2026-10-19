/**
 * @file PaginaLogin.jsx
 * @description Inicio de sesión con Formik y Yup (HU-01). No envía la petición si hay campos
 *              vacíos (CA-01.5) y muestra el mensaje de la API si las credenciales fallan.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { useState } from 'react';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
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
        navegar(ubicacion.state?.desde || '/productos', { replace: true });
      } catch (e) {
        setErrorApi(mensajeError(e, t));
      }
    },
  });

  if (sesion) return <Navigate to="/productos" replace />;

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
        <Stack direction="row" justifyContent="flex-end"><BotonIdioma /><BotonTema /></Stack>
        <Typography variant="h1" sx={{ mb: 1 }}>{t('app.titulo')}</Typography>
        <Typography variant="h2" component="h2" sx={{ mb: 2 }}>{t('login.titulo')}</Typography>
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
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>{t('login.ayuda')}</Typography>
      </Paper>
    </Box>
  );
}
