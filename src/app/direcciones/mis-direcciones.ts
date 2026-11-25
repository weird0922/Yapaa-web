import {Component,OnInit,inject,signal,input,output} from '@angular/core';import {DireccionesApi,Direccion,Punto} from './direcciones-api';import {SelectorMapa} from './selector-mapa';import {mensajeDeError} from '../core/api/errores';
@Component({selector:'app-mis-direcciones',imports:[SelectorMapa],templateUrl:'./mis-direcciones.html',styleUrl:'./mis-direcciones.css'})
export class MisDirecciones implements OnInit {
 seleccionar=input(false);cambio=output<Direccion|null>();private api=inject(DireccionesApi);direcciones=signal<Direccion[]>([]);elegida=signal<number|null>(null);editando=signal(false);punto=signal<Punto|null>(null);nombre=signal('');referencia=signal('');defecto=signal(false);ocupado=signal(false);cargando=signal(false);error=signal('');eliminando=signal<number|null>(null);
 ngOnInit(){this.cargar();}
 cargar(preferida?:number){this.cargando.set(true);this.api.listar().subscribe({next:r=>{this.direcciones.set(r.datos);const actual=r.datos.find(d=>d.id===(preferida??this.elegida()))??r.datos.find(d=>d.predeterminada)??r.datos[0]??null;this.elegida.set(actual?.id??null);this.cambio.emit(actual);this.cargando.set(false);},error:e=>{this.error.set(mensajeDeError(e));this.cargando.set(false);}});}
 elegir(d:Direccion){if(this.ocupado())return;this.elegida.set(d.id);this.cambio.emit(d);}
 nueva(){this.error.set('');this.nombre.set('');this.referencia.set('');this.defecto.set(this.direcciones().length===0);this.punto.set(null);this.editando.set(true);this.cambio.emit(null);}
 cancelar(){this.editando.set(false);this.punto.set(null);this.cambio.emit(this.direcciones().find(d=>d.id===this.elegida())??null);}
 valor(e:Event){return(e.target as HTMLInputElement).value;}
 guardar(){if(this.ocupado()||!this.punto())return;if(!this.nombre().trim()){this.error.set('Pon un nombre a tu dirección.');return;}this.ocupado.set(true);this.error.set('');this.api.guardar({nombre:this.nombre().trim(),referencia:this.referencia().trim(),token:this.punto()!.token,predeterminada:this.defecto()}).subscribe({next:r=>{this.ocupado.set(false);this.editando.set(false);this.punto.set(null);this.cargar(r.datos.id);},error:e=>{this.error.set(mensajeDeError(e));this.ocupado.set(false);}});}
 predeterminada(d:Direccion){if(this.ocupado())return;this.ocupado.set(true);this.error.set('');this.api.predeterminada(d.id).subscribe({next:()=>{this.ocupado.set(false);this.cargar();},error:e=>{this.ocupado.set(false);this.error.set(mensajeDeError(e));}});}
 eliminar(d:Direccion){if(this.ocupado())return;this.ocupado.set(true);this.error.set('');this.api.eliminar(d.id).subscribe({next:()=>{this.ocupado.set(false);this.eliminando.set(null);this.cargar();},error:e=>{this.ocupado.set(false);this.error.set(mensajeDeError(e));}});}
}
