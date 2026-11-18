import { HttpErrorResponse } from '@angular/common/http';
import { Resultado } from './resultado';

/**
 * Regla de errores del frontend YAPAA.
 *
 * 1. El mensaje que ve el cliente siempre esta en espanol y describe la situacion.
 * 2. Solo se confia en el mensaje enviado por la API en errores de cliente (4xx); nunca en 5xx.
 * 3. Si el mensaje del backend parece contener detalles tecnicos, se descarta.
 * 4. Cualquier error no reconocido cae en un mensaje generico.
 */

const SIN_CONEXION =
  'No hay conexion con el servicio YAPAA. Verifica que la API este en ejecucion.';
const MENSAJE_GENERICO =
  'Ocurrio un error inesperado. Vuelve a intentarlo en unos instantes.';

const MAX_LARGO_MENSAJE = 300;

const PATRON_TECNICO =
  /exception|sqlserver|sqlstate|jdbc|java\.|jakarta|org\.spring|hibernate|stack|trace|nullpointer|\bat\s+\S+\(|select\s+.+\s+from|<[a-z!/][^>]*>/i;

function pareceMensajeTecnico(mensaje: string): boolean {
  return mensaje.includes('\n') || mensaje.includes('\r') || PATRON_TECNICO.test(mensaje);
}

function mensajeSeguroDelBackend(error: HttpErrorResponse): string | null {
  if (error.status < 400 || error.status >= 500) {
    return null;
  }
  const cuerpo = error.error;
  if (!cuerpo || typeof cuerpo !== 'object') {
    return null;
  }
  const mensaje = (cuerpo as Resultado<unknown>).mensaje;
  if (typeof mensaje !== 'string') {
    return null;
  }
  const limpio = mensaje.trim();
  if (limpio.length === 0 || limpio.length > MAX_LARGO_MENSAJE || pareceMensajeTecnico(limpio)) {
    return null;
  }
  return limpio;
}

export function mensajeDeError(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return SIN_CONEXION;
  }
  if (error.status === 401) {
    return 'Tu sesion no es valida o ha vencido. Inicia sesion nuevamente.';
  }
  if (error.status === 403) {
    return 'No tienes permisos para realizar esta accion.';
  }

  const delBackend = mensajeSeguroDelBackend(error);
  if (delBackend !== null) {
    return delBackend;
  }

  switch (error.status) {
    case 400:
      return 'Los datos enviados no son validos. Revisa el formulario.';
    case 404:
      return 'No se encontro el recurso solicitado.';
    case 405:
      return 'La accion solicitada no esta permitida.';
    case 409:
      return 'La operacion entra en conflicto con datos existentes.';
    case 422:
      return 'Los datos enviados no pudieron procesarse.';
    case 429:
      return 'Demasiadas solicitudes. Espera un momento e intentalo de nuevo.';
    default:
      return MENSAJE_GENERICO;
  }
}
