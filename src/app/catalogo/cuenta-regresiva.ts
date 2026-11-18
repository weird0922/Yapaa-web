import { Component, Input, inject } from '@angular/core';
import { Reloj } from '../core/reloj';
@Component({selector:'app-cuenta-regresiva',template:'@if(publicada){<small>{{reloj.publicacion(publicada)}}</small>}<span [class.finalizada]="reloj.vencido(fecha)" aria-live="off">Termina en {{ reloj.restante(fecha) }}</span>',styles:[':host{display:block;font-size:.78rem;font-weight:700;color:var(--marca-oscuro)}span{display:inline-block;padding:.3rem .5rem;background:var(--marca-suave);border-radius:7px}small{display:block;margin-bottom:.25rem;color:var(--tinta-suave);font-weight:500}.finalizada{color:#7a1f17;background:#fbeae8}']})
export class CuentaRegresiva { @Input({required:true}) fecha=''; @Input() publicada=''; readonly reloj=inject(Reloj); }
