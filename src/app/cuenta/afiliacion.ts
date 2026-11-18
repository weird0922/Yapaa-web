import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Sesion } from '../core/auth/sesion';
import { AuthApi } from '../core/auth/auth-api';
import { NegociosApi, ConsultaRuc } from '../negocios/negocios-api';
import { mensajeDeError } from '../core/api/errores';
import { noVacio } from '../core/formularios/validadores';
@Component({selector:'app-afiliacion',imports:[ReactiveFormsModule,RouterLink],templateUrl:'./afiliacion.html',styleUrl:'./cuenta.css'})
export class Afiliacion implements OnInit {
  readonly sesion=inject(Sesion);private fb=inject(FormBuilder);private api=inject(NegociosApi);private auth=inject(AuthApi);private destruir=inject(DestroyRef);
  enviando=signal(false);consultando=signal(false);error=signal('');errorRuc=signal('');creada=signal(false);rucDatos=signal<ConsultaRuc|null>(null);demo=signal(false);
  formulario=this.fb.nonNullable.group({
    correo:['',[Validators.required,Validators.email]],contrasena:['',[Validators.required,Validators.minLength(6),Validators.maxLength(100)]],
    nombreComercial:['',[noVacio,Validators.maxLength(150)]],razonSocial:['',Validators.required],
    tipoContribuyente:['PERSONA_JURIDICA',Validators.required],ruc:['',[Validators.required,Validators.pattern(/^(10|20)[0-9]{9}$/)]],
    direccion:['',[noVacio,Validators.maxLength(250)]],distrito:['',[noVacio,Validators.maxLength(100)]],ciudad:['',[noVacio,Validators.maxLength(100)]],
    telefonoContacto:['',[Validators.required,Validators.pattern(/^[0-9+() -]{7,20}$/)]],
  });
  ngOnInit():void {
    this.auth.demostracion().subscribe({next:r=>this.demo.set(r.datos),error:()=>{}});
    this.formulario.controls.ruc.valueChanges.pipe(
      distinctUntilChanged(),
      switchMap(ruc=>{
        this.rucDatos.set(null);this.errorRuc.set('');this.formulario.controls.razonSocial.setValue('');this.consultando.set(false);
        if(!/^(10|20)[0-9]{9}$/.test(ruc))return of(null);
        this.consultando.set(true);
        return timer(350).pipe(switchMap(()=>this.api.consultarRuc(ruc)),catchError(e=>{this.errorRuc.set(mensajeDeError(e));return of(null);}));
      }),takeUntilDestroyed(this.destruir)
    ).subscribe(r=>{
      this.consultando.set(false);
      if(r){this.rucDatos.set(r.datos);this.formulario.patchValue({razonSocial:r.datos.razonSocial,tipoContribuyente:r.datos.ruc.startsWith('20')?'PERSONA_JURIDICA':'PERSONA_NATURAL'});}
    });
  }
  invalido(campo:string):boolean{const c=this.formulario.get(campo);return !!c&&c.invalid&&c.touched;}
  enviar():void{
    if(this.enviando())return;
    if(this.formulario.invalid||!this.rucDatos()){this.formulario.markAllAsTouched();this.error.set('Completa los campos y consulta un RUC válido antes de continuar.');return;}
    if(this.formulario.controls.correo.value.trim().toLowerCase()===this.sesion.correo().toLowerCase()){this.error.set('Usa otro correo para tu cuenta de negocio. Tu cuenta de cliente debe mantenerse independiente.');return;}
    this.enviando.set(true);this.error.set('');
    this.auth.registrarNegocio(this.formulario.getRawValue()).subscribe({
      next:()=>{this.creada.set(true);this.enviando.set(false);},
      error:e=>{this.error.set(mensajeDeError(e));this.enviando.set(false);},
    });
  }
}
