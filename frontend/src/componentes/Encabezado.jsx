/**
 * @file Encabezado.jsx
 * @description Estructura común de la página: barra superior con enlaces a las secciones
 *              (Clasificar, Cómo se construyó), idioma, tema y repositorio, y el acceso del
 *              administrador o, con sesión, su panel y el botón de salir; enlace para saltar al
 *              contenido (accesibilidad) y pie.
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-11-26
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 3.0.0
 */
import { AppBar, Box, Button, Container, IconButton, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import GitHubIcon from '@mui/icons-material/GitHub';
import GrassIcon from '@mui/icons-material/Grass';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContexto';
import { useTema } from '../tema/TemaContexto';
import { tokensBase } from '../tema/tokens';

/** Repositorio público del proyecto. */
export const URL_REPOSITORIO = 'https://github.com/JulianDM22/clasificador-arroz';

/**
 * Selector de idioma.
 */
export function BotonIdioma() {
  const { t, i18n } = useTranslation();
  const otro = i18n.resolvedLanguage === 'en' ? 'es' : 'en';
  return (
    <Tooltip title={t('menu.idioma')}>
      <Button color="inherit" onClick={() => i18n.changeLanguage(otro)} aria-label={t('menu.idioma')} data-testid="boton-idioma" sx={{ minWidth: 40 }}>
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
  const { sesion, esAdmin, cerrar } = useAuth();
  const navegar = useNavigate();
  const salir = () => {
    cerrar();
    navegar('/');
  };
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Box
        component="a"
        href="#contenido"
        sx={{ position: 'absolute', left: -9999, zIndex: 2000, '&:focus': { left: 16, top: 16, p: 1, bgcolor: 'background.paper', color: 'text.primary' } }}
      >
        {t('app.saltar')}
      </Box>
      <AppBar position="sticky" color="primary" elevation={0}>
        <Toolbar sx={{ gap: 0.5, flexWrap: 'wrap', maxWidth: tokensBase.anchoMaximoContenido + 48, width: '100%', mx: 'auto' }}>
          <Stack direction="row" alignItems="center" spacing={1} component={RouterLink} to="/"
            sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1, minWidth: 0, mr: 1 }}>
            <GrassIcon aria-hidden />
            <Typography variant="h6" component="span" noWrap>{t('app.titulo')}</Typography>
          </Stack>
          <Box component="nav" aria-label={t('menu.navegacion')} sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <Button color="inherit" href="/#clasificar" data-testid="nav-clasificar">{t('menu.clasificar')}</Button>
            <Button color="inherit" href="/#proyecto" data-testid="nav-proyecto">{t('menu.proyecto')}</Button>
            {esAdmin && <Button color="inherit" component={RouterLink} to="/equipo/panel" data-testid="nav-panel">{t('menu.panel')}</Button>}
          </Box>
          <BotonIdioma />
          <BotonTema />
          <Tooltip title={t('menu.repositorio')}>
            <IconButton color="inherit" href={URL_REPOSITORIO} target="_blank" rel="noopener noreferrer" aria-label={t('menu.repositorio')}>
              <GitHubIcon />
            </IconButton>
          </Tooltip>
          {sesion ? (
            <>
              <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' }, ml: 1 }} data-testid="usuario-actual">
                {t('menu.usuario', { usuario: sesion.username, rol: t(`roles.${sesion.rol}`) })}
              </Typography>
              <Tooltip title={t('menu.cerrarSesion')}>
                <IconButton color="inherit" onClick={salir} aria-label={t('menu.cerrarSesion')} data-testid="boton-salir">
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Button component={RouterLink} to="/equipo/entrar" color="inherit" variant="outlined" size="small" sx={{ ml: 0.5 }} data-testid="nav-equipo">
              {t('menu.equipo')}
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container component="main" id="contenido" tabIndex={-1} sx={{ py: { xs: 3, sm: 5 }, maxWidth: tokensBase.anchoMaximoContenido, outline: 'none', flexGrow: 1 }}>
        {children}
      </Container>
      <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', py: 3, px: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">{t('inicio.pie')}</Typography>
      </Box>
    </Box>
  );
}
