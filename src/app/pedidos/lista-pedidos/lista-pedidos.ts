import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { PedidosApi } from '../pedidos-api';
import { Sesion } from '../../core/auth/sesion';
import { mensajeDeError } from '../../core/api/errores';
import { Pedido } from '../../dominio/pedido';
import { soles } from '../../dominio/producto';
import { Paginador } from '../../core/layout/paginador/paginador';

@Component({
  selector: 'app-lista-pedidos',
  imports: [RouterLink, Paginador],
  templateUrl: './lista-pedidos.html',
  styleUrl: './lista-pedidos.css',
})
export class ListaPedidos implements OnInit {

  private pedidosApi = inject(PedidosApi);
  private sesion = inject(Sesion);

  readonly tamano = 8;

  pedidos = signal<Pedido[]>([]);
  pagina = signal(0);
  totalPaginas = signal(0);
  totalElementos = signal(0);
  cargando = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.cargar(0);
  }

  cargar(pagina: number): void {
    const idCuenta = this.sesion.idCuenta();
    if (idCuenta === null) {
      this.error.set('No se encontro la cuenta de la sesion.');
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    this.pedidosApi.porCuenta(idCuenta, pagina, this.tamano).subscribe({
      next: respuesta => {
        const datos = respuesta.datos;
        this.pedidos.set(datos.content);
        this.pagina.set(datos.number);
        this.totalPaginas.set(datos.totalPages);
        this.totalElementos.set(datos.totalElements);
        this.cargando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(mensajeDeError(e));
        this.pedidos.set([]);
        this.totalPaginas.set(0);
        this.totalElementos.set(0);
        this.cargando.set(false);
      },
    });
  }

  cambiarPagina(pagina: number): void {
    this.cargar(pagina);
  }

  resumen(pedido: Pedido): string {
    const cantidad = pedido.pedidosNegocio.reduce(
      (total, grupo) => total + grupo.detalles.length,
      0,
    );
    return `${pedido.pedidosNegocio.length} negocio(s) · ${cantidad} producto(s)`;
  }

  precio(valor: number): string {
    return soles(valor);
  }
}
