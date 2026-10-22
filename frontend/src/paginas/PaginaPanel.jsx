/**
 * @file PaginaPanel.jsx
 * @description Panel del administrador (HU-10, CA-10.1): cifras del inventario de lotes y del
 *              uso del clasificador público, con gráficas de barras de una sola serie (un color,
 *              sin leyenda), detalle al pasar el mouse o enfocar cada barra y los mismos datos
 *              en tabla para lectores de pantalla.
 * @fecha_creacion 2026-10-21
 * @actualizacion 2026-10-21
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { useCallback, useEffect, useState } from 'react';
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, LinearProgress, Paper, Stack, Table, TableBody,
  TableCell, TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import { obtenerEstadisticas } from '../api/servicios';
import { mensajeError } from '../api/cliente';
import { regional } from '../componentes/Modelos';

/**
 * Cifra destacada.
 * @param {{titulo: string, valor: number, testid: string}} props
 */
function Cifra({ titulo, valor, testid }) {
  const { i18n } = useTranslation();
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary">{titulo}</Typography>
      <Typography sx={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 }} data-testid={testid}>
        {new Intl.NumberFormat(regional(i18n.language)).format(valor)}
      </Typography>
    </Paper>
  );
}

/**
 * Datos de una gráfica en tabla (alternativa accesible).
 * @param {{filas: {etiqueta: string, valor: number}[], columna: string}} props
 */
function TablaDatos({ filas, columna }) {
  const { t } = useTranslation();
  return (
    <Accordion disableGutters elevation={0} sx={{ mt: 1, '&:before': { display: 'none' }, bgcolor: 'transparent' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 0 }}>
        <Typography variant="caption" color="text.secondary">{t('panel.verTabla')}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0 }}>
        <Table size="small">
          <TableHead><TableRow><TableCell>{columna}</TableCell><TableCell align="right">{t('panel.cantidad')}</TableCell></TableRow></TableHead>
          <TableBody>
            {filas.map((f) => (
              <TableRow key={f.etiqueta}><TableCell>{f.etiqueta}</TableCell><TableCell align="right">{f.valor}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </AccordionDetails>
    </Accordion>
  );
}

/**
 * Barras horizontales de una sola serie, con el valor escrito al final de cada barra.
 * @param {{titulo: string, filas: {etiqueta: string, valor: number}[], columna: string, testid: string}} props
 */
function Barras({ titulo, filas, columna, testid }) {
  const maximo = Math.max(1, ...filas.map((f) => f.valor));
  return (
    <Paper variant="outlined" sx={{ p: 2 }} component="section" aria-label={titulo} data-testid={testid}>
      <Typography variant="subtitle1" component="h2" fontWeight={600} sx={{ mb: 1.5 }}>{titulo}</Typography>
      <Box sx={{ display: 'grid', gap: '2px' }}>
        {filas.map((f) => (
          <Tooltip key={f.etiqueta} title={`${f.etiqueta}: ${f.valor}`} placement="top" followCursor>
            <Box tabIndex={0} role="img" aria-label={`${f.etiqueta}: ${f.valor}`}
              sx={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 30%) 1fr', alignItems: 'center', gap: 1, py: 0.5, borderRadius: 1,
                '&:hover, &:focus-visible': { bgcolor: 'action.hover' }, outlineColor: 'primary.main' }}>
              <Typography variant="body2" noWrap>{f.etiqueta}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <Box sx={{ height: 14, width: `${(f.valor / maximo) * 100}%`, minWidth: f.valor ? 4 : 0, bgcolor: 'primary.main', borderRadius: '0 4px 4px 0' }} />
                <Typography variant="body2" color="text.secondary">{f.valor}</Typography>
              </Box>
            </Box>
          </Tooltip>
        ))}
      </Box>
      <TablaDatos filas={filas} columna={columna} />
    </Paper>
  );
}

/**
 * Columnas por día (serie temporal de 14 días).
 * @param {{titulo: string, dias: {fecha: string, cantidad: number}[]}} props
 */
