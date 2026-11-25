import { Component, OnInit, inject, signal,computed } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule,FormBuilder,Validators } from '@angular/forms';
import { environment } from '../../environments/environment';
import { Resultado } from '../core/api/resultado';
import { mensajeDeError } from '../core/api/errores';
import { soles } from '../dominio/producto';
import { Administracion } from './administracion';
interface NegocioResumen {idNegocio:number;nombre:string;estado:string;plan:string;porcentaje:number;ventas:number;productos:number;delivery:number;total:number;comision:number;neto:number;}
interface Resumen {negocios:number;aprobados:number;pendientes:number;clientes:number;pedidos:number;ventas:number;ventasProductos:number;delivery:number;totalCobrado:number;comisionYapaa:number;ingresoNegocios:number;evolucion:{fecha:string;comision:number;ventas:number}[];negociosResumen:NegocioResumen[];planes:{plan:string;cantidad:number}[];}
interface ProductoVenta {idDetalle:number;producto:string;cantidad:number;precio:number;subtotal:number;comision:number;neto:number;}
interface Venta {idPedidoNegocio:number;codigo:string;fecha:string;estado:string;modalidad:string;productos:number;delivery:number;total:number;porcentaje:number;comision:number;neto:number;detalle:ProductoVenta[];}
interface Detalle {idNegocio:number;nombre:string;ventas:Venta[];totalElementos:number;pagina:number;totalPaginas:number;}
@Component({selector:'app-dashboard',imports:[ReactiveFormsModule,Administracion,DatePipe],templateUrl:'./dashboard.html',styleUrl:'./dashboard.css'})
export class Dashboard implements OnInit {
 private router=inject(Router);private ruta=inject(ActivatedRoute);private http=inject(HttpClient);private fb=inject(FormBuilder);datos=signal<Resumen|null>(null);detalle=signal<Detalle|null>(null);error=signal('');errorDetalle=signal('');cargando=signal(false);cargandoDetalle=signal(false);precio=soles;buscar=signal('');filtroPlan=signal('');
 private hoy=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima'}).format(new Date());
 fechas=this.fb.nonNullable.group({desde:[this.hoy.slice(0,8)+'01',Validators.required],hasta:[this.hoy,Validators.required]});maximo=this.hoy;
 negocios=computed(()=>this.datos()?.negociosResumen.filter(n=>n.nombre.toLocaleLowerCase().includes(this.buscar().toLocaleLowerCase())&&(!this.filtroPlan()||n.plan===this.filtroPlan()))??[]);
 totales=computed(()=>this.negocios().reduce((s,n)=>({ventas:s.ventas+n.ventas,total:s.total+n.total,comision:s.comision+n.comision,neto:s.neto+n.neto}),{ventas:0,total:0,comision:0,neto:0}));
 private secuencia=0;private secuenciaDetalle=0;private periodo={desde:this.hoy.slice(0,8)+'01',hasta:this.hoy};
 ngOnInit(){const q=this.ruta.snapshot.queryParamMap;this.fechas.patchValue({desde:q.get('desde')??this.periodo.desde,hasta:q.get('hasta')??this.periodo.hasta});this.cargar();}
 valor(e:Event){return(e.target as HTMLInputElement).value;}
 cargar(){if(this.cargando())return;if(this.fechas.invalid||this.fechas.controls.desde.value>this.fechas.controls.hasta.value){this.error.set('Selecciona un intervalo de fechas válido.');return;}this.cargando.set(true);this.error.set('');this.detalle.set(null);this.secuenciaDetalle++;this.cargandoDetalle.set(false);this.periodo=this.fechas.getRawValue();const v=++this.secuencia;this.http.get<Resultado<Resumen>>(environment.apiUrl+'/dashboard',{params:this.periodo}).subscribe({next:r=>{if(v!==this.secuencia)return;this.datos.set(r.datos);this.cargando.set(false);},error:e=>{if(v!==this.secuencia)return;this.error.set(mensajeDeError(e));this.cargando.set(false);}});}
 verVentas(id:number){this.router.navigate(['/administracion/negocios',id],{state:{accesoAdministrador:true},queryParams:this.periodo});}
 barra(valor:number){const max=Math.max(1,...(this.datos()?.evolucion??[]).map(v=>v.comision));return Math.max(0,Math.min(100,valor/max*100));}
}
