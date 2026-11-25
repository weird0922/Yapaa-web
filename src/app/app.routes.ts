import { Routes } from '@angular/router';
import { Login } from './core/auth/login/login';

import { sesionGuard } from './core/auth/sesion-guard';
import { ListaProductos } from './catalogo/lista-productos/lista-productos';
import { DetalleProducto } from './catalogo/detalle-producto/detalle-producto';
import { ListaNegocios } from './negocios/lista-negocios/lista-negocios';
import { DetalleNegocio } from './negocios/detalle-negocio/detalle-negocio';

import { ListaPedidos } from './pedidos/lista-pedidos/lista-pedidos';
import { DetallePedido } from './pedidos/detalle-pedido/detalle-pedido';



import { Afiliacion } from './cuenta/afiliacion';
import { administradorGuard, negocioGuard, catalogoGuard, clienteGuard } from './core/auth/rol-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'catalogo', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registro', loadComponent:()=>import('./core/auth/registro/registro').then(m=>m.Registro) },
  { path: 'perfil', loadComponent:()=>import('./cuenta/perfil').then(m=>m.Perfil), canActivate: [clienteGuard] },
  { path: 'afiliate', component: Afiliacion },
  { path: 'mi-negocio', loadComponent:()=>import('./cuenta/panel-negocio').then(m=>m.PanelNegocio), canActivate: [sesionGuard, negocioGuard] },
  { path: 'administracion/negocios/:id', loadComponent:()=>import('./cuenta/dashboard-negocio').then(m=>m.DashboardNegocio), canActivate:[administradorGuard] },
  { path: 'administracion', loadComponent:()=>import('./cuenta/dashboard').then(m=>m.Dashboard), canActivate: [administradorGuard] },
  { path: 'catalogo', component: ListaProductos, canActivate: [catalogoGuard] },
  { path: 'producto/:id', component: DetalleProducto, canActivate: [catalogoGuard] },
  { path: 'negocios', component: ListaNegocios, canActivate: [catalogoGuard] },
  { path: 'negocios/:id', component: DetalleNegocio, canActivate: [catalogoGuard] },
  { path: 'carrito', loadComponent:()=>import('./carrito/lista-carrito/lista-carrito').then(m=>m.ListaCarrito), canActivate: [clienteGuard] },
  { path: 'pedidos', component: ListaPedidos, canActivate: [clienteGuard] },
  { path: 'pedidos/:id', component: DetallePedido, canActivate: [clienteGuard] },
  { path: '**', redirectTo: 'catalogo' },
];
