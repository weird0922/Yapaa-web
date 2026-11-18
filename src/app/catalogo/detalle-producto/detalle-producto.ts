import { CuentaRegresiva } from '../cuenta-regresiva';
import { Reloj } from '../../core/reloj';
import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { ProductosApi } from '../productos-api';
import { mensajeDeError } from '../../core/api/errores';
import { Producto, ahorroDe, soles, tieneImagen } from '../../dominio/producto';
import { Carrito } from '../../carrito/carrito';
import { Sesion } from '../../core/auth/sesion';

@Component({
  selector: 'app-detalle-producto',
  imports: [RouterLink, DatePipe, CuentaRegresiva],
  templateUrl: './detalle-producto.html',
  styleUrl: './detalle-producto.css',
})
export class DetalleProducto implements OnInit {

  @Input() id = '';

  private productosApi = inject(ProductosApi);
  private carrito = inject(Carrito);
  private reloj=inject(Reloj);
  vencido():boolean{const p=this.producto();return p?this.reloj.vencido(p.fechaLimiteVenta):true;}
  puedeComprar():boolean{return !this.sesion.activa()||this.sesion.tieneRol('CLIENTE')&&!this.sesion.tieneRol('NEGOCIO');}
  private sesion = inject(Sesion);
  private router = inject(Router);

  producto = signal<Producto | null>(null);
  cantidad = signal(1);
  cargando = signal(false);
  error = signal('');
  aviso = signal('');

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const id = Number(this.id);
    if (!id) {
      this.error.set('No se indico el producto a mostrar.');
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    this.productosApi.uno(id).subscribe({
      next: respuesta => {
        this.producto.set(respuesta.datos);
        this.cargando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(mensajeDeError(e));
        this.cargando.set(false);
      },
    });
  }

  cambiarCantidad(delta: number): void {
    const producto = this.producto();
    if (!producto) {
      return;
    }
    const limite = Math.max(producto.stock, 1);
    const nueva = Math.min(Math.max(1, this.cantidad() + delta), limite);
    this.cantidad.set(nueva);
  }

  agregar(): void {
    const producto = this.producto();
    if (!producto) {
      return;
    }
    if (!this.sesion.activa()) {
      this.router.navigate(['/login'], {
        queryParams: { retorno: `/producto/${producto.idProducto}` },
      });
      return;
    }
    if(!this.puedeComprar()||this.vencido())return;
    this.carrito.agregar(producto, this.cantidad());
    this.aviso.set(`Agregaste ${this.cantidad()} x "${producto.nombre}" al carrito.`);
  }

  tieneDescuento(): boolean {
    const producto = this.producto();
    return producto !== null && producto.precioDescuento < producto.precioNormal;
  }

  ahorro(): number {
    const producto = this.producto();
    return producto ? ahorroDe(producto) : 0;
  }

  precio(valor: number): string {
    return soles(valor);
  }

  hayImagen(): boolean {
    const producto = this.producto();
    return producto !== null && tieneImagen(producto);
  }

  inicial(): string {
    const producto = this.producto();
    return producto ? producto.nombre.charAt(0).toUpperCase() : '?';
  }
}
