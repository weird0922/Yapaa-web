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
  imports: [ReactiveFormsModule, RouterLink],
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

  formulario = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(6)]],
    nombres: ['', noVacio],
    apellidos: ['', noVacio],
    telefono: ['', [noVacio, Validators.pattern(/^[0-9]{9}$/)]],
  });

  registrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
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
