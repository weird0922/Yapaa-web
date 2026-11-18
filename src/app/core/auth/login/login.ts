import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Carrito } from '../../../carrito/carrito';
import { AuthApi } from '../auth-api';
import { Sesion } from '../sesion';
import { mensajeDeError } from '../../api/errores';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

  private fb = inject(FormBuilder);
  private authApi = inject(AuthApi);
  private sesion = inject(Sesion);
  private carrito = inject(Carrito);
  private router = inject(Router);
  private ruta = inject(ActivatedRoute);

  modo = signal(this.ruta.snapshot.queryParamMap.get('modo') === 'negocio' ? 'negocio' : 'cliente');
  demo = signal(false);
  ngOnInit(): void { this.authApi.demostracion().subscribe({ next:r=>this.demo.set(r.datos), error:()=>{} }); }
  cambiarModo(modo: string): void { this.modo.set(modo); }

  cargando = signal(false);
  error = signal('');

  formulario = this.fb.nonNullable.group({
    correo: ['', Validators.required],
    contrasena: ['', Validators.required],
  });

  retorno(): string {
    const valor = this.ruta.snapshot.queryParamMap.get('retorno') ?? '';
    return valor.startsWith('/') && !valor.startsWith('//') ? valor : '';
  }

  ingresar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    this.authApi.login(this.formulario.getRawValue()).subscribe({
      next: respuesta => {
        if (this.sesion.idCuenta() !== respuesta.datos.idCuenta) this.carrito.limpiar();
        this.sesion.iniciar(respuesta.datos);
        this.cargando.set(false);
        const destino = this.sesion.tieneRol('NEGOCIO') ? '/mi-negocio' : this.sesion.tieneRol('ADMIN') ? '/administracion' : this.retorno() || (this.modo() === 'negocio' ? '/afiliate' : '/catalogo');
        this.router.navigateByUrl(destino);
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(mensajeDeError(e));
        this.cargando.set(false);
      },
    });
  }

  usarPrueba(usuario: string): void {
    const claves: Record<string,string> = { cliente:'123', negocio:'1234', admin:'admin123' };
    this.modo.set(usuario === 'negocio' ? 'negocio' : 'cliente');
    this.formulario.setValue({correo:usuario,contrasena:claves[usuario]});
  }

  mostrarError(campo: string): boolean {
    const control = this.formulario.get(campo);
    return control !== null && control.invalid && control.touched;
  }
}
