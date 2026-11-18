import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Carrito, ItemCarrito } from '../carrito';
import { PedidosApi } from '../../pedidos/pedidos-api';
import { mensajeDeError } from '../../core/api/errores';
import { soles } from '../../dominio/producto';
import { Pedido, PeticionPedido } from '../../dominio/pedido';

interface GrupoCarrito {
  idNegocio: number;
  nombreNegocio: string;
  items: ItemCarrito[];
  subtotal: number;
}

interface OpcionEntrega {
  modalidad: string;
  direccion: string;
  costoDelivery: number;
}

const ENTREGA_POR_DEFECTO: OpcionEntrega = { modalidad: 'RECOJO', direccion: '', costoDelivery: 0 };

@Component({
  selector: 'app-lista-carrito',
  imports: [RouterLink],
  templateUrl: './lista-carrito.html',
  styleUrl: './lista-carrito.css',
})
export class ListaCarrito {

  private carrito = inject(Carrito);
  private pedidosApi = inject(PedidosApi);


  opciones = signal<Record<number, OpcionEntrega>>({});
  pedidoCreado = signal<Pedido | null>(null);

  generando = signal(false);
  error = signal('');

  grupos = computed<GrupoCarrito[]>(() => {
    const mapa = new Map<number, GrupoCarrito>();
    for (const item of this.carrito.lista()) {
      const existente = mapa.get(item.producto.idNegocio);
      const importe = item.producto.precioDescuento * item.cantidad;
      if (existente) {
        existente.items = [...existente.items, item];
        existente.subtotal += importe;
      } else {
        mapa.set(item.producto.idNegocio, {
          idNegocio: item.producto.idNegocio,
          nombreNegocio: item.producto.nombreNegocio,
          items: [item],
          subtotal: importe,
        });
      }
    }
    return Array.from(mapa.values());
  });

  subtotal = computed(() => this.carrito.subtotal());

  costoDeliveryTotal = computed(() =>
    this.grupos().reduce((total, grupo) => total + this.opcionDe(grupo.idNegocio).costoDelivery, 0),
  );

  total = computed(() => this.subtotal() + this.costoDeliveryTotal());

  vacio = computed(() => this.carrito.lista().length === 0);

  precio(valor: number): string {
    return soles(valor);
  }

  opcionDe(idNegocio: number): OpcionEntrega {
    return this.opciones()[idNegocio] ?? ENTREGA_POR_DEFECTO;
  }

  private actualizarOpcion(idNegocio: number, cambios: Partial<OpcionEntrega>): void {
    const actual = this.opcionDe(idNegocio);
    this.opciones.set({ ...this.opciones(), [idNegocio]: { ...actual, ...cambios } });
  }

  private valorDe(evento: Event): string {
    return (evento.target as HTMLInputElement | HTMLSelectElement).value;
  }

  cambiarModalidad(idNegocio: number, evento: Event): void {
    const modalidad = this.valorDe(evento);
    this.actualizarOpcion(idNegocio, {
      modalidad,
      costoDelivery: modalidad === 'RECOJO' ? 0 : this.opcionDe(idNegocio).costoDelivery,
    });
  }

  cambiarDireccion(idNegocio: number, evento: Event): void {
    this.actualizarOpcion(idNegocio, { direccion: this.valorDe(evento) });
  }

  cambiarCosto(idNegocio: number, evento: Event): void {
    const valor = Number(this.valorDe(evento));
    this.actualizarOpcion(idNegocio, { costoDelivery: Number.isNaN(valor) ? 0 : valor });
  }

  cambiarCantidad(idProducto: number, cantidad: number): void {
    this.carrito.cambiarCantidad(idProducto, cantidad);
  }

  quitar(idProducto: number): void {
    this.carrito.quitar(idProducto);
  }

  generarPedido(): void {
    if (this.vacio()||this.generando()) {
      return;
    }
    const deliverySinDireccion = this.grupos().some(
      grupo => this.opcionDe(grupo.idNegocio).modalidad === 'DELIVERY' && !this.opcionDe(grupo.idNegocio).direccion.trim(),
    );
    if (deliverySinDireccion) {
      this.error.set('Ingresa la direccion de entrega para los negocios con modalidad DELIVERY.');
      return;
    }

    const peticion: PeticionPedido = {
      grupos: this.grupos().map(grupo => {
        const opcion = this.opcionDe(grupo.idNegocio);
        return {
          idNegocio: grupo.idNegocio,
          modalidadEntrega: opcion.modalidad,
          direccionEntrega: opcion.modalidad === 'DELIVERY' ? opcion.direccion.trim() : undefined,
          costoDelivery: opcion.costoDelivery,
          items: grupo.items.map(item => ({
            idProducto: item.producto.idProducto,
            cantidad: item.cantidad,
          })),
        };
      }),
    };

    this.generando.set(true);
    this.error.set('');
    this.pedidosApi.crear(peticion).subscribe({
      next: respuesta => {
        this.pedidoCreado.set(respuesta.datos);
        this.carrito.limpiar();
        this.opciones.set({});
        this.generando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(mensajeDeError(e));
        this.generando.set(false);
      },
    });
  }

}
