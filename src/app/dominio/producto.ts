export interface Producto {
  idProducto: number;
  idNegocio: number;
  nombreNegocio: string;
  idCategoria: number;
  nombreCategoria: string;
  nombre: string;
  descripcion: string;
  imagenUrl: string | null;
  precioNormal: number;
  precioDescuento: number;
  descuentoPorcentaje: number;
  stock: number;
  fechaPublicacion: string;
  fechaLimiteVenta: string;
  estadoPublicacion: string;
  activo: boolean;
}

export function ahorroDe(producto: Producto): number {
  return Number((producto.precioNormal - producto.precioDescuento).toFixed(2));
}

export function soles(valor: number | null | undefined): string {
  const numero = valor ?? 0;
  return `S/ ${Number(numero).toFixed(2)}`;
}

export function tieneImagen(producto: Producto): boolean {
  return (producto.imagenUrl ?? '').trim().length > 0;
}
