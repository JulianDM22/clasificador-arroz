/**
 * @file ClasificadorFoto.jsx
 * @description Sube la foto de un grano y la clasifica con el modelo que elija el usuario (uno de
 *              los 5 o el ensamble), o con todos a la vez para compararlos. Muestra la vista previa,
 *              la probabilidad de cada variedad, la tabla comparativa y las métricas de test de
 *              cada modelo, y entrega la categoría sugerida al formulario (HU-06: CA-06.5 a CA-06.7).
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.1.0
 */
import { useCallback, useEffect, useState } from 'react';
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Chip, CircularProgress, LinearProgress, MenuItem,
  Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, ToggleButton,
  ToggleButtonGroup, Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useTranslation } from 'react-i18next';
import { clasificarFoto, compararModelos, listarModelos } from '../api/servicios';
import { mensajeError } from '../api/cliente';
import { CATEGORIAS, TIPOS_IMAGEN, validarFoto } from '../validacion/esquemas';

export const ENSAMBLE = 'ensamble';
const porcentaje = (v) => (v == null ? '—' : `${(v * 100).toFixed(2)} %`);
const numero = (v, d = 1) => (v == null ? '—' : Number(v).toFixed(d));
/** Columnas secundarias que se ocultan en pantallas angostas. */
const SOLO_ANCHA = { display: { xs: 'none', sm: 'table-cell' } };

