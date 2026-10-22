/**
 * @file PaginaInicio.jsx
 * @description Página pública (HU-06): cualquier visitante, sin cuenta, sube la foto de un grano
 *              o prueba con una de ejemplo y ve la variedad, qué tan seguro está el modelo y una
 *              descripción de la variedad. Las opciones avanzadas permiten elegir el modelo o
 *              comparar los 5 (CA-06.6, CA-06.7). Si quien clasifica es del equipo, puede
 *              registrar el resultado como lote. En el plan gratuito los servicios se duermen: si
 *              la API responde 502/503/504 o no responde, se reintenta solo hasta ~2 minutos
 *              mientras se avisa que el servicio se está activando.
 * @fecha_creacion 2026-10-21
 * @actualizacion 2026-10-21
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.1.0
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, ButtonBase, Card, CardContent, CircularProgress,
  LinearProgress, MenuItem, Paper, Stack, TextField, Typography,
} from '@mui/material';
import AddBoxIcon from '@mui/icons-material/AddBox';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { clasificarFoto, compararModelos, listarModelos } from '../api/servicios';
import { mensajeError } from '../api/cliente';
import { useAuth } from '../auth/AuthContexto';
import { CATEGORIAS, TIPOS_IMAGEN, validarFoto } from '../validacion/esquemas';
import { ENSAMBLE, MetricasModelos, Probabilidades, TablaComparacion, numero, porcentaje } from '../componentes/Modelos';

/** Desde cuántos ms de espera se avisa que el servidor gratuito puede estar despertando. */
const AVISO_LENTO_MS = 4000;

/** Reintentos mientras el servicio despierta: cada 8 s, hasta 15 intentos (~2 min). */
export const REINTENTO = { esperaMs: 8000, intentos: 15 };

/**
 * Errores pasajeros del plan gratuito mientras un servicio se activa.
 * @param {unknown} e error de axios
 * @returns {boolean}
 */
export const esTemporal = (e) => !e?.response || [502, 503, 504].includes(e.response.status);

/**
 * Ejecuta una petición y la repite mientras falle con un error pasajero.
 * @template T
 * @param {function(): Promise<T>} peticion
 * @param {function(number): void} [alReintentar] recibe el número de intento fallido
 * @returns {Promise<T>}
 */
export async function conReintentos(peticion, alReintentar = () => {}) {
  for (let intento = 1; ; intento += 1) {
    try {
      return await peticion();
    } catch (e) {
      if (intento >= REINTENTO.intentos || !esTemporal(e)) throw e;
      alReintentar(intento);
      await new Promise((listo) => { setTimeout(listo, REINTENTO.esperaMs); });
    }
  }
}

/**
 * Nivel de seguridad de la predicción.
 * @param {number} confianza probabilidad entre 0 y 1
 * @returns {'alto'|'medio'|'bajo'}
 */
export function nivelConfianza(confianza) {
  if (confianza >= 0.9) return 'alto';
  if (confianza >= 0.6) return 'medio';
  return 'bajo';
}

const SEVERIDAD = { alto: 'success', medio: 'info', bajo: 'warning' };

