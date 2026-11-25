import { Service, signal } from '@angular/core';
import { DatosSesion } from '../../dominio/sesion';

const CLAVE = 'yapaa.sesion';

@Service()
export class Sesion {

  private datos = signal<DatosSesion | null>(this.recuperar());

  readonly sesion = this.datos.asReadonly();

  private recuperar(): DatosSesion | null {
    const guardado = localStorage.getItem(CLAVE);
    if (!guardado) {
      return null;
    }
    try {
      return JSON.parse(guardado) as DatosSesion;
    } catch {
      return null;
    }
  }

  iniciar(datos: DatosSesion): void {
    localStorage.setItem(CLAVE, JSON.stringify(datos));
    this.datos.set(datos);
  }

  cerrar(): void {
    localStorage.removeItem(CLAVE);
    sessionStorage.removeItem('yapaa.admin.acceso');
    this.datos.set(null);
  }

  activa(): boolean {
    const token = this.datos()?.token;
    if (!token) return false;
    try {
      const partes = token.split('.');
      const contenido = partes[1].replace(/-/g,'+').replace(/_/g,'/');
      const payload = JSON.parse(atob(contenido));
      return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
    } catch { return false; }
  }

  token(): string {
    return this.datos()?.token ?? '';
  }

  idCuenta(): number | null {
    return this.datos()?.idCuenta ?? null;
  }

  nombre(): string {
    return this.datos()?.nombres ?? 'Usuario YAPAA';
  }

  correo(): string {
    return this.datos()?.correo ?? '';
  }

  roles(): string[] {
    return this.datos()?.roles ?? [];
  }

  tieneRol(rol: string): boolean {
    return this.roles().includes(rol);
  }
}
