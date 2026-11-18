import { Routes } from '@angular/router';
import { Login } from './core/auth/login/login';
import { Registro } from './core/auth/registro/registro';
import { sesionGuard } from './core/auth/sesion-guard';
import { ListaProductos } from './catalogo/lista-productos/lista-productos';
import { DetalleProducto } from './catalogo/detalle-producto/detalle-producto';
import { ListaNegocios } from './negocios/lista-negocios/lista-negocios';
import { DetalleNegocio } from './negocios/detalle-negocio/detalle-negocio';
import { ListaCarrito } from './carrito/lista-carrito/lista-carrito';
import { ListaPedidos } from './pedidos/lista-pedidos/lista-pedidos';
import { DetallePedido } from './pedidos/detalle-pedido/detalle-pedido';

import { PanelNegocio } from './cuenta/panel-negocio';
import { Perfil } from './cuenta/perfil';
import { Afiliacion } from './cuenta/afiliacion';
import { Administracion } from './cuenta/administracion';
import { administradorGuard, negocioGuard, catalogoGuard, clienteGuard } from './core/auth/rol-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'catalogo', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'perfil', component: Perfil, canActivate: [clienteGuard] },
  { path: 'afiliate', component: Afiliacion },
  { path: 'mi-negocio', component: PanelNegocio, canActivate: [sesionGuard, negocioGuard] },
  { path: 'administracion', component: Administracion, canActivate: [sesionGuard, administradorGuard] },
  { path: 'catalogo', component: ListaProductos, canActivate: [catalogoGuard] },
  { path: 'producto/:id', component: DetalleProducto, canActivate: [catalogoGuard] },
  { path: 'negocios', component: ListaNegocios, canActivate: [catalogoGuard] },
  { path: 'negocios/:id', component: DetalleNegocio, canActivate: [catalogoGuard] },
  { path: 'carrito', component: ListaCarrito, canActivate: [clienteGuard] },
  { path: 'pedidos', component: ListaPedidos, canActivate: [clienteGuard] },
  { path: 'pedidos/:id', component: DetallePedido, canActivate: [clienteGuard] },
  { path: '**', redirectTo: 'catalogo' },
];
