import { AbstractControl, ValidationErrors } from '@angular/forms';

export function noVacio(control: AbstractControl): ValidationErrors | null {
  const valor = String(control.value ?? '').trim();
  return valor.length === 0 ? { vacio: true } : null;
}
