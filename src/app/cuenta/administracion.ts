import { Component, OnInit, inject, signal } from '@angular/core';
import { NegociosApi } from '../negocios/negocios-api';
import { Negocio } from '../dominio/negocio';
import { mensajeDeError } from '../core/api/errores';
import { Paginador } from '../core/layout/paginador/paginador';
@Component({selector:'app-administracion', imports:[Paginador], templateUrl:'./administracion.html', styleUrl:'./cuenta.css'})
export class Administracion implements OnInit {
  private api=inject(NegociosApi);
  negocios=signal<Negocio[]>([]); cargando=signal(false); procesando=signal<number|null>(null);
  pagina=signal(0); totalPaginas=signal(0); total=signal(0); filtro=signal('PENDIENTE'); error=signal(''); aviso=signal('');
  ngOnInit():void{this.cargar();}
  filtrar(estado:string):void{this.filtro.set(estado);this.cargar(0);}
  cargar(pagina=0):void{
    this.cargando.set(true);this.error.set('');
    this.api.administrar(this.filtro(),pagina).subscribe({next:r=>{this.negocios.set(r.datos.content);this.pagina.set(r.datos.number);this.totalPaginas.set(r.datos.totalPages);this.total.set(r.datos.totalElements);this.cargando.set(false);},error:e=>{this.error.set(mensajeDeError(e));this.cargando.set(false);}});
  }
  cambiar(negocio:Negocio,estado:string):void{
    if(this.procesando()!==null)return;
    this.procesando.set(negocio.idNegocio);this.error.set('');this.aviso.set('');
    this.api.aprobar(negocio.idNegocio,estado).subscribe({next:()=>{this.procesando.set(null);this.aviso.set('Se actualizó la solicitud de '+negocio.nombreComercial+'.');this.cargar(this.pagina());},error:e=>{this.procesando.set(null);this.error.set(mensajeDeError(e));}});
  }
}
