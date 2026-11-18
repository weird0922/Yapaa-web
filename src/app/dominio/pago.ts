export interface Pago {
  idPago: number;
  idPedido: number;
  codigoPedido: string;
  idCuentaRegistro: number;
  metodoPago: string;
  monto: number;
  estadoPago: string;
  referencia: string;
  fechaPago: string;
  fechaRegistro: string;
}
