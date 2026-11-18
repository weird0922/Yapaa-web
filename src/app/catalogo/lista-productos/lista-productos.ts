import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { ProductosApi } from '../productos-api';
import { CategoriasApi } from '../categorias-api';
import { mensajeDeError } from '../../core/api/errores';
import { Producto } from '../../dominio/producto';
import { Categoria } from '../../dominio/categoria';
import { Paginador } from '../../core/layout/paginador/paginador';
import { TarjetaProducto } from '../tarjeta-producto/tarjeta-producto';
import { Carrito } from '../../carrito/carrito';
import { Sesion } from '../../core/auth/sesion';

@Component({
  selector: 'app-lista-productos',
  imports: [Paginador, TarjetaProducto, RouterLink],
  templateUrl: './lista-productos.html',
  styleUrl: './lista-productos.css',
})
export class ListaProductos implements OnInit, OnDestroy {

  private productosApi = inject(ProductosApi);
  private categoriasApi = inject(CategoriasApi);
  private carrito = inject(Carrito);
  private sesion = inject(Sesion);
  private router = inject(Router);

  readonly tamano = 8;
  private actualizacion?:ReturnType<typeof setInterval>;
  private cargaActual=0;
  ngOnDestroy():void{if(this.actualizacion)clearInterval(this.actualizacion);}

  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  pagina = signal(0);
  totalPaginas = signal(0);
  totalElementos = signal(0);
  filtroCategoria = signal<number | null>(null);
  cargando = signal(false);
  error = signal('');
  aviso = signal('');

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarProductos(0);
    this.actualizacion=setInterval(()=>{if(!this.cargando()&&document.visibilityState==='visible')this.cargarProductos(this.pagina(),true);},15000);
  }

  cargarCategorias(): void {
    this.categoriasApi.activas().subscribe({
      next: respuesta => this.categorias.set(respuesta.datos.content),
      error: () => this.categorias.set([]),
    });
  }

  activa(): boolean {
    return this.sesion.activa();
  }

  cargarProductos(pagina: number,silencioso=false): void {
    const solicitud=++this.cargaActual;
    if(!silencioso)this.cargando.set(true);
    this.error.set('');
    const categoria = this.filtroCategoria();
    const peticion =
      categoria === null
        ? this.productosApi.disponibles(pagina, this.tamano)
        : this.productosApi.porCategoria(categoria, pagina, this.tamano);

    peticion.subscribe({
      next: respuesta => {
        if(solicitud!==this.cargaActual)return;
        const datos = respuesta.datos;
        this.productos.set(datos.content);
        this.pagina.set(datos.number);
        this.totalPaginas.set(datos.totalPages);
        this.totalElementos.set(datos.totalElements);
        this.cargando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        if(solicitud!==this.cargaActual)return;
        if(silencioso)return;
        this.error.set(mensajeDeError(e));
        this.productos.set([]);
        this.totalPaginas.set(0);
        this.totalElementos.set(0);
        this.cargando.set(false);
      },
    });
  }

  filtrarCategoria(idCategoria: number | null): void {
    this.filtroCategoria.set(idCategoria);
    this.aviso.set('');
    this.cargarProductos(0);
  }

  cambiarPagina(pagina: number): void {
    this.cargarProductos(pagina);
  }

  nombreCategoriaActiva(): string {
    const id = this.filtroCategoria();
    if (id === null) {
      return 'todas las categorias';
    }
    const categoria = this.categorias().find(item => item.idCategoria === id);
    return categoria ? categoria.nombre : 'esta categoria';
  }

  agregar(producto: Producto): void {
    if(this.sesion.activa()&&(!this.sesion.tieneRol('CLIENTE')||this.sesion.tieneRol('NEGOCIO')))return;
    if (!this.sesion.activa()) {
      this.router.navigate(['/login'], { queryParams: { retorno: '/producto/' + producto.idProducto } });
      return;
    }
    this.carrito.agregar(producto);
    this.aviso.set(`Agregaste "${producto.nombre}" al carrito.`);
  }
}
