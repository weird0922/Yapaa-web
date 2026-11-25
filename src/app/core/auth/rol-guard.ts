import { AuthApi } from './auth-api';
import { map,catchError,of } from 'rxjs';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Sesion } from './sesion';
export const administradorGuard:CanActivateFn=()=>{
 const s=inject(Sesion),r=inject(Router),api=inject(AuthApi),n=r.getCurrentNavigation();
 const anterior=n?.previousNavigation?.finalUrl?.toString()??'';
 const permitido=s.activa()&&s.tieneRol('ADMIN')&&n?.extras.state?.['accesoAdministrador']===true&&n.trigger==='imperative'&&(anterior.startsWith('/login')||anterior.startsWith('/administracion'));
 const rechazar=()=>{s.cerrar();return r.createUrlTree(['/catalogo']);};
 if(!permitido)return rechazar();
 return api.actualizarSesion().pipe(map(respuesta=>{if(!respuesta.datos.roles.includes('ADMIN'))return rechazar();s.iniciar(respuesta.datos);return true;}),catchError(()=>of(rechazar())));
};
export const negocioGuard:CanActivateFn=()=>{const s=inject(Sesion),r=inject(Router);return s.activa()&&s.tieneRol('NEGOCIO')?true:r.createUrlTree(['/afiliate']);};
export const catalogoGuard:CanActivateFn=()=>{const s=inject(Sesion),r=inject(Router);return s.activa()&&s.tieneRol('NEGOCIO')&&!s.tieneRol('ADMIN')?r.createUrlTree(['/mi-negocio']):true;};
export const clienteGuard:CanActivateFn=(_ruta,estado)=>{const s=inject(Sesion),r=inject(Router);if(!s.activa())return r.createUrlTree(['/login'],{queryParams:{retorno:estado.url}});if(s.tieneRol('NEGOCIO'))return r.createUrlTree(['/mi-negocio']);return s.tieneRol('CLIENTE')?true:r.createUrlTree(['/administracion']);};
