import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Resultado } from '../api/resultado';
import { DatosSesion } from '../../dominio/sesion';

export interface PeticionLogin {
  correo: string;
  contrasena: string;
}

export interface PeticionRegistro {
  confirmarContrasena:string;tokenVerificacion:string;
  correo: string;
  contrasena: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  rol: string;
}

@Service()
export class AuthApi {

  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/auth`;

  registrarNegocio(datos: import('../../negocios/negocios-api').RegistroNegocio): Observable<Resultado<DatosSesion>> {
    return this.http.post<Resultado<DatosSesion>>(`${this.url}/registro-negocio`, datos);
  }

  actualizarSesion(): Observable<Resultado<DatosSesion>> {
    return this.http.get<Resultado<DatosSesion>>(`${this.url}/sesion`);
  }

  demostracion(): Observable<Resultado<boolean>> {
    return this.http.get<Resultado<boolean>>(`${this.url}/demo`);
  }

  login(peticion: PeticionLogin): Observable<Resultado<DatosSesion>> {
    return this.http.post<Resultado<DatosSesion>>(`${this.url}/login`, peticion);
  }

  registro(peticion: PeticionRegistro): Observable<Resultado<DatosSesion>> {
    return this.http.post<Resultado<DatosSesion>>(`${this.url}/registro`, peticion);
  }
}
