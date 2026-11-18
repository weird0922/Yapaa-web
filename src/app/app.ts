import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Encabezado } from './core/layout/encabezado/encabezado';

@Component({
  selector: 'app-root',
  imports: [Encabezado, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