/** Los tres pasos de uso. */
function Pasos() {
  const { t } = useTranslation();
  return (
    <Box component="ol" aria-label={t('inicio.pasosTitulo')}
      sx={{ listStyle: 'none', p: 0, m: 0, display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' } }}>
      {[1, 2, 3].map((n) => (
        <Box component="li" key={n} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <Box aria-hidden sx={{
            flex: '0 0 32px', height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center',
            bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 700,
          }}>{n}</Box>
          <Box>
            <Typography variant="subtitle2" component="p">{t(`inicio.paso${n}Titulo`)}</Typography>
            <Typography variant="body2" color="text.secondary">{t(`inicio.paso${n}`)}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

/**
 * Zona para arrastrar o elegir la foto, con las fotos de ejemplo.
 * @param {{alElegir: function(File): void, ocupado: boolean}} props
 */
function ZonaFoto({ alElegir, ocupado }) {
  const { t } = useTranslation();
  const [encima, setEncima] = useState(false);

  const soltar = (e) => {
    e.preventDefault();
    setEncima(false);
    if (!ocupado && e.dataTransfer.files?.[0]) alElegir(e.dataTransfer.files[0]);
  };

  const probarEjemplo = async (variedad) => {
    const respuesta = await fetch(`/muestras/${variedad.toLowerCase()}.jpg`);
    const blob = await respuesta.blob();
    alElegir(new File([blob], `${variedad.toLowerCase()}.jpg`, { type: 'image/jpeg' }));
  };

  return (
    <Stack spacing={2}>
      <Box
        onDragOver={(e) => { e.preventDefault(); setEncima(true); }}
        onDragLeave={() => setEncima(false)}
        onDrop={soltar}
        data-testid="zona-foto"
        sx={{
          border: 2, borderStyle: 'dashed', borderRadius: 2, p: { xs: 3, sm: 4 }, textAlign: 'center',
          borderColor: encima ? 'primary.main' : 'divider', bgcolor: encima ? 'action.hover' : 'transparent',
          transition: 'background-color .15s, border-color .15s',
        }}
      >
        <CloudUploadIcon color="primary" sx={{ fontSize: 48 }} aria-hidden />
        <Typography variant="h2" component="h2" sx={{ mt: 1 }}>{t('inicio.subirTitulo')}</Typography>
        <Typography sx={{ mt: 1, display: { xs: 'none', sm: 'block' } }}>{t('inicio.arrastrar')}</Typography>
        <Button component="label" variant="contained" size="large" disabled={ocupado} sx={{ mt: 1 }} data-testid="boton-elegir">
          {t('inicio.elegir')}
          <input hidden type="file" accept={TIPOS_IMAGEN.join(',')} data-testid="input-foto"
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) alElegir(f); }} />
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{t('inicio.formatos')}</Typography>
        <Typography variant="body2" color="text.secondary">{t('inicio.consejo')}</Typography>
      </Box>

      <Box>
        <Typography variant="body2" sx={{ mb: 1 }}>{t('inicio.ejemplos')}</Typography>
        <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
          {CATEGORIAS.map((c) => (
            <ButtonBase
              key={c}
              onClick={() => probarEjemplo(c)}
              disabled={ocupado}
              aria-label={t('inicio.ejemplo', { variedad: t(`categorias.${c}`) })}
              data-testid={`ejemplo-${c}`}
              sx={{ flexDirection: 'column', borderRadius: 1, p: 0.5, border: 1, borderColor: 'divider', '&:hover': { borderColor: 'primary.main' } }}
            >
              <Box component="img" src={`/muestras/${c.toLowerCase()}.jpg`} alt="" sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 0.5, bgcolor: 'common.black' }} />
              <Typography variant="caption" sx={{ mt: 0.5 }}>{t(`categorias.${c}`)}</Typography>
            </ButtonBase>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}

/**
 * Tarjeta con el resultado principal.
 * @param {{resultado: object, vista: string, alReiniciar: function(): void}} props
 */
function Resultado({ resultado, vista, alReiniciar }) {
  const { t, i18n } = useTranslation();
  const { sesion } = useAuth();
  const navegar = useNavigate();
  const nivel = nivelConfianza(resultado.confianza);
  const variedad = t(`categorias.${resultado.categoria}`);

  return (
    <Card variant="outlined" component="section" aria-labelledby="resultado-titulo" data-testid="resultado-clasificacion">
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-start' }}>
          <Box component="img" src={vista} alt={t('inicio.tuFoto')}
            sx={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 1, bgcolor: 'common.black', flexShrink: 0 }} />
          <Box sx={{ flexGrow: 1, minWidth: 0, width: '100%' }}>
            <Typography variant="overline" color="text.secondary">{t('inicio.resultadoTitulo')}</Typography>
            <Typography id="resultado-titulo" variant="h2" component="h2" sx={{ fontSize: '1.9rem' }}>
              {t('inicio.esVariedad')} <Box component="strong" sx={{ color: 'primary.main' }} data-testid="variedad">{variedad}</Box>
            </Typography>
            <Box sx={{ mt: 1.5 }}>
              <LinearProgress variant="determinate" value={resultado.confianza * 100} color={SEVERIDAD[nivel]}
                aria-label={t('inicio.seguridad', { valor: porcentaje(resultado.confianza, i18n.language) })}
                sx={{ height: 10, borderRadius: 5 }} />
              <Typography variant="body2" sx={{ mt: 0.5 }} data-testid="seguridad">
                {t('inicio.seguridad', { valor: porcentaje(resultado.confianza, i18n.language) })}
              </Typography>
            </Box>
            <Alert severity={SEVERIDAD[nivel]} sx={{ mt: 1.5 }} data-testid={`nivel-${nivel}`}>{t(`inicio.nivel.${nivel}`)}</Alert>
            <Typography sx={{ mt: 1.5 }}>{t(`variedades.${resultado.categoria}`)}</Typography>
            <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1 }}>
              {t('inicio.analizadoCon', { modelo: resultado.nombre, segundos: numero((resultado.ms || 0) / 1000, 2) })}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
              <Button variant="contained" startIcon={<RestartAltIcon />} onClick={alReiniciar} data-testid="boton-otra">
                {t('inicio.otraFoto')}
              </Button>
              {sesion && (
                <Button variant="outlined" startIcon={<AddBoxIcon />} data-testid="boton-registrar"
                  onClick={() => navegar('/equipo/lotes/nuevo', { state: { categoria: resultado.categoria, confianza: resultado.confianza } })}>
                  {t('inicio.registrarLote')}
                </Button>
              )}
            </Stack>
          </Box>
        </Stack>
        <Accordion disableGutters variant="outlined" sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="detalle-contenido" id="detalle-encabezado">
            <Typography variant="body2">{t('inicio.detalle')}</Typography>
          </AccordionSummary>
          <AccordionDetails id="detalle-contenido"><Probabilidades prediccion={resultado} /></AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
}

export default function PaginaInicio() {
  const { t, i18n } = useTranslation();
  const [catalogo, setCatalogo] = useState(null);
  const [activando, setActivando] = useState(false);
  const [modelo, setModelo] = useState('');
  const [foto, setFoto] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [lento, setLento] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null);
  const [comparacion, setComparacion] = useState(null);
  const [comparando, setComparando] = useState(false);
  const zona = useRef(null);

  useEffect(() => {
    // Pedir el catálogo al abrir la página también despierta los servicios dormidos. Sin catálogo
    // igual se puede clasificar con el modelo por defecto.
    let vigente = true;
    conReintentos(listarModelos, () => { if (vigente) setActivando(true); })
      .then((c) => { if (vigente) { setCatalogo(c); setModelo(c.modelo_por_defecto); } })
      .catch(() => {})
      .finally(() => { if (vigente) setActivando(false); });
    return () => { vigente = false; };
  }, []);

  useEffect(() => () => { if (foto?.vista) URL.revokeObjectURL(foto.vista); }, [foto]);

  useEffect(() => {
    if (!cargando) { setLento(false); return undefined; }
    const id = setTimeout(() => setLento(true), AVISO_LENTO_MS);
    return () => clearTimeout(id);
  }, [cargando]);

  const clasificar = useCallback(async (archivo, modeloActual) => {
    setCargando(true);
    setError('');
    setResultado(null);
    setComparacion(null);
    try {
      setResultado(await conReintentos(() => clasificarFoto(archivo, modeloActual || undefined), () => setLento(true)));
    } catch (e) {
      setError(mensajeError(e, t));
    } finally {
      setCargando(false);
    }
  }, [t]);

  const alElegir = (archivo) => {
    const problema = validarFoto(archivo, t);
    if (problema) {
      setResultado(null);
      setComparacion(null);
      setError(problema);
      return;
    }
    setFoto({ archivo, vista: URL.createObjectURL(archivo) });
    clasificar(archivo, modelo);
  };

  const reiniciar = () => {
    setFoto(null);
    setResultado(null);
    setComparacion(null);
    setError('');
    zona.current?.scrollIntoView?.({ behavior: 'smooth' });
  };

  const cambiarModelo = (e) => {
    setModelo(e.target.value);
    if (foto) clasificar(foto.archivo, e.target.value);
  };

  const comparar = async () => {
    setComparando(true);
    setError('');
    try {
      setComparacion(await conReintentos(() => compararModelos(foto.archivo)));
    } catch (e) {
      setError(mensajeError(e, t));
    } finally {
      setComparando(false);
    }
  };

  const opciones = [
    ...(catalogo?.modelos || []).map((m) => ({
      id: m.id,
      etiqueta: `${m.nombre} · ${porcentaje(m.accuracy_test, i18n.language, 2)}${m.id === catalogo.modelo_por_defecto ? ` (${t('inicio.recomendado')})` : ''}`,
    })),
    ...(catalogo?.ensamble_disponible ? [{ id: ENSAMBLE, etiqueta: t('inicio.ensamble') }] : []),
  ];

  return (
    <Stack spacing={3}>
      <Box component="header">
        <Typography variant="h1" sx={{ fontSize: { xs: '1.9rem', sm: '2.4rem' } }}>{t('inicio.titulo')}</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 720, fontSize: '1.05rem' }}>{t('inicio.subtitulo')}</Typography>
      </Box>

      <Pasos />

      {catalogo?.es_prueba && <Alert severity="warning" data-testid="aviso-prueba">{t('clasificador.avisoPrueba')}</Alert>}
      {activando && !cargando && (
        <Alert severity="info" icon={<CircularProgress size={18} />} data-testid="activando">{t('inicio.activando')}</Alert>
      )}

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }} ref={zona}>
        {!foto || error ? (
          <ZonaFoto alElegir={alElegir} ocupado={cargando} />
        ) : null}
        <Box aria-live="polite" sx={{ mt: !foto || error ? 2 : 0 }}>
          {cargando && (
            <Stack spacing={1} alignItems="center" sx={{ py: 3 }} data-testid="analizando">
              {foto && <Box component="img" src={foto.vista} alt={t('inicio.tuFoto')} sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1, bgcolor: 'common.black' }} />}
              <Stack direction="row" spacing={1} alignItems="center"><CircularProgress size={22} /><span>{t('inicio.analizando')}</span></Stack>
              {lento && <Typography variant="body2" color="text.secondary">{t('inicio.despertando')}</Typography>}
            </Stack>
          )}
          {error && <Alert severity="error" data-testid="error-clasificacion">{error}</Alert>}
          {resultado && foto && <Resultado resultado={resultado} vista={foto.vista} alReiniciar={reiniciar} />}
        </Box>
      </Paper>

      <Accordion disableGutters variant="outlined" data-testid="opciones-avanzadas">
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="avanzadas-contenido" id="avanzadas-encabezado">
          <Typography fontWeight={600}>{t('inicio.avanzadas')}</Typography>
        </AccordionSummary>
        <AccordionDetails id="avanzadas-contenido">
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">{t('inicio.avanzadasTexto')}</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
              <TextField
                select size="small" label={t('inicio.modelo')} sx={{ maxWidth: { md: 380 } }}
                value={opciones.some((o) => o.id === modelo) ? modelo : ''}
                onChange={cambiarModelo} disabled={!catalogo || cargando}
                SelectProps={{ 'data-testid': 'select-modelo' }}
              >
                {opciones.map((o) => <MenuItem key={o.id} value={o.id}>{o.etiqueta}</MenuItem>)}
              </TextField>
              <Button variant="outlined" onClick={comparar} disabled={!foto || cargando || comparando} data-testid="boton-comparar"
                sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                {t('inicio.comparar')}
              </Button>
            </Stack>
            {comparando && <Stack direction="row" spacing={1} alignItems="center"><CircularProgress size={18} /><span>{t('inicio.comparando')}</span></Stack>}
            {comparacion && <TablaComparacion comparacion={comparacion} catalogo={catalogo} />}
            {catalogo && <MetricasModelos catalogo={catalogo} />}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Box component="section" aria-labelledby="como-funciona">
        <Typography id="como-funciona" variant="h2" sx={{ mb: 1 }}>{t('inicio.comoFunciona')}</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 820 }}>{t('inicio.comoFuncionaTexto')}</Typography>
      </Box>
    </Stack>
  );
}
