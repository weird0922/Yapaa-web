import { Component, input, output, signal, effect, OnDestroy, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Resultado } from '../api/resultado';
import { mensajeDeError } from '../api/errores';
@Component({selector:'app-verificar-correo',template:`
<section class="verificar" aria-label="Verificación de correo"><div class="cabecera"><strong>{{verificado()?'Correo verificado':'Verifica tu correo'}}</strong>@if(!verificado()){<button type="button" class="boton secundario" [disabled]="ocupado()||espera()>0||!correoValido()" (click)="enviar()">{{espera()>0?'Reenviar en '+espera()+' s':enviado()?'Reenviar código':'Enviar código'}}</button>}</div>
@if(!verificado()){<p>Te enviaremos un código de 6 dígitos. Es válido durante 1 minuto.</p>}
@if(enviado()&&!verificado()){<label class="campo"><span>Código de verificación</span><input aria-label="Código de verificación" inputmode="numeric" autocomplete="one-time-code" maxlength="6" [value]="codigo()" (input)="codigo.set(valor($event))" placeholder="000000"></label><button type="button" class="boton principal" [disabled]="ocupado()||codigo().length!==6" (click)="validar()">Verificar código</button>}
@if(local()){<p class="nota">Prueba local: el código está en el buzón del servidor. Aún no se ha enviado un correo real.</p>}
@if(error()){<p class="error" role="alert">{{error()}}</p>}@if(verificado()){<p role="status">Puedes continuar con el registro. Si cambias el correo tendrás que verificarlo nuevamente.</p><button type="button" class="boton secundario" (click)="reiniciar()">Verificar de nuevo</button>}</section>`,styles:[`.verificar{border:1px solid var(--linea);border-radius:16px;padding:1.1rem;background:var(--fondo)}.cabecera{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.7rem}p{font-size:.83rem;color:var(--tinta-suave)}input{max-width:230px;letter-spacing:.2em}.campo{margin:.8rem 0}.nota{color:var(--marca-oscuro)}.error{color:#9e3026}`]})
export class VerificarCorreo implements OnDestroy {
 correo=input.required<string>();confirmado=output<string>();private http=inject(HttpClient);private url=environment.apiUrl+'/auth/correo';
 codigo=signal('');error=signal('');enviado=signal(false);verificado=signal(false);local=signal(false);ocupado=signal(false);espera=signal(0);private version=0;private temporizador=window.setInterval(()=>{if(this.espera()>0)this.espera.update(v=>v-1)},1000);
 constructor(){effect(()=>{this.correo();this.version++;this.codigo.set('');this.enviado.set(false);this.verificado.set(false);this.local.set(false);this.error.set('');this.ocupado.set(false);this.confirmado.emit('');});}
 reiniciar(){this.verificado.set(false);this.confirmado.emit('');this.enviado.set(false);this.codigo.set('');}
 ngOnDestroy(){window.clearInterval(this.temporizador);}
 correoValido(){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.correo().trim());}
 valor(e:Event){return (e.target as HTMLInputElement).value.replace(/[^0-9]/g,'').slice(0,6);}
 enviar(){if(this.ocupado()||this.espera()>0||!this.correoValido())return;const v=this.version;this.ocupado.set(true);this.error.set('');this.http.post<Resultado<{local:boolean;segundosReenvio:number}>>(this.url+'/codigo',{correo:this.correo().trim()}).subscribe({next:r=>{if(v!==this.version)return;this.local.set(r.datos.local);this.enviado.set(true);this.espera.set(r.datos.segundosReenvio);this.ocupado.set(false);},error:e=>{if(v!==this.version)return;this.error.set(mensajeDeError(e));this.ocupado.set(false);}});}
 validar(){if(this.ocupado()||this.codigo().length!==6)return;const v=this.version;this.ocupado.set(true);this.error.set('');this.http.post<Resultado<{tokenVerificacion:string}>>(this.url+'/verificar',{correo:this.correo().trim(),codigo:this.codigo()}).subscribe({next:r=>{if(v!==this.version)return;this.verificado.set(true);this.ocupado.set(false);this.confirmado.emit(r.datos.tokenVerificacion);},error:e=>{if(v!==this.version)return;this.error.set(mensajeDeError(e));this.ocupado.set(false);}});}
}
