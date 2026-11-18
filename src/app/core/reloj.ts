import { Injectable, DestroyRef, inject, signal } from '@angular/core';
@Injectable({providedIn:'root'})
export class Reloj {
  readonly ahora=signal(Date.now());
  private temporizador=setInterval(()=>this.ahora.set(Date.now()),1000);
  constructor(){inject(DestroyRef).onDestroy(()=>clearInterval(this.temporizador));}
  instante(fecha:string):number {
    return Date.parse(/[zZ]|[+-]\d\d:\d\d$/.test(fecha)?fecha:fecha+'-05:00');
  }
  vencido(fecha:string):boolean {return this.instante(fecha)<=this.ahora();}
  publicacion(fecha:string):string {
    if(!fecha)return '';
    const formato=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima'});
    const publicada=new Date(this.instante(fecha));
    return formato.format(publicada)===formato.format(new Date(this.ahora()))?'Publicado hoy':'Publicado el '+new Intl.DateTimeFormat('es-PE',{timeZone:'America/Lima'}).format(publicada);
  }
  restante(fecha:string):string {
    const total=Math.max(0,Math.floor((this.instante(fecha)-this.ahora())/1000));
    if(!Number.isFinite(total))return 'Fecha no disponible';
    if(total<=0)return 'Oferta finalizada';
    const dias=Math.floor(total/86400);
    const horas=Math.floor((total%86400)/3600);
    const minutos=Math.floor((total%3600)/60);
    const segundos=total%60;
    return (dias?dias+' d ':'')+[horas,minutos,segundos].map(v=>String(v).padStart(2,'0')).join(':');
  }
}
