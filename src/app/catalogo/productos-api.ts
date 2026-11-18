import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Resultado } from '../core/api/resultado';
import { Pagina } from '../dominio/pagina';
import { Producto } from '../dominio/producto';

export interface PeticionProducto { idNegocio:number; idCategoria:number; nombre:string; descripcion:string; imagenUrl:string|null; precioNormal:number; precioDescuento:number; stock:number; fechaPublicacion:string; fechaLimiteVenta:string; estadoPublicacion:string; }
@Service()
export class ProductosApi {

  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/productos`;

  mios(pagina:number,tamano:number): Observable<Resultado<Pagina<Producto>>> {
    return this.http.get<Resultado<Pagina<Producto>>>(`${this.url}/mios`,{params:{page:pagina,size:tamano}});
  }
  crear(datos:PeticionProducto): Observable<Resultado<Producto>> { return this.http.post<Resultado<Producto>>(this.url,datos); }
  actualizar(id:number,datos:PeticionProducto): Observable<Resultado<Producto>> { return this.http.put<Resultado<Producto>>(`${this.url}/${id}`,datos); }
  cambiarActivo(id:number,activo:boolean): Observable<Resultado<Producto>> {return this.http.patch<Resultado<Producto>>(`${this.url}/${id}/activo`,null,{params:{activo}});}

  disponibles(pagina: number, tamano: number): Observable<Resultado<Pagina<Producto>>> {
    return this.http.get<Resultado<Pagina<Producto>>>(`${this.url}/disponibles`, {
      params: new HttpParams().set('page', pagina).set('size', tamano),
    });
  }

  porCategoria(
    idCategoria: number,
    pagina: number,
    tamano: number,
  ): Observable<Resultado<Pagina<Producto>>> {
    return this.http.get<Resultado<Pagina<Producto>>>(`${this.url}/categoria/${idCategoria}`, {
      params: new HttpParams().set('page', pagina).set('size', tamano),
    });
  }

  porNegocio(
    idNegocio: number,
    pagina: number,
    tamano: number,
  ): Observable<Resultado<Pagina<Producto>>> {
    return this.http.get<Resultado<Pagina<Producto>>>(`${this.url}/negocio/${idNegocio}`, {
      params: new HttpParams().set('page', pagina).set('size', tamano),
    });
  }

  uno(id: number): Observable<Resultado<Producto>> {
    return this.http.get<Resultado<Producto>>(`${this.url}/${id}`);
  }
}
