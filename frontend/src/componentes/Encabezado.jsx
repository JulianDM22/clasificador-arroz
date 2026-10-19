/**
 * @file Encabezado.jsx
 * @description Estructura común de las páginas con sesión: enlace para saltar al contenido,
 *              barra superior (idioma, tema, usuario y cierre de sesión) y contenedor principal.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { AppBar, Box, Button, Container, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContexto';
import { useTema } from '../tema/TemaContexto';
import { tokensBase } from '../tema/tokens';

/**
 * Selector de idioma reutilizable (también aparece en el inicio de sesión).
 */
export function BotonIdioma() {
  const { t, i18n } = useTranslation();
  const otro = i18n.resolvedLanguage === 'en' ? 'es' : 'en';
  return (
    <Tooltip title={t('menu.idioma')}>
      <Button color="inherit" onClick={() => i18n.changeLanguage(otro)} aria-label={t('menu.idioma')} data-testid="boton-idioma">
        {otro.toUpperCase()}
      </Button>
    </Tooltip>
  );
}

/**
 * Botón para alternar el tema claro/oscuro.
 */
export function BotonTema() {
  const { t } = useTranslation();
  const { modo, alternar } = useTema();
  const etiqueta = modo === 'claro' ? t('menu.temaOscuro') : t('menu.temaClaro');
  return (
    <Tooltip title={etiqueta}>
      <IconButton color="inherit" onClick={alternar} aria-label={etiqueta} data-testid="boton-tema">
        {modo === 'claro' ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
}

/**
 * @param {{children: React.ReactNode}} props contenido de la página
 */
export default function Encabezado({ children }) {
  const { t } = useTranslation();
  const { sesion, cerrar } = useAuth();
  const navegar = useNavigate();

  const salir = () => {
    cerrar();
    navegar('/login');
  };

  return (
    <>
      <Box
        component="a"
        href="#contenido"
        sx={{ position: 'absolute', left: -9999, zIndex: 2000, '&:focus': { left: 16, top: 16, p: 1, bgcolor: 'background.paper', color: 'text.primary' } }}
      >
        {t('app.saltar')}
      </Box>
      <AppBar position="sticky" color="primary">
        <Toolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="h6" component={RouterLink} to="/productos" sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1, minWidth: 0 }} noWrap>
            {t('app.titulo')}
          </Typography>
          <BotonIdioma />
          <BotonTema />
          {sesion && (
            <>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }} data-testid="usuario-actual">
                {t('menu.usuario', { usuario: sesion.username, rol: sesion.rol })}
              </Typography>
              <Tooltip title={t('menu.cerrarSesion')}>
                <IconButton color="inherit" onClick={salir} aria-label={t('menu.cerrarSesion')} data-testid="boton-salir">
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container component="main" id="contenido" tabIndex={-1} sx={{ py: 3, maxWidth: tokensBase.anchoMaximoContenido, outline: 'none' }}>
        {children}
      </Container>
    </>
  );
}
