import { Component, OnInit, inject, signal } from '@angular/core';
import { ComercialApi, Comision } from './comercial-api';
import { mensajeDeError } from '../core/api/errores';
import { soles } from '../dominio/producto';
import { Paginador } from '../core/layout/paginador/paginador';
@Component({selector:'app-comisiones-admin',imports:[Paginador],template:`
<section class="comercial"><h2>Comisiones de ventas realizadas</h2><p>Marca una comisión como liquidada únicamente tras verificar el abono del negocio fuera de la plataforma.</p>
@if(error()){<div class="aviso-error" role="alert">{{error()}}</div>}@if(aviso()){<div class="aviso-exito" role="status">{{aviso()}}</div>}
@if(confirmacion();as c){<div class="panel confirmacion-comercial"><p>¿Verificaste el abono de {{precio(c.montoComision)}} de {{c.nombreNegocio}}?</p><div class="acciones"><button class="principal" type="button" [disabled]="ocupado()" (click)="liquidar(c)">Sí, marcar liquidada</button><button class="boton secundario" type="button" [disabled]="ocupado()" (click)="confirmacion.set(null)">Volver</button></div></div>}
@for(c of lista();track c.idComision){<article class="panel solicitud"><div><span class="etiqueta-estado">{{c.estado}}</span><h3>{{c.nombreNegocio}}</h3><p>Venta #{{c.idPedidoNegocio}} · Base {{precio(c.baseCalculo)}} · {{c.porcentajeAplicado}}%</p><strong>{{precio(c.montoComision)}}</strong></div>@if(c.estado==='PENDIENTE'){<button class="boton secundario" type="button" [disabled]="ocupado()" (click)="confirmacion.set(c)">Registrar liquidación</button>}</article>}
@if(lista().length===0){<p>No hay comisiones registradas.</p>}
@if(paginas()>0){<app-paginador [pagina]="pagina()" [totalPaginas]="paginas()" [totalElementos]="total()" (cambiar)="cargar($event)" />}</section>`,styleUrl:'./cuenta.css'})
export class ComisionesAdmin implements OnInit {
 private api=inject(ComercialApi);lista=signal<Comision[]>([]);pagina=signal(0);paginas=signal(0);total=signal(0);error=signal('');aviso=signal('');ocupado=signal(false);confirmacion=signal<Comision|null>(null);precio=soles;
 ngOnInit(){this.cargar();}
 cargar(page=0){this.api.comisiones(page).subscribe({next:r=>{this.lista.set(r.datos.content);this.pagina.set(r.datos.number);this.paginas.set(r.datos.totalPages);this.total.set(r.datos.totalElements);},error:e=>this.error.set(mensajeDeError(e))});}
 liquidar(c:Comision){if(this.ocupado())return;this.ocupado.set(true);this.error.set('');this.api.liquidar(c.idComision).subscribe({next:()=>{this.ocupado.set(false);this.confirmacion.set(null);this.aviso.set('Liquidación registrada.');this.cargar(this.pagina());},error:e=>{this.ocupado.set(false);this.error.set(mensajeDeError(e));}});}
}
