import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { NegociosApi } from '../negocios-api';
import { ProductosApi } from '../../catalogo/productos-api';
import { mensajeDeError } from '../../core/api/errores';
import { Negocio } from '../../dominio/negocio';
import { Producto } from '../../dominio/producto';
import { Paginador } from '../../core/layout/paginador/paginador';
import { TarjetaProducto } from '../../catalogo/tarjeta-producto/tarjeta-producto';
import { Carrito } from '../../carrito/carrito';
import { Sesion } from '../../core/auth/sesion';

@Component({
  selector: 'app-detalle-negocio',
  imports: [RouterLink, Paginador, TarjetaProducto],
  templateUrl: './detalle-negocio.html',
  styleUrl: './detalle-negocio.css',
})
export class DetalleNegocio implements OnInit {

  @Input() id = '';

  private negociosApi = inject(NegociosApi);
  private productosApi = inject(ProductosApi);
  private carrito = inject(Carrito);
  private sesion = inject(Sesion);
  private router = inject(Router);

  readonly tamano = 8;

  negocio = signal<Negocio | null>(null);
  productos = signal<Producto[]>([]);
  pagina = signal(0);
  totalPaginas = signal(0);
  totalElementos = signal(0);
  cargando = signal(false);
  error = signal('');
  aviso = signal('');

  ngOnInit(): void {
    this.cargarNegocio();
    this.cargarProductos(0);
  }

  cargarNegocio(): void {
    const id = Number(this.id);
    if (!id) {
      this.error.set('No se indico el negocio a mostrar.');
      return;
    }
    this.negociosApi.uno(id).subscribe({
      next: respuesta => this.negocio.set(respuesta.datos),
      error: (e: HttpErrorResponse) => this.error.set(mensajeDeError(e)),
    });
  }

  cargarProductos(pagina: number): void {
    const idNegocio = Number(this.id);
    if (!idNegocio) {
      return;
    }
    this.cargando.set(true);
    this.productosApi.porNegocio(idNegocio, pagina, this.tamano).subscribe({
      next: respuesta => {
        const datos = respuesta.datos;
        this.productos.set(datos.content);
        this.pagina.set(datos.number);
        this.totalPaginas.set(datos.totalPages);
        this.totalElementos.set(datos.totalElements);
        this.cargando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(mensajeDeError(e));
        this.productos.set([]);
        this.totalPaginas.set(0);
        this.totalElementos.set(0);
        this.cargando.set(false);
      },
    });
  }

  cambiarPagina(pagina: number): void {
    this.cargarProductos(pagina);
  }

  agregar(producto: Producto): void {
    if (!this.sesion.activa()) {
      this.router.navigate(['/login'], { queryParams: { retorno: `/negocios/${this.id}` } });
      return;
    }
    this.carrito.agregar(producto);
    this.aviso.set(`Agregaste "${producto.nombre}" al carrito.`);
  }

  ubicacion(): string {
    const negocio = this.negocio();
    if (!negocio) {
      return '';
    }
    return [negocio.distrito, negocio.ciudad].filter(valor => !!valor).join(', ');
  }
}
