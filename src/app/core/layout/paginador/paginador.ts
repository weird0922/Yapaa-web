import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-paginador',
  imports: [],
  templateUrl: './paginador.html',
  styleUrl: './paginador.css',
})
export class Paginador {

  @Input() pagina = 0;
  @Input() totalPaginas = 0;
  @Input() totalElementos = 0;
  @Output() cambiar = new EventEmitter<number>();

  get puedeAtras(): boolean {
    return this.pagina > 0;
  }

  get puedeAdelante(): boolean {
    return this.pagina < this.totalPaginas - 1;
  }

  get numeroVisible(): number {
    return this.totalPaginas === 0 ? 0 : this.pagina + 1;
  }

  irAnterior(): void {
    if (this.puedeAtras) {
      this.cambiar.emit(this.pagina - 1);
    }
  }

  irSiguiente(): void {
    if (this.puedeAdelante) {
      this.cambiar.emit(this.pagina + 1);
    }
  }
}
