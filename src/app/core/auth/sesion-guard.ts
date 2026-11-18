import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Sesion } from './sesion';
export const sesionGuard: CanActivateFn = (_ruta, estado) => {
  const sesion=inject(Sesion); const router=inject(Router);
  return sesion.activa() ? true : router.createUrlTree(['/login'],{ queryParams:{ retorno:estado.url } });
};