function ColumnasPorDia({ titulo, dias }) {
  const { t, i18n } = useTranslation();
  const maximo = Math.max(1, ...dias.map((d) => d.cantidad));
  const formato = new Intl.DateTimeFormat(regional(i18n.language), { day: 'numeric', month: 'short', timeZone: 'UTC' });
  const filas = dias.map((d) => ({ etiqueta: formato.format(new Date(`${d.fecha}T00:00:00Z`)), valor: d.cantidad }));
  return (
    <Paper variant="outlined" sx={{ p: 2 }} component="section" aria-label={titulo} data-testid="grafica-dias">
      <Typography variant="subtitle1" component="h2" fontWeight={600} sx={{ mb: 1.5 }}>{titulo}</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${filas.length}, 1fr)`, gap: '2px', alignItems: 'end', height: 160,
        borderBottom: 1, borderColor: 'divider' }}>
        {filas.map((f) => (
          <Tooltip key={f.etiqueta} title={`${f.etiqueta}: ${f.valor}`} placement="top">
            <Box tabIndex={0} role="img" aria-label={`${f.etiqueta}: ${f.valor}`}
              sx={{ height: '100%', display: 'flex', alignItems: 'flex-end', borderRadius: 1, '&:hover, &:focus-visible': { bgcolor: 'action.hover' } }}>
              <Box sx={{ width: '100%', height: `${(f.valor / maximo) * 100}%`, minHeight: f.valor ? 4 : 0, bgcolor: 'primary.main', borderRadius: '4px 4px 0 0' }} />
            </Box>
          </Tooltip>
        ))}
      </Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">{filas[0]?.etiqueta}</Typography>
        <Typography variant="caption" color="text.secondary">{filas[filas.length - 1]?.etiqueta}</Typography>
      </Stack>
      <TablaDatos filas={filas} columna={t('panel.dia')} />
    </Paper>
  );
}

export default function PaginaPanel() {
  const { t } = useTranslation();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      setDatos(await obtenerEstadisticas());
    } catch (e) {
      setError(mensajeError(e, t));
    } finally {
      setCargando(false);
    }
  }, [t]);

  useEffect(() => { cargar(); }, [cargar]);

  const porVariedad = (mapa) => Object.entries(mapa).map(([c, v]) => ({ etiqueta: t(`categorias.${c}`), valor: v }));
  const nombreModelo = (id) => {
    const modelo = { cnn_propia: 'CNN propia', efficientnetb0: 'EfficientNetB0', resnet50v2: 'ResNet50V2', vit_b16: 'ViT-B/16', deit_s: 'DeiT-S' }[id];
    if (modelo) return modelo;
    return id === 'ensamble' ? `${t('inicio.ensamble')} / ${t('panel.comparacion')}` : id;
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
        <Box>
          <Typography variant="h1">{t('panel.titulo')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{t('panel.explicacion')}</Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={cargar} disabled={cargando} data-testid="boton-actualizar">
          {t('panel.actualizar')}
        </Button>
      </Stack>
      {cargando && <LinearProgress aria-label={t('panel.cargando')} />}
      {error && <Alert severity="error" role="alert">{error}</Alert>}
      {datos && (
        <>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' } }}>
            <Cifra titulo={t('panel.lotesTotal')} valor={datos.lotes.total} testid="cifra-lotes" />
            <Cifra titulo={t('panel.lotesActivos')} valor={datos.lotes.activos} testid="cifra-activos" />
            <Cifra titulo={t('panel.lotesInactivos')} valor={datos.lotes.inactivos} testid="cifra-inactivos" />
            <Cifra titulo={t('panel.clasificacionesTotal')} valor={datos.clasificaciones.total} testid="cifra-clasificaciones" />
            <Cifra titulo={t('panel.clasificaciones7')} valor={datos.clasificaciones.ultimos7Dias} testid="cifra-7dias" />
          </Box>
          <ColumnasPorDia titulo={t('panel.clasifPorDia')} dias={datos.clasificaciones.porDia} />
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            <Barras titulo={t('panel.lotesPorVariedad')} filas={porVariedad(datos.lotes.porVariedad)} columna={t('campos.categoria')} testid="grafica-lotes" />
            <Barras titulo={t('panel.clasifPorVariedad')} filas={porVariedad(datos.clasificaciones.porVariedad)} columna={t('campos.categoria')} testid="grafica-variedades" />
          </Box>
          {Object.keys(datos.clasificaciones.porModelo).length > 0 ? (
            <Barras titulo={t('panel.porModelo')} columna={t('clasificador.col.modelo')} testid="grafica-modelos"
              filas={Object.entries(datos.clasificaciones.porModelo).map(([m, v]) => ({ etiqueta: nombreModelo(m), valor: v }))} />
          ) : (
            <Alert severity="info" data-testid="sin-clasificaciones">{t('panel.sinClasificaciones')}</Alert>
          )}
        </>
      )}
    </Stack>
  );
}
