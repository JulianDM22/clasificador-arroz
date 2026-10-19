/**
 * @file PaginaNoEncontrada.jsx
 * @description Página para rutas que no existen.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { Button, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

export default function PaginaNoEncontrada() {
  const { t } = useTranslation();
  return (
    <Stack component="main" spacing={2} alignItems="center" sx={{ py: 8 }}>
      <Typography variant="h1">{t('noEncontrada.titulo')}</Typography>
      <Button component={RouterLink} to="/" variant="contained">{t('noEncontrada.volver')}</Button>
    </Stack>
  );
}
