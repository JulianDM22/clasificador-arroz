/**
 * @file Modelos.jsx
 * @description Piezas de la clasificación que se muestran en las opciones avanzadas de la página
 *              pública: barras de probabilidad por variedad, tabla con la predicción de los 5
 *              modelos sobre la misma foto (CA-06.7) y tabla con sus métricas de test.
 * @fecha_creacion 2026-10-21
 * @actualizacion 2026-10-21
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import {
  Box, Chip, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CATEGORIAS } from '../validacion/esquemas';

export const ENSAMBLE = 'ensamble';

/**
 * Configuración regional para formatear números y fechas: español de Colombia o inglés.
 * @param {string} idioma código de idioma ("es", "en")
 * @returns {string} etiqueta BCP 47
 */
export const regional = (idioma) => (idioma?.startsWith('en') ? 'en-US' : 'es-CO');

/**
 * Formatea una probabilidad (0 a 1) como porcentaje en el idioma activo.
 * @param {number|null|undefined} v valor entre 0 y 1
 * @param {string} idioma código de idioma ("es", "en")
 * @param {number} [decimales] decimales máximos
 * @returns {string} por ejemplo "99,9 %"
 */
export function porcentaje(v, idioma, decimales = 1) {
  if (v == null) return '—';
  return new Intl.NumberFormat(regional(idioma), { style: 'percent', maximumFractionDigits: decimales }).format(v);
}

/**
 * @param {number|null|undefined} v número
 * @param {number} [d] decimales
 * @returns {string}
 */
export const numero = (v, d = 1) => (v == null ? '—' : Number(v).toFixed(d));

/** Columnas secundarias que se ocultan en pantallas angostas. */
const SOLO_ANCHA = { display: { xs: 'none', sm: 'table-cell' } };

/**
 * Barras con la probabilidad de cada variedad, de la más probable a la menos probable.
 * @param {{prediccion: {probabilidades: Object<string, number>}}} props
 */
export function Probabilidades({ prediccion }) {
  const { t, i18n } = useTranslation();
  const filas = CATEGORIAS.map((c) => [c, prediccion.probabilidades?.[c] ?? 0]).sort((a, b) => b[1] - a[1]);
  return (
    <Box sx={{ display: 'grid', gap: 0.75 }} data-testid="probabilidades">
      {filas.map(([c, v]) => (
        <Box key={c} sx={{ display: 'grid', gridTemplateColumns: '88px 1fr 64px', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">{t(`categorias.${c}`)}</Typography>
          <LinearProgress variant="determinate" value={v * 100} aria-label={`${t(`categorias.${c}`)} ${porcentaje(v, i18n.language)}`}
            sx={{ height: 8, borderRadius: 4 }} />
          <Typography variant="body2" textAlign="right">{porcentaje(v, i18n.language)}</Typography>
        </Box>
      ))}
    </Box>
  );
}

/**
 * Tabla con la predicción de cada modelo y del ensamble sobre la misma foto.
 * @param {{comparacion: {modelos: object[], ensamble: object, consenso: boolean}, catalogo: object|null}} props
 */
export function TablaComparacion({ comparacion, catalogo }) {
  const { t, i18n } = useTranslation();
  const exactitud = Object.fromEntries((catalogo?.modelos || []).map((m) => [m.id, m.accuracy_test]));
  const tipo = Object.fromEntries((catalogo?.modelos || []).map((m) => [m.id, m.tipo]));
  const filas = [...comparacion.modelos, comparacion.ensamble];
  return (
    <Box data-testid="resultado-comparacion">
      <Chip
        color={comparacion.consenso ? 'success' : 'warning'}
        label={comparacion.consenso ? t('clasificador.consenso') : t('clasificador.sinConsenso')}
        data-testid="consenso"
      />
      <TableContainer sx={{ mt: 1 }}>
        <Table size="small" aria-label={t('clasificador.comparacionTitulo')} data-testid="tabla-comparacion">
          <TableHead>
            <TableRow>
              <TableCell>{t('clasificador.col.modelo')}</TableCell>
              <TableCell sx={SOLO_ANCHA}>{t('clasificador.col.tipo')}</TableCell>
              <TableCell>{t('clasificador.col.prediccion')}</TableCell>
              <TableCell align="right">{t('clasificador.col.confianza')}</TableCell>
              <TableCell align="right" sx={SOLO_ANCHA}>{t('clasificador.col.tiempo')}</TableCell>
              <TableCell align="right" sx={SOLO_ANCHA}>{t('clasificador.col.exactitud')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filas.map((p) => {
              const esEnsamble = p.modelo === ENSAMBLE;
              return (
                <TableRow key={p.modelo} data-testid={esEnsamble ? 'fila-ensamble' : `fila-${p.modelo}`}>
                  <TableCell sx={{ fontWeight: esEnsamble ? 700 : 400 }}>{p.nombre}</TableCell>
                  <TableCell sx={SOLO_ANCHA}>{esEnsamble ? t('clasificador.votoPonderado') : tipo[p.modelo]}</TableCell>
                  <TableCell>{t(`categorias.${p.categoria}`)}</TableCell>
                  <TableCell align="right">{porcentaje(p.confianza, i18n.language)}</TableCell>
                  <TableCell align="right" sx={SOLO_ANCHA}>{numero(p.ms)} ms</TableCell>
                  <TableCell align="right" sx={SOLO_ANCHA}>{esEnsamble ? '—' : porcentaje(exactitud[p.modelo], i18n.language, 2)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

/**
 * Tabla con las métricas de test de los modelos del catálogo.
 * @param {{catalogo: {modelo_por_defecto: string, modelos: object[]}}} props
 */
export function MetricasModelos({ catalogo }) {
  const { t, i18n } = useTranslation();
  return (
    <Box data-testid="metricas-modelos">
      <Typography variant="subtitle2" component="h3">{t('clasificador.metricasTitulo')}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{t('clasificador.metricasExplicacion')}</Typography>
      <TableContainer>
        <Table size="small" aria-label={t('clasificador.metricasTitulo')}>
          <TableHead>
            <TableRow>
              <TableCell>{t('clasificador.col.modelo')}</TableCell>
              <TableCell sx={SOLO_ANCHA}>{t('clasificador.col.tipo')}</TableCell>
              <TableCell align="right">{t('clasificador.col.exactitud')}</TableCell>
              <TableCell align="right" sx={SOLO_ANCHA}>{t('clasificador.col.parametros')}</TableCell>
              <TableCell align="right" sx={SOLO_ANCHA}>{t('clasificador.col.tamano')}</TableCell>
              <TableCell align="right" sx={SOLO_ANCHA}>{t('clasificador.col.peso')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {catalogo.modelos.map((m) => (
              <TableRow key={m.id} selected={m.id === catalogo.modelo_por_defecto}>
                <TableCell>{m.nombre}{m.id === catalogo.modelo_por_defecto && ` · ${t('inicio.recomendado')}`}</TableCell>
                <TableCell sx={SOLO_ANCHA}>{m.tipo}</TableCell>
                <TableCell align="right">{porcentaje(m.accuracy_test, i18n.language, 2)}</TableCell>
                <TableCell align="right" sx={SOLO_ANCHA}>{numero(m.params_M, 1)} M</TableCell>
                <TableCell align="right" sx={SOLO_ANCHA}>{numero(m.mb)} MB</TableCell>
                <TableCell align="right" sx={SOLO_ANCHA}>{porcentaje(m.peso_ensamble, i18n.language)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
