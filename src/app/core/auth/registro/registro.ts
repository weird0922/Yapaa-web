import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CampoClave } from '../campo-clave';
import { VerificarCorreo } from '../verificar-correo';
import { clavesIguales, claveSegura, nombrePersona, mensajeClave } from '../../formularios/registro-validadores';
import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthApi } from '../auth-api';
import { Sesion } from '../sesion';
import { mensajeDeError } from '../../api/errores';
import { noVacio } from '../../formularios/validadores';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink,CampoClave,VerificarCorreo],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {

  private fb = inject(FormBuilder);
  private authApi = inject(AuthApi);
  private sesion = inject(Sesion);
  private router = inject(Router);
  readonly ruta = inject(ActivatedRoute);

  cargando = signal(false);
  error = signal('');
  correoVerificado=signal(false);

  formulario = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required,claveSegura]],
    confirmarContrasena:['',Validators.required],tokenVerificacion:['',Validators.required],
    nombres: ['', [noVacio,Validators.minLength(2),Validators.maxLength(100),Validators.pattern(nombrePersona)]],
    apellidos: ['', [noVacio,Validators.minLength(2),Validators.maxLength(100),Validators.pattern(nombrePersona)]],
    telefono: ['', [noVacio, Validators.pattern(/^9[0-9]{8}$/)]],
  },{validators:clavesIguales});

  constructor(){this.formulario.valueChanges.pipe(takeUntilDestroyed()).subscribe(()=>this.error.set(''));}
  verificarCorreo(token:string):void{
    this.formulario.controls.tokenVerificacion.setValue(token);
    this.correoVerificado.set(Boolean(token));
    if(!token){this.formulario.controls.contrasena.reset('');this.formulario.controls.confirmarContrasena.reset('');}
    this.error.set('');
  }
  private errorFormulario():string{
    const c=this.formulario.controls;
    if(c.correo.invalid)return 'Ingresa un correo válido.';
    if(!c.tokenVerificacion.value)return 'Verifica tu correo antes de crear la cuenta.';
    if(c.contrasena.invalid)return mensajeClave(c.contrasena.value);
    if(c.confirmarContrasena.invalid)return 'Confirma tu contraseña.';
    if(this.formulario.hasError('clavesDistintas'))return 'Las contraseñas no coinciden.';
    if(c.nombres.invalid)return 'Revisa tus nombres: usa letras, espacios, apóstrofes o guiones.';
    if(c.apellidos.invalid)return 'Revisa tus apellidos: usa letras, espacios, apóstrofes o guiones.';
    if(c.telefono.invalid)return 'Ingresa un celular de 9 dígitos que empiece con 9.';
    return 'Revisa los campos indicados antes de continuar.';
  }
  registrar(): void {
    if(this.cargando())return;
    if(!this.correoVerificado()){this.formulario.controls.correo.markAsTouched();this.error.set('Verifica tu correo para continuar con el registro.');return;}
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.error.set(this.errorFormulario());
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    const valores = this.formulario.getRawValue();
    this.authApi.registro({ ...valores, rol: 'CLIENTE' }).subscribe({
      next: respuesta => {
        this.sesion.iniciar(respuesta.datos);
        this.cargando.set(false);
        const retorno=this.ruta.snapshot.queryParamMap.get('retorno');
        this.router.navigateByUrl(retorno?.startsWith('/') && !retorno.startsWith('//') ? retorno : this.ruta.snapshot.queryParamMap.get('modo') === 'negocio' ? '/afiliate' : '/catalogo');
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(mensajeDeError(e));
        this.cargando.set(false);
      },
    });
  }

  mostrarError(campo: string): boolean {
    const control = this.formulario.get(campo);
    return control !== null && control.invalid && control.touched;
  }
}
