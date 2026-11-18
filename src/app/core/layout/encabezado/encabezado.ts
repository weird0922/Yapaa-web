import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Sesion } from '../../auth/sesion';
import { Carrito } from '../../../carrito/carrito';

@Component({
  selector: 'app-encabezado',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './encabezado.html',
  styleUrl: './encabezado.css',
})
export class Encabezado {

  private sesion = inject(Sesion);
  private router = inject(Router);
  private carrito = inject(Carrito);

  activa(): boolean {
    return this.sesion.activa();
  }

  nombre(): string {
    return this.sesion.nombre();
  }

  esNegocio(): boolean { return this.sesion.tieneRol('NEGOCIO'); }
  esAdmin(): boolean { return this.sesion.tieneRol('ADMIN'); }

  cantidadCarrito(): number {
    return this.carrito.cantidadTotal();
  }

  salir(): void {
    this.sesion.cerrar();
    this.carrito.limpiar();
    this.router.navigate(['/login']);
  }
}
