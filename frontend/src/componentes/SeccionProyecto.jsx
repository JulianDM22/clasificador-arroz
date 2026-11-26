/**
 * @file SeccionProyecto.jsx
 * @description Sección "Cómo se construyó": los 6 temas de inteligencia artificial del proyecto
 *              (preparación de datos, hiperparámetros, validación cruzada, CNN y transformers,
 *              ensambles, aprendizaje distribuido y federado), cada uno con su resultado principal.
 *              Las cifras salen de los notebooks 01 a 07.
 * @fecha_creacion 2026-11-26
 * @actualizacion 2026-11-26
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import DatasetIcon from '@mui/icons-material/Dataset';
import GitHubIcon from '@mui/icons-material/GitHub';
import HubIcon from '@mui/icons-material/Hub';
import LanIcon from '@mui/icons-material/Lan';
import LoopIcon from '@mui/icons-material/Loop';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TuneIcon from '@mui/icons-material/Tune';
import { useTranslation } from 'react-i18next';
import { URL_REPOSITORIO } from './Encabezado';

const TEMAS = [
  { n: 1, icono: DatasetIcon },
  { n: 2, icono: TuneIcon },
  { n: 3, icono: LoopIcon },
  { n: 4, icono: PsychologyIcon },
  { n: 5, icono: HubIcon },
  { n: 6, icono: LanIcon },
];

export default function SeccionProyecto() {
  const { t } = useTranslation();
  return (
    <Box component="section" id="proyecto" aria-labelledby="proyecto-titulo" sx={{ scrollMarginTop: 80 }}>
      <Typography id="proyecto-titulo" variant="h2" sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem' } }}>{t('proyecto.titulo')}</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3, maxWidth: 780 }}>{t('proyecto.intro')}</Typography>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' } }}>
        {TEMAS.map(({ n, icono: Icono }) => (
          <Card key={n} variant="outlined" data-testid={`tema-${n}`} sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <Box aria-hidden sx={(tema) => ({
                  width: 40, height: 40, borderRadius: 2, display: 'grid', placeItems: 'center',
                  bgcolor: alpha(tema.palette.primary.main, 0.12), color: 'primary.main',
                })}>
                  <Icono fontSize="small" />
                </Box>
                <Chip size="small" label={t('proyecto.tema', { n })} variant="outlined" />
              </Stack>
              <Typography variant="subtitle1" component="h3" fontWeight={700}>{t(`proyecto.t${n}.titulo`)}</Typography>
              <Typography sx={{ fontSize: '1.6rem', fontWeight: 700, color: 'primary.main', my: 0.5 }}>{t(`proyecto.t${n}.dato`)}</Typography>
              <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 1 }}>{t(`proyecto.t${n}.etiqueta`)}</Typography>
              <Typography variant="body2">{t(`proyecto.t${n}.texto`)}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Button href={URL_REPOSITORIO} target="_blank" rel="noopener noreferrer" startIcon={<GitHubIcon />} variant="outlined" sx={{ mt: 3 }}>
        {t('proyecto.codigo')}
      </Button>
    </Box>
  );
}
