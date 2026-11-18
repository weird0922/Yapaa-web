import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Sesion } from './sesion';

export const tokenInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const sesion = inject(Sesion);
  const token = sesion.token();

  if (token.length > 0) {
    return siguiente(
      peticion.clone({ setHeaders: { Authorization: `Bearer ${token}` } }),
    );
  }
  return siguiente(peticion);
};
