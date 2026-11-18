import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Sesion } from '../core/auth/sesion';
@Component({selector:'app-perfil',imports:[RouterLink],templateUrl:'./perfil.html',styleUrl:'./cuenta.css'})
export class Perfil {readonly sesion=inject(Sesion);}
