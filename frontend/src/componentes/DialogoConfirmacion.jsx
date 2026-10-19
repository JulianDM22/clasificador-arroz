/**
 * @file DialogoConfirmacion.jsx
 * @description Diálogo que pide confirmación antes de una acción irreversible, como eliminar
 *              un producto (CA-05.3).
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

/**
 * @param {Object} props
 * @param {boolean} props.abierto si el diálogo se muestra
 * @param {string} props.titulo título
 * @param {string} props.texto explicación de la consecuencia
 * @param {string} props.textoConfirmar texto del botón de confirmación
 * @param {string} props.textoCancelar texto del botón de cancelación
 * @param {function(): void} props.alConfirmar acción al confirmar
 * @param {function(): void} props.alCancelar acción al cancelar o cerrar
 * @param {boolean} [props.ocupado] desactiva los botones mientras se procesa
 */
export default function DialogoConfirmacion({ abierto, titulo, texto, textoConfirmar, textoCancelar, alConfirmar, alCancelar, ocupado = false }) {
  return (
    <Dialog open={abierto} onClose={alCancelar} aria-labelledby="dialogo-titulo" aria-describedby="dialogo-texto">
      <DialogTitle id="dialogo-titulo">{titulo}</DialogTitle>
      <DialogContent>
        <DialogContentText id="dialogo-texto">{texto}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={alCancelar} disabled={ocupado} autoFocus>{textoCancelar}</Button>
        <Button onClick={alConfirmar} disabled={ocupado} color="error" variant="contained" data-testid="confirmar-eliminar">
          {textoConfirmar}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
