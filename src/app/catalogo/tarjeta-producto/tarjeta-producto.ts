import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { CuentaRegresiva } from '../cuenta-regresiva';
import { Reloj } from '../../core/reloj';
import { Sesion } from '../../core/auth/sesion';
import { RouterLink } from '@angular/router';
import { Producto, ahorroDe, soles, tieneImagen } from '../../dominio/producto';

@Component({
  selector: 'app-tarjeta-producto',
  imports: [RouterLink, CuentaRegresiva],
  templateUrl: './tarjeta-producto.html',
  styleUrl: './tarjeta-producto.css',
})
export class TarjetaProducto implements OnChanges {

  imagenFallida = false;
  private reloj=inject(Reloj);
  private sesion=inject(Sesion);
  vencido():boolean{return this.reloj.vencido(this.producto.fechaLimiteVenta);}
  puedeComprar():boolean{return !this.sesion.activa()||this.sesion.tieneRol('CLIENTE')&&!this.sesion.tieneRol('NEGOCIO');}

  ngOnChanges(): void {
    this.imagenFallida = false;
  }

  @Input({ required: true }) producto!: Producto;
  @Output() agregar = new EventEmitter<Producto>();

  tieneDescuento(): boolean {
    return this.producto.precioDescuento < this.producto.precioNormal;
  }

  ahorro(): number {
    return ahorroDe(this.producto);
  }

  precio(valor: number): string {
    return soles(valor);
  }

  hayImagen(): boolean {
    return !this.imagenFallida && tieneImagen(this.producto);
  }

  inicial(): string {
    return this.producto.nombre.charAt(0).toUpperCase();
  }

  agotado(): boolean {
    return this.producto.stock <= 0 || this.vencido();
  }

  agregarAlCarrito(): void {
    if(this.puedeComprar()&&!this.agotado())this.agregar.emit(this.producto);
  }
}
