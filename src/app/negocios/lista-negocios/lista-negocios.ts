import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { NegociosApi } from '../negocios-api';
import { mensajeDeError } from '../../core/api/errores';
import { Negocio } from '../../dominio/negocio';
import { Paginador } from '../../core/layout/paginador/paginador';

@Component({
  selector: 'app-lista-negocios',
  imports: [RouterLink, Paginador],
  templateUrl: './lista-negocios.html',
  styleUrl: './lista-negocios.css',
})
export class ListaNegocios implements OnInit {

  private negociosApi = inject(NegociosApi);

  readonly tamano = 9;

  negocios = signal<Negocio[]>([]);
  pagina = signal(0);
  totalPaginas = signal(0);
  totalElementos = signal(0);
  cargando = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.cargar(0);
  }

  cargar(pagina: number): void {
    this.cargando.set(true);
    this.error.set('');
    this.negociosApi.todos(pagina, this.tamano).subscribe({
      next: respuesta => {
        const datos = respuesta.datos;
        this.negocios.set(datos.content);
        this.pagina.set(datos.number);
        this.totalPaginas.set(datos.totalPages);
        this.totalElementos.set(datos.totalElements);
        this.cargando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(mensajeDeError(e));
        this.negocios.set([]);
        this.totalPaginas.set(0);
        this.totalElementos.set(0);
        this.cargando.set(false);
      },
    });
  }

  cambiarPagina(pagina: number): void {
    this.cargar(pagina);
  }

  ubicacion(negocio: Negocio): string {
    return [negocio.distrito, negocio.ciudad].filter(valor => !!valor).join(', ');
  }
}
