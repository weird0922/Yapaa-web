import {Injectable,inject} from '@angular/core';import {HttpClient} from '@angular/common/http';import {environment} from '../../environments/environment';import {Resultado} from '../core/api/resultado';
export interface Punto {token:string;direccion:string;latitud:number;longitud:number;}
export interface Direccion {id:number;nombre:string;direccion:string;referencia:string;latitud:number;longitud:number;predeterminada:boolean;}
export interface Cotizacion {id:string;idDireccion:number;idNegocio:number;kilometros:number;importe:number;vence:string;direccion:string;}
export interface Ubicacion {direccion:string;latitud:number;longitud:number;}
@Injectable({providedIn:'root'}) export class DireccionesApi {
 private http=inject(HttpClient);private url=environment.apiUrl;
 listar(){return this.http.get<Resultado<Direccion[]>>(this.url+'/direcciones');}
 guardar(datos:{nombre:string;referencia:string;token:string;predeterminada:boolean}){return this.http.post<Resultado<Direccion>>(this.url+'/direcciones',datos);}
 predeterminada(id:number){return this.http.patch<Resultado<string>>(this.url+'/direcciones/'+id+'/predeterminada',{});}
 eliminar(id:number){return this.http.delete<Resultado<string>>(this.url+'/direcciones/'+id);}
 buscar(q:string){return this.http.get<Resultado<Punto[]>>(this.url+'/mapas/buscar',{params:{q}});}
 inversa(lat:number,lon:number){return this.http.get<Resultado<Punto>>(this.url+'/mapas/inversa',{params:{lat,lon}});}
 cotizar(idNegocio:number,idDireccion:number){return this.http.post<Resultado<Cotizacion>>(this.url+'/delivery/cotizar',{idNegocio,idDireccion});}
 origen(id:number){return this.http.get<Resultado<Ubicacion|null>>(this.url+'/negocios/'+id+'/ubicacion');}
 guardarOrigen(id:number,token:string){return this.http.put<Resultado<Ubicacion>>(this.url+'/negocios/'+id+'/ubicacion',{token});}
}
