import { UbicacionNegocio } from '../direcciones/ubicacion-negocio';
import { GestionComercial } from './gestion-comercial';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Sesion } from '../core/auth/sesion';
import { NegociosApi } from '../negocios/negocios-api';
import { ProductosApi, PeticionProducto } from '../catalogo/productos-api';
import { CategoriasApi } from '../catalogo/categorias-api';
import { Producto, soles } from '../dominio/producto';
import { Negocio } from '../dominio/negocio';
import { Categoria } from '../dominio/categoria';
import { Paginador } from '../core/layout/paginador/paginador';
import { CuentaRegresiva } from '../catalogo/cuenta-regresiva';
import { mensajeDeError } from '../core/api/errores';
import { noVacio } from '../core/formularios/validadores';
@Component({selector:'app-panel-negocio',imports:[UbicacionNegocio,ReactiveFormsModule,Paginador,CuentaRegresiva,GestionComercial],templateUrl:'./panel-negocio.html',styleUrl:'./cuenta.css'})
export class PanelNegocio implements OnInit {
  readonly sesion=inject(Sesion);private negociosApi=inject(NegociosApi);private productosApi=inject(ProductosApi);private categoriasApi=inject(CategoriasApi);private fb=inject(FormBuilder);
  negocios=signal<Negocio[]>([]);productos=signal<Producto[]>([]);categorias=signal<Categoria[]>([]);
  error=signal('');aviso=signal('');cargando=signal(false);guardando=signal(false);editando=signal<number|null>(null);
  pagina=signal(0);totalPaginas=signal(0);total=signal(0);mostrarFormulario=signal(false);mostrarCuenta=signal(false);
  formulario=this.fb.nonNullable.group({idNegocio:[0,Validators.min(1)],idCategoria:[0,Validators.min(1)],nombre:['',[noVacio,Validators.maxLength(150)]],descripcion:['',Validators.maxLength(500)],imagenUrl:['',Validators.maxLength(500)],precioNormal:[10,[Validators.required,Validators.min(.01)]],precioDescuento:[8,[Validators.required,Validators.min(.01)]],stock:[1,[Validators.required,Validators.min(0),Validators.pattern(/^[0-9]+$/)]],fechaLimiteVenta:[this.fechaLocal(new Date(Date.now()+86400000)),Validators.required],estadoPublicacion:['BORRADOR',Validators.required]});
  cuenta=this.fb.nonNullable.group({nombreComercial:['',noVacio],razonSocial:[''],ruc:[''],tipoContribuyente:[''],direccion:['',noVacio],distrito:['',noVacio],ciudad:['',noVacio],telefonoContacto:['',noVacio]});
  ngOnInit():void{
    this.negociosApi.mios().subscribe({next:r=>{this.negocios.set(r.datos.content);const n=r.datos.content[0];if(n){this.formulario.patchValue({idNegocio:n.idNegocio});this.cuenta.patchValue(n);}},error:e=>this.error.set(mensajeDeError(e))});
    this.categoriasApi.activas().subscribe({next:r=>{this.categorias.set(r.datos.content);if(r.datos.content[0])this.formulario.patchValue({idCategoria:r.datos.content[0].idCategoria});},error:e=>this.error.set(mensajeDeError(e))});
    this.cargar();
  }
  fechaLocal(fecha:Date):string{return new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(fecha).replace(' ','T');}
  precio=soles;
  cargar(pagina=0):void{
    this.cargando.set(true);
    this.productosApi.mios(pagina,8).subscribe({next:r=>{this.productos.set(r.datos.content);this.pagina.set(r.datos.number);this.totalPaginas.set(r.datos.totalPages);this.total.set(r.datos.totalElements);this.cargando.set(false);},error:e=>{this.error.set(mensajeDeError(e));this.cargando.set(false);}});
  }
  nuevo():void{this.editando.set(null);this.error.set('');this.aviso.set('');this.formulario.reset({idNegocio:this.negocios()[0]?.idNegocio??0,idCategoria:this.categorias()[0]?.idCategoria??0,nombre:'',descripcion:'',imagenUrl:'',precioNormal:10,precioDescuento:8,stock:1,fechaLimiteVenta:this.fechaLocal(new Date(Date.now()+86400000)),estadoPublicacion:'BORRADOR'});this.mostrarFormulario.set(true);}
  editar(p:Producto):void{this.editando.set(p.idProducto);this.formulario.patchValue({...p,imagenUrl:p.imagenUrl??'',fechaLimiteVenta:p.fechaLimiteVenta.slice(0,16)});this.mostrarFormulario.set(true);this.error.set('');}
  guardar():void{
    if(this.guardando())return;
    if(this.formulario.invalid){this.formulario.markAllAsTouched();this.error.set('Revisa los campos obligatorios y los importes.');return;}
    const datos=this.formulario.getRawValue();
    if(datos.precioDescuento>=datos.precioNormal){this.error.set('El precio de oferta debe ser menor que el precio normal.');return;}
    const peticion:PeticionProducto={...datos,imagenUrl:datos.imagenUrl.trim()||null,fechaPublicacion:this.fechaLocal(new Date())};
    this.guardando.set(true);this.error.set('');
    const id=this.editando();
    const accion=id?this.productosApi.actualizar(id,peticion):this.productosApi.crear(peticion);
    accion.subscribe({next:()=>{this.guardando.set(false);this.mostrarFormulario.set(false);this.aviso.set(id?'Producto actualizado.':'Producto creado.');this.cargar(id?this.pagina():0);},error:e=>{this.error.set(mensajeDeError(e));this.guardando.set(false);}});
  }
  cambiarActivo(p:Producto):void{if(this.guardando())return;this.guardando.set(true);this.error.set('');this.productosApi.cambiarActivo(p.idProducto,!p.activo).subscribe({next:()=>{this.guardando.set(false);this.aviso.set(p.activo?'Producto retirado del catálogo.':'Producto reactivado.');this.cargar(this.pagina());},error:e=>{this.guardando.set(false);this.error.set(mensajeDeError(e));}});}
  guardarCuenta():void{
    const n=this.negocios()[0];if(!n||this.cuenta.invalid||this.guardando()){this.cuenta.markAllAsTouched();return;}
    this.guardando.set(true);this.error.set('');
    this.negociosApi.actualizar(n.idNegocio,{...this.cuenta.getRawValue(),idCuenta:n.idCuenta}).subscribe({next:r=>{this.negocios.update(ns=>ns.map(x=>x.idNegocio===n.idNegocio?r.datos:x));this.aviso.set('Datos del negocio actualizados.');this.guardando.set(false);this.mostrarCuenta.set(false);},error:e=>{this.guardando.set(false);this.error.set(mensajeDeError(e));}});
  }
}
