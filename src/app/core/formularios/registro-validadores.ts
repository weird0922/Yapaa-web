import { AbstractControl, ValidationErrors } from '@angular/forms';
export function clavesIguales(c:AbstractControl):ValidationErrors|null{return c.get('contrasena')?.value===c.get('confirmarContrasena')?.value?null:{clavesDistintas:true};}
export function mensajeClave(valor:unknown):string{
 const v=String(valor??'');
 if(!v.length)return 'Ingresa una contraseña.';
 if(v.length<10)return 'La contraseña debe tener al menos 10 caracteres.';
 if(v.length>64)return 'La contraseña no debe superar 64 caracteres.';
 if(new TextEncoder().encode(v).length>72)return 'La contraseña es demasiado larga. Usa una frase más corta.';
 if(/[\x00-\x1f\x7f]/.test(v))return 'La contraseña contiene caracteres no permitidos.';
 if(!v.trim())return 'La contraseña no puede contener solo espacios.';
 return '';
}
export function claveSegura(c:AbstractControl):ValidationErrors|null{return mensajeClave(c.value)?{claveInvalida:true}:null;}
export const nombrePersona=/^[\p{L}\p{M}]+(?:[ '’-][\p{L}\p{M}]+)*$/u;
