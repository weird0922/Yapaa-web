import { Component, OnInit, inject, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ComercialApi, Plan, Venta, Resumen } from './comercial-api';
import { mensajeDeError } from '../core/api/errores';
import { soles } from '../dominio/producto';
import { Paginador } from '../core/layout/paginador/paginador';
@Component({selector:'app-gestion-comercial',imports:[DatePipe,Paginador],templateUrl:'./gestion-comercial.html',styleUrl:'./cuenta.css'})
export class GestionComercial implements OnInit {
  idNegocio=input.required<number>();private api=inject(ComercialApi);
  plan=signal<Plan|null>(null);planes=signal<Plan[]>([]);ventas=signal<Venta[]>([]);resumen=signal<Resumen|null>(null);
  error=signal('');aviso=signal('');ocupado=signal(false);cargando=signal(false);pagina=signal(0);paginas=signal(0);total=signal(0);
  confirmarAccion=signal<{tipo:'venta'|'cancelar'|'plan';id?:number;nombre?:string}|null>(null);
  precio=soles;
  ngOnInit(){this.api.planes().subscribe({next:r=>this.planes.set(r.datos),error:e=>this.error.set(mensajeDeError(e))});this.cargarPlan();this.cargarVentas();}
  cargarPlan(){this.api.plan(this.idNegocio()).subscribe({next:r=>{this.plan.set(r.datos);this.cargarResumen();},error:e=>this.error.set(mensajeDeError(e))});}
  cargarResumen(){this.resumen.set(null);if(this.plan()?.reportes)this.api.resumen(this.idNegocio()).subscribe({next:r=>this.resumen.set(r.datos),error:e=>this.error.set(mensajeDeError(e))});}
  cargarVentas(page=0){this.cargando.set(true);this.api.ventas(this.idNegocio(),page).subscribe({next:r=>{this.ventas.set(r.datos.content);this.pagina.set(r.datos.number);this.paginas.set(r.datos.totalPages);this.total.set(r.datos.totalElements);this.cargando.set(false);},error:e=>{this.error.set(mensajeDeError(e));this.cargando.set(false);}});}
  ejecutar(){
    const a=this.confirmarAccion();if(!a||this.ocupado())return;this.ocupado.set(true);this.error.set('');this.aviso.set('');
    if(a.tipo==='plan')this.api.cambiar(this.idNegocio(),a.nombre!).subscribe({next:r=>{this.plan.set(r.datos);this.finalizar('Plan actualizado. La tasa se aplica a las próximas ventas que confirmes.');this.cargarResumen();},error:e=>this.fallar(e)});
    else {const solicitud=a.tipo==='venta'?this.api.confirmar(a.id!):this.api.cancelar(a.id!);solicitud.subscribe({next:()=>{this.finalizar(a.tipo==='venta'?'Venta realizada confirmada y comisión generada.':'Pedido cancelado y stock devuelto.');this.cargarVentas(this.pagina());this.cargarResumen();},error:e=>this.fallar(e)});}
  }
  private finalizar(texto:string){this.ocupado.set(false);this.confirmarAccion.set(null);this.aviso.set(texto);}
  private fallar(e:HttpErrorResponse){this.ocupado.set(false);this.error.set(mensajeDeError(e));}
  descargar(){if(this.ocupado())return;this.ocupado.set(true);this.api.csv(this.idNegocio()).subscribe({next:blob=>{const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='ventas-yapaa.csv';a.click();URL.revokeObjectURL(url);this.ocupado.set(false);},error:e=>this.fallar(e)});}
}
