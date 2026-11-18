import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Resultado } from '../core/api/resultado';
import { Pagina } from '../dominio/pagina';
import { Pedido, PeticionPedido } from '../dominio/pedido';

@Service()
export class PedidosApi {

  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/pedidos`;

  crear(peticion: PeticionPedido): Observable<Resultado<Pedido>> {
    return this.http.post<Resultado<Pedido>>(this.url, peticion);
  }

  uno(id: number): Observable<Resultado<Pedido>> {
    return this.http.get<Resultado<Pedido>>(`${this.url}/${id}`);
  }

  porCuenta(
    idCuenta: number,
    pagina: number,
    tamano: number,
  ): Observable<Resultado<Pagina<Pedido>>> {
    return this.http.get<Resultado<Pagina<Pedido>>>(`${this.url}/cuenta/${idCuenta}`, {
      params: new HttpParams().set('page', pagina).set('size', tamano),
    });
  }

}
