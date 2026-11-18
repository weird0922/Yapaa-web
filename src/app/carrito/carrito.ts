import { Service, signal } from '@angular/core';
import { Producto } from '../dominio/producto';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

@Service()
export class Carrito {

  private items = signal<ItemCarrito[]>([]);

  readonly lista = this.items.asReadonly();

  agregar(producto: Producto, cantidad = 1): void {
    const actuales = this.items();
    const existente = actuales.find(item => item.producto.idProducto === producto.idProducto);

    if (existente) {
      this.items.set(
        actuales.map(item =>
          item.producto.idProducto === producto.idProducto
            ? { producto: item.producto, cantidad: item.cantidad + cantidad }
            : item,
        ),
      );
      return;
    }
    this.items.set([...actuales, { producto, cantidad }]);
  }

  cambiarCantidad(idProducto: number, cantidad: number): void {
    if (cantidad <= 0) {
      this.quitar(idProducto);
      return;
    }
    this.items.set(
      this.items().map(item =>
        item.producto.idProducto === idProducto ? { producto: item.producto, cantidad } : item,
      ),
    );
  }

  quitar(idProducto: number): void {
    this.items.set(this.items().filter(item => item.producto.idProducto !== idProducto));
  }

  limpiar(): void {
    this.items.set([]);
  }

  vacio(): boolean {
    return this.items().length === 0;
  }

  cantidadTotal(): number {
    return this.items().reduce((total, item) => total + item.cantidad, 0);
  }

  subtotal(): number {
    return this.items().reduce(
      (total, item) => total + item.producto.precioDescuento * item.cantidad,
      0,
    );
  }

  cantidadNegocios(): number {
    return new Set(this.items().map(item => item.producto.idNegocio)).size;
  }
}
