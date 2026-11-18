export interface DetallePedido {
  idDetalle: number;
  idProducto: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PedidoNegocio {
  idPedidoNegocio: number;
  idNegocio: number;
  nombreNegocio: string;
  telefonoContacto: string;
  modalidadEntrega: string;
  direccionEntrega: string;
  costoDelivery: number;
  subtotalProductos: number;
  total: number;
  estado: string;
  fechaRecojoProgramada: string;
  mensaje: string;
  enlaceWhatsApp: string;
  detalles: DetallePedido[];
}

export interface Pedido {
  idPedido: number;
  codigoPedido: string;
  fechaPedido: string;
  idCuenta: number;
  correoCliente: string;
  subtotalProductos: number;
  costoDeliveryTotal: number;
  total: number;
  estadoPedido: string;
  estadoPago: string;
  pedidosNegocio: PedidoNegocio[];
}

export interface ItemPedidoRequest {
  idProducto: number;
  cantidad: number;
}

export interface GrupoPedidoRequest {
  idNegocio: number;
  modalidadEntrega: string;
  direccionEntrega?: string;
  costoDelivery?: number;
  items: ItemPedidoRequest[];
}

export interface PeticionPedido {
  grupos: GrupoPedidoRequest[];
}

export interface PeticionPago {
  metodoPago: string;
  referencia?: string;
}

export const ESTADOS_PEDIDO: string[] = [
  'PENDIENTE',
  'CONFIRMADO',
  'EN_PREPARACION',
  'LISTO',
  'EN_CAMINO',
  'COMPLETADO',
  'CANCELADO',
];

export const METODOS_PAGO: string[] = [
  'EFECTIVO',
  'TRANSFERENCIA',
  'YAPE',
  'PLIN',
  'TARJETA',
  'OTRO',
];
