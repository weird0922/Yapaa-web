import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Resultado } from '../core/api/resultado';
import { Pagina } from '../dominio/pagina';
export interface Plan {idPlan:number;nombre:string;porcentajeComision:number;descripcion:string;reportes:boolean;fechaInicio:string|null;fechaFin:string|null;}
export interface Venta {idPedidoNegocio:number;codigoPedido:string;fechaPedido:string;estado:string;modalidadEntrega:string;subtotalProductos:number;costoDelivery:number;total:number;productos:string[];porcentajeComision:number|null;comision:number;estadoComision:string;}
export interface Resumen {ventasConfirmadas:number;unidadesVendidas:number;subtotalVendido:number;comisionGenerada:number;ingresoNetoProductos:number;}
export interface Comision {idComision:number;idPedidoNegocio:number;idNegocio:number;nombreNegocio:string;baseCalculo:number;porcentajeAplicado:number;montoComision:number;estado:string;fechaRegistro:string;}
@Injectable({providedIn:'root'})
export class ComercialApi {
  private http=inject(HttpClient);private url=environment.apiUrl;
  planes(){return this.http.get<Resultado<Plan[]>>(`${this.url}/planes`);}
  plan(id:number){return this.http.get<Resultado<Plan>>(`${this.url}/negocios/${id}/plan`);}
  cambiar(id:number,nombre:string){return this.http.put<Resultado<Plan>>(`${this.url}/negocios/${id}/plan`,{nombre});}
  ventas(id:number,page=0){return this.http.get<Resultado<Pagina<Venta>>>(`${this.url}/negocios/${id}/ventas`,{params:{page,size:10}});}
  confirmar(id:number){return this.http.post<Resultado<Venta>>(`${this.url}/ventas/${id}/confirmar`,{});}
  cancelar(id:number){return this.http.post<Resultado<Venta>>(`${this.url}/ventas/${id}/cancelar`,{});}
  resumen(id:number){return this.http.get<Resultado<Resumen>>(`${this.url}/negocios/${id}/indicadores`);}
  csv(id:number){return this.http.get(`${this.url}/negocios/${id}/reporte.csv`,{responseType:'blob'});}
  comisiones(page=0){return this.http.get<Resultado<Pagina<Comision>>>(`${this.url}/comisiones`,{params:{page,size:10,sort:'idComision,desc'}});}
  liquidar(id:number){return this.http.patch<Resultado<Comision>>(`${this.url}/comisiones/${id}/liquidar`,{});}
}
