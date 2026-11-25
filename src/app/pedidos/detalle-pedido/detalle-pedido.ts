import { PagoSimulado } from '../pago-simulado';
import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { PedidosApi } from '../pedidos-api';
import { mensajeDeError } from '../../core/api/errores';
import { Pedido } from '../../dominio/pedido';
import { soles } from '../../dominio/producto';

@Component({
  selector: 'app-detalle-pedido',
  imports: [PagoSimulado,RouterLink],
  templateUrl: './detalle-pedido.html',
  styleUrl: './detalle-pedido.css',
})
export class DetallePedido implements OnInit {

  @Input() id = '';

  private pedidosApi = inject(PedidosApi);

  pedido = signal<Pedido | null>(null);
  cargando = signal(false);
  error = signal('');

  ngOnInit(): void {
    const id = Number(this.id);
    if (!id) {
      this.error.set('No se indico el pedido a mostrar.');
      return;
    }
    this.cargarPedido(id);
  }

  cargarPedido(id: number): void {
    this.cargando.set(true);
    this.error.set('');
    this.pedidosApi.uno(id).subscribe({
      next: respuesta => {
        this.pedido.set(respuesta.datos);
        this.cargando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(mensajeDeError(e));
        this.cargando.set(false);
      },
    });
  }

  precio(valor: number): string {
    return soles(valor);
  }
}