/** Barras con la probabilidad de cada variedad. */
function Probabilidades({ prediccion }) {
  const { t } = useTranslation();
  return (
    <>
      <Typography variant="caption" component="p" sx={{ mt: 1 }}>{t('clasificador.probabilidades')}</Typography>
      {CATEGORIAS.map((c) => {
        const v = prediccion.probabilidades?.[c] ?? 0;
        return (
          <Box key={c} sx={{ display: 'grid', gridTemplateColumns: '90px 1fr 64px', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption">{t(`categorias.${c}`)}</Typography>
            <LinearProgress variant="determinate" value={v * 100} aria-label={`${t(`categorias.${c}`)} ${porcentaje(v)}`} />
            <Typography variant="caption" textAlign="right">{porcentaje(v)}</Typography>
          </Box>
        );
      })}
    </>
  );
}

/** Tabla con las métricas de test de los modelos del catálogo. */
function MetricasModelos({ catalogo }) {
  const { t } = useTranslation();
  return (
    <Accordion disableGutters variant="outlined" sx={{ mt: 2 }} data-testid="metricas-modelos">
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="metricas-contenido" id="metricas-encabezado">
        <Typography variant="subtitle2">{t('clasificador.metricasTitulo')}</Typography>
      </AccordionSummary>
      <AccordionDetails id="metricas-contenido">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{t('clasificador.metricasExplicacion')}</Typography>
        <TableContainer>
          <Table size="small" aria-label={t('clasificador.metricasTitulo')}>
            <TableHead>
              <TableRow>
                <TableCell>{t('clasificador.col.modelo')}</TableCell>
                <TableCell sx={SOLO_ANCHA}>{t('clasificador.col.tipo')}</TableCell>
                <TableCell align="right">{t('clasificador.col.exactitud')}</TableCell>
                <TableCell align="right" sx={SOLO_ANCHA}>{t('clasificador.col.f1')}</TableCell>
                <TableCell align="right" sx={SOLO_ANCHA}>{t('clasificador.col.parametros')}</TableCell>
                <TableCell align="right" sx={SOLO_ANCHA}>{t('clasificador.col.tamano')}</TableCell>
                <TableCell align="right" sx={SOLO_ANCHA}>{t('clasificador.col.peso')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {catalogo.modelos.map((m) => (
                <TableRow key={m.id} selected={m.id === catalogo.modelo_por_defecto}>
                  <TableCell>{m.nombre}{m.id === catalogo.modelo_por_defecto && ` · ${t('clasificador.recomendado')}`}</TableCell>
                  <TableCell sx={SOLO_ANCHA}>{m.tipo}</TableCell>
                  <TableCell align="right">{porcentaje(m.accuracy_test)}</TableCell>
                  <TableCell align="right" sx={SOLO_ANCHA}>{porcentaje(m.f1_test)}</TableCell>
                  <TableCell align="right" sx={SOLO_ANCHA}>{numero(m.params_M, 2)} M</TableCell>
                  <TableCell align="right" sx={SOLO_ANCHA}>{numero(m.mb)} MB</TableCell>
                  <TableCell align="right" sx={SOLO_ANCHA}>{porcentaje(m.peso_ensamble)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
}

/** Tabla con la predicción de cada modelo y del ensamble sobre la misma foto. */
function TablaComparacion({ comparacion, catalogo, seleccionado }) {
  const { t } = useTranslation();
  const exactitud = Object.fromEntries((catalogo?.modelos || []).map((m) => [m.id, m.accuracy_test]));
  const tipo = Object.fromEntries((catalogo?.modelos || []).map((m) => [m.id, m.tipo]));
  const filas = [...comparacion.modelos, comparacion.ensamble];
  return (
    <>
      <Chip
        sx={{ mt: 1 }}
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
                <TableRow key={p.modelo} selected={p.modelo === seleccionado} data-testid={esEnsamble ? 'fila-ensamble' : `fila-${p.modelo}`}>
                  <TableCell sx={{ fontWeight: esEnsamble ? 700 : 400 }}>{p.nombre}</TableCell>
                  <TableCell sx={SOLO_ANCHA}>{esEnsamble ? t('clasificador.votoPonderado') : tipo[p.modelo]}</TableCell>
                  <TableCell>{t(`categorias.${p.categoria}`)}</TableCell>
                  <TableCell align="right">{porcentaje(p.confianza)}</TableCell>
                  <TableCell align="right" sx={SOLO_ANCHA}>{numero(p.ms)} ms</TableCell>
                  <TableCell align="right" sx={SOLO_ANCHA}>{esEnsamble ? '—' : porcentaje(exactitud[p.modelo])}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

/**
 * @param {{alSugerir: function(string): void}} props callback con la categoría sugerida
 */
export default function ClasificadorFoto({ alSugerir }) {
  const { t } = useTranslation();
  const [catalogo, setCatalogo] = useState(null);
  const [errorCatalogo, setErrorCatalogo] = useState('');
  const [modo, setModo] = useState('uno');
  const [modelo, setModelo] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [vista, setVista] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null);
  const [comparacion, setComparacion] = useState(null);

  useEffect(() => {
    listarModelos()
      .then((c) => { setCatalogo(c); setModelo(c.modelo_por_defecto); })
      .catch((e) => setErrorCatalogo(mensajeError(e, t)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => { if (vista) URL.revokeObjectURL(vista); }, [vista]);

  const clasificar = useCallback(async (foto, modoActual, modeloActual) => {
    setCargando(true);
    setError('');
    setResultado(null);
    setComparacion(null);
    try {
      if (modoActual === 'comparar') {
        const c = await compararModelos(foto);
        setComparacion(c);
        const elegido = modeloActual === ENSAMBLE ? c.ensamble : (c.modelos.find((m) => m.modelo === modeloActual) || c.ensamble);
        alSugerir(elegido.categoria);
      } else {
        const r = await clasificarFoto(foto, modeloActual || undefined);
        setResultado(r);
        alSugerir(r.categoria);
      }
    } catch (e) {
      setError(mensajeError(e, t));
    } finally {
      setCargando(false);
    }
  }, [alSugerir, t]);

  const alElegir = (evento) => {
    const foto = evento.target.files?.[0];
    evento.target.value = '';
    setError('');
    const problema = validarFoto(foto, t);
    if (problema) {
      setResultado(null);
      setComparacion(null);
      setError(problema);
      return;
    }
    setArchivo(foto);
    setVista(URL.createObjectURL(foto));
    clasificar(foto, modo, modelo);
  };

  // Al cambiar el modo o el modelo, se vuelve a clasificar la misma foto.
  const cambiarModo = (_, nuevo) => {
    if (!nuevo) return;
    setModo(nuevo);
    if (archivo) clasificar(archivo, nuevo, modelo);
  };
  const cambiarModelo = (e) => {
    setModelo(e.target.value);
    if (archivo) clasificar(archivo, modo, e.target.value);
  };

  const opciones = [
    ...(catalogo?.modelos || []).map((m) => ({ id: m.id, etiqueta: `${m.nombre} · ${porcentaje(m.accuracy_test)}` })),
    ...(catalogo?.ensamble_disponible ? [{ id: ENSAMBLE, etiqueta: t('clasificador.ensamble') }] : []),
  ];

  return (
    <Paper variant="outlined" sx={{ p: 2 }} component="section" aria-labelledby="clasificador-titulo">
      <Typography id="clasificador-titulo" variant="subtitle1" component="h2" fontWeight={600}>{t('clasificador.titulo')}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t('clasificador.explicacion')}</Typography>
      {catalogo?.es_prueba && <Alert severity="warning" sx={{ mb: 2 }} data-testid="aviso-prueba">{t('clasificador.avisoPrueba')}</Alert>}
      {errorCatalogo && <Alert severity="warning" sx={{ mb: 2 }}>{errorCatalogo}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }} alignItems={{ md: 'center' }}>
        <ToggleButtonGroup exclusive size="small" color="primary" value={modo} onChange={cambiarModo} aria-label={t('clasificador.modo')}>
          <ToggleButton value="uno" data-testid="modo-uno">{t('clasificador.modoUno')}</ToggleButton>
          <ToggleButton value="comparar" data-testid="modo-comparar">{t('clasificador.modoComparar')}</ToggleButton>
        </ToggleButtonGroup>
        <TextField
          select
          size="small"
          label={modo === 'comparar' ? t('clasificador.modeloReferencia') : t('clasificador.modelo')}
          value={opciones.some((o) => o.id === modelo) ? modelo : ''}
          onChange={cambiarModelo}
          disabled={!catalogo || cargando}
          sx={{ minWidth: { md: 280 } }}
          SelectProps={{ 'data-testid': 'select-modelo' }}
        >
          {opciones.map((o) => <MenuItem key={o.id} value={o.id}>{o.etiqueta}</MenuItem>)}
        </TextField>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }}>
        <Box>
          <Button component="label" variant="outlined" startIcon={<PhotoCameraIcon />} disabled={cargando}>
            {t('clasificador.elegir')}
            <input hidden type="file" accept={TIPOS_IMAGEN.join(',')} onChange={alElegir} data-testid="input-foto" />
          </Button>
          {vista && (
            <Box component="img" src={vista} alt={t('clasificador.vistaPrevia')}
              sx={{ display: 'block', mt: 2, width: 140, height: 140, objectFit: 'cover', borderRadius: 1, bgcolor: 'common.black' }} />
          )}
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }} aria-live="polite">
          {cargando && (
            <Stack direction="row" spacing={1} alignItems="center"><CircularProgress size={20} /><span>{t('clasificador.clasificando')}</span></Stack>
          )}
          {error && <Alert severity="error" data-testid="error-clasificacion">{error}</Alert>}
          {resultado && (
            <>
              <Alert severity="success" data-testid="resultado-clasificacion">
                {t('clasificador.resultado', { categoria: t(`categorias.${resultado.categoria}`), confianza: porcentaje(resultado.confianza) })}
                {' '}{t('clasificador.conModelo', { modelo: resultado.nombre, ms: numero(resultado.ms) })}
                {' '}{t('clasificador.aplicada')}
              </Alert>
              <Probabilidades prediccion={resultado} />
            </>
          )}
          {comparacion && (
            <Box data-testid="resultado-comparacion">
              <Typography variant="subtitle2" component="h3">{t('clasificador.comparacionTitulo')}</Typography>
              <TablaComparacion comparacion={comparacion} catalogo={catalogo} seleccionado={modelo} />
              <Typography variant="body2" sx={{ mt: 1 }}>{t('clasificador.aplicadaReferencia')}</Typography>
            </Box>
          )}
        </Box>
      </Stack>

      {catalogo && <MetricasModelos catalogo={catalogo} />}
    </Paper>
  );
}
