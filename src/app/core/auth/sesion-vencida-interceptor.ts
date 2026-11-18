import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Sesion } from './sesion';

export const sesionVencidaInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const sesion = inject(Sesion);
  const router = inject(Router);

  return siguiente(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      const esAutenticacion = /\/auth\/(login|registro|demo)(?:[?]|$)/.test(peticion.url);
      if (error.status === 401 && !esAutenticacion && sesion.activa()) {
        sesion.cerrar();
        router.navigate(['/login'], { queryParams: { retorno: router.url } });
      }
      return throwError(() => error);
    }),
  );
};
