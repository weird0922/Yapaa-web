import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Resultado } from '../core/api/resultado';
import { Pagina } from '../dominio/pagina';
import { Negocio } from '../dominio/negocio';

export interface PeticionAfiliacion {
  nombreComercial: string; razonSocial: string; tipoContribuyente: string;
  ruc: string; direccion: string; distrito: string; ciudad: string; telefonoContacto: string;
}

export interface RegistroNegocio extends PeticionAfiliacion { correo:string; contrasena:string; confirmarContrasena:string;tokenVerificacion:string; }
export interface ConsultaRuc { ruc:string; razonSocial:string; estado:string; condicion:string; verificado:boolean; demostracion:boolean; }
@Service()
export class NegociosApi {

  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/negocios`;

  consultarRuc(ruc:string): Observable<Resultado<ConsultaRuc>> {
    return this.http.get<Resultado<ConsultaRuc>>(`${this.url}/ruc/${encodeURIComponent(ruc)}`);
  }
  actualizar(id:number,datos:PeticionAfiliacion & {idCuenta:number}): Observable<Resultado<Negocio>> {
    return this.http.put<Resultado<Negocio>>(`${this.url}/${id}`,datos);
  }

  mios(): Observable<Resultado<Pagina<Negocio>>> {
    return this.http.get<Resultado<Pagina<Negocio>>>(`${this.url}/mios`, { params: { size: 100 } });
  }

  administrar(estado: string, pagina: number): Observable<Resultado<Pagina<Negocio>>> {
    let params = new HttpParams().set('page',pagina).set('size',10);
    if (estado) params = params.set('estadoAprobacion',estado);
    return this.http.get<Resultado<Pagina<Negocio>>>(this.url,{ params });
  }

  aprobar(id: number, estado: string): Observable<Resultado<Negocio>> {
    return this.http.patch<Resultado<Negocio>>(`${this.url}/${id}/aprobacion`, null, { params: { estado } });
  }

  todos(pagina: number, tamano: number): Observable<Resultado<Pagina<Negocio>>> {
    return this.http.get<Resultado<Pagina<Negocio>>>(this.url, {
      params: new HttpParams().set('page', pagina).set('size', tamano),
    });
  }

  uno(id: number): Observable<Resultado<Negocio>> {
    return this.http.get<Resultado<Negocio>>(`${this.url}/${id}`);
  }
}
