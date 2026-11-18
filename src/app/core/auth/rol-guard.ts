import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Sesion } from './sesion';
export const administradorGuard:CanActivateFn=()=>{const s=inject(Sesion),r=inject(Router);return s.activa()&&s.tieneRol('ADMIN')?true:r.createUrlTree([s.tieneRol('NEGOCIO')?'/mi-negocio':'/catalogo']);};
export const negocioGuard:CanActivateFn=()=>{const s=inject(Sesion),r=inject(Router);return s.activa()&&s.tieneRol('NEGOCIO')?true:r.createUrlTree(['/afiliate']);};
export const catalogoGuard:CanActivateFn=()=>{const s=inject(Sesion),r=inject(Router);return s.activa()&&s.tieneRol('NEGOCIO')&&!s.tieneRol('ADMIN')?r.createUrlTree(['/mi-negocio']):true;};
export const clienteGuard:CanActivateFn=(_ruta,estado)=>{const s=inject(Sesion),r=inject(Router);if(!s.activa())return r.createUrlTree(['/login'],{queryParams:{retorno:estado.url}});if(s.tieneRol('NEGOCIO'))return r.createUrlTree(['/mi-negocio']);return s.tieneRol('CLIENTE')?true:r.createUrlTree(['/administracion']);};
