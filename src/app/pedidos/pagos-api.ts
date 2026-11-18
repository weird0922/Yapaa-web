import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Resultado } from '../core/api/resultado';
import { Pagina } from '../dominio/pagina';
import { Pago } from '../dominio/pago';

@Service()
export class PagosApi {

  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/pagos`;

  porPedido(idPedido: number): Observable<Resultado<Pagina<Pago>>> {
    return this.http.get<Resultado<Pagina<Pago>>>(`${this.url}/pedido/${idPedido}`, {
      params: new HttpParams().set('size', 50),
    });
  }
}
