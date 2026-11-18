import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Resultado } from '../core/api/resultado';
import { Pagina } from '../dominio/pagina';
import { Categoria } from '../dominio/categoria';

@Service()
export class CategoriasApi {

  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/categorias`;

  activas(): Observable<Resultado<Pagina<Categoria>>> {
    return this.http.get<Resultado<Pagina<Categoria>>>(this.url, {
      params: new HttpParams().set('activo', true).set('size', 100),
    });
  }
}
